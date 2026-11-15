// Local fluid solver: advection, pressure projection and vorticity confinement.
// Method: https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu
// RISE palette; movement reference: the supplied November 15 recording.
const vertex=`#version 300 es
layout(location=0) in vec2 position;
out vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const header=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 uv;
out vec4 result;
uniform vec2 texel;
`;
const fragments={
  splat:`uniform sampler2D source;uniform vec2 point;uniform vec3 impulse;uniform float aspect;uniform float radius;
    void main(){vec2 p=uv-point;p.x*=aspect;float ink=exp(-dot(p,p)/radius);
    result=vec4(texture(source,uv).xyz+impulse*ink,1.);}`,
  advect:`uniform sampler2D source;uniform sampler2D velocity;uniform float dt;uniform float decay;
    void main(){vec2 p=uv-dt*texture(velocity,uv).xy*texel;
    result=texture(source,p)*exp(-decay*abs(dt));}`,
  curl:`uniform sampler2D velocity;
    void main(){float l=texture(velocity,uv-vec2(texel.x,0)).y;float r=texture(velocity,uv+vec2(texel.x,0)).y;
    float b=texture(velocity,uv-vec2(0,texel.y)).x;float t=texture(velocity,uv+vec2(0,texel.y)).x;
    result=vec4(.5*(r-l-t+b),0,0,1);}`,
  vorticity:`uniform sampler2D velocity;uniform sampler2D curl;uniform float dt;
    void main(){float l=abs(texture(curl,uv-vec2(texel.x,0)).x);float r=abs(texture(curl,uv+vec2(texel.x,0)).x);
    float b=abs(texture(curl,uv-vec2(0,texel.y)).x);float t=abs(texture(curl,uv+vec2(0,texel.y)).x);
    vec2 force=.5*vec2(t-b,r-l);force/=length(force)+.0001;
    force*=25.*texture(curl,uv).x;force.y*=-1.;
    result=vec4(clamp(texture(velocity,uv).xy+force*dt,vec2(-1200),vec2(1200)),0,1);}`,
  divergence:`uniform sampler2D velocity;
    void main(){vec2 v=texture(velocity,uv).xy;
    float l=texture(velocity,uv-vec2(texel.x,0)).x;float r=texture(velocity,uv+vec2(texel.x,0)).x;
    float b=texture(velocity,uv-vec2(0,texel.y)).y;float t=texture(velocity,uv+vec2(0,texel.y)).y;
    if(uv.x<texel.x)l=-v.x;if(uv.x>1.-texel.x)r=-v.x;
    if(uv.y<texel.y)b=-v.y;if(uv.y>1.-texel.y)t=-v.y;
    result=vec4(.5*(r-l+t-b),0,0,1);}`,
  pressure:`uniform sampler2D source;uniform sampler2D divergence;
    void main(){float l=texture(source,uv-vec2(texel.x,0)).x;float r=texture(source,uv+vec2(texel.x,0)).x;
    float b=texture(source,uv-vec2(0,texel.y)).x;float t=texture(source,uv+vec2(0,texel.y)).x;
    result=vec4((l+r+b+t-texture(divergence,uv).x)*.25,0,0,1);}`,
  project:`uniform sampler2D pressure;uniform sampler2D velocity;
    void main(){float l=texture(pressure,uv-vec2(texel.x,0)).x;float r=texture(pressure,uv+vec2(texel.x,0)).x;
    float b=texture(pressure,uv-vec2(0,texel.y)).x;float t=texture(pressure,uv+vec2(0,texel.y)).x;
    result=vec4(texture(velocity,uv).xy-vec2(r-l,t-b),0,1);}`,
  display:`uniform sampler2D density;uniform float fade;
    void main(){float d=max(0.,texture(density,uv).x);
    float l=texture(density,uv-vec2(texel.x,0)).x;float r=texture(density,uv+vec2(texel.x,0)).x;
    float b=texture(density,uv-vec2(0,texel.y)).x;float t=texture(density,uv+vec2(0,texel.y)).x;
    vec3 normal=normalize(vec3((l-r)*2.,(b-t)*2.,.3));
    float light=clamp(dot(normal,normalize(vec3(-.45,.6,1.))),0.,1.);
    vec3 color=mix(vec3(.24,.37,.14),vec3(.78,.867,.659),.35+.65*light);
    float alpha=(1.-exp(-d*1.5))*fade;
    result=vec4(color*alpha,alpha);}`,
};

export function smokeResolution(width,height,shortSide,maxPixels){
  const ratio=Math.min(shortSide/Math.max(1,Math.min(width,height)),Math.sqrt(maxPixels/Math.max(1,width*height)));
  return [Math.max(2,Math.round(width*ratio)),Math.max(2,Math.round(height*ratio))];
}

export function createFluidSmoke(canvas,initialWidth=window.innerWidth,initialHeight=window.innerHeight){
  let gl;
  try{gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});}catch{return null;}
  if(!gl||!gl.getExtension('EXT_color_buffer_float'))return null;
  const programs={},shaders=[],targets=new Set();let quad=null,vao=null,velocity,density,pressure,curl,divergence,width=1,height=1,disposed=false;
  function destroyTarget(target){gl.deleteTexture(target.texture);gl.deleteFramebuffer(target.framebuffer);targets.delete(target);}
  function destroy(){if(disposed)return;disposed=true;targets.forEach(destroyTarget);Object.values(programs).forEach(p=>gl.deleteProgram(p.id));shaders.forEach(s=>gl.deleteShader(s));if(quad)gl.deleteBuffer(quad);if(vao)gl.deleteVertexArray(vao);}
  function compile(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Fluid shader unavailable');return s;}
  function target(w,h,filter){
    const texture=gl.createTexture(),framebuffer=gl.createFramebuffer(),item={texture,framebuffer,width:w,height:h};targets.add(item);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,w,h,0,gl.RGBA,gl.HALF_FLOAT,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Fluid framebuffer unavailable');
    gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT);return item;
  }
  function pair(w,h,filter){return {read:target(w,h,filter),write:target(w,h,filter),swap(){[this.read,this.write]=[this.write,this.read];}};}
  function pass(name,destination,values){
    const p=programs[name];gl.useProgram(p.id);gl.bindVertexArray(vao);let unit=0;
    for(const [key,value] of Object.entries(values)){
      const location=p.uniforms[key]??(p.uniforms[key]=gl.getUniformLocation(p.id,key));
      if(value?.texture){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,value.texture);gl.uniform1i(location,unit++);}
      else if(Array.isArray(value)){if(value.length===2)gl.uniform2f(location,...value);else gl.uniform3f(location,...value);}
      else gl.uniform1f(location,value);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,destination?.framebuffer||null);gl.viewport(0,0,destination?.width||canvas.width,destination?.height||canvas.height);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function clear(){if(disposed)return;for(const t of targets){gl.bindFramebuffer(gl.FRAMEBUFFER,t.framebuffer);gl.clear(gl.COLOR_BUFFER_BIT);}gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clear(gl.COLOR_BUFFER_BIT);}
  function resize(w,h){
    if(disposed)return;width=Math.max(1,w);height=Math.max(1,h);targets.forEach(destroyTarget);
    const ratio=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(1600000/(width*height)));
    canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
    const [sw,sh]=smokeResolution(width,height,256,140000),[dw,dh]=smokeResolution(width,height,768,850000);
    velocity=pair(sw,sh,gl.LINEAR);pressure=pair(sw,sh,gl.NEAREST);curl=target(sw,sh,gl.NEAREST);divergence=target(sw,sh,gl.NEAREST);density=pair(dw,dh,gl.LINEAR);clear();
  }
  function splat(x,y,dx,dy,distance){
    if(disposed)return;
    const point=[x/width,1-y/height],aspect=width/height;
    const radius=Math.pow(Math.min(36,20+distance*.12)/height,2);
    const vx=Math.max(-900,Math.min(900,dx/width*velocity.read.width*22));
    const vy=Math.max(-900,Math.min(900,-dy/height*velocity.read.height*22));
    pass('splat',velocity.write,{source:velocity.read,point,aspect,radius,impulse:[vx,vy,0]});velocity.swap();
    pass('splat',density.write,{source:density.read,point,aspect,radius:radius*.7,impulse:[.55,0,0]});density.swap();
  }
  function step(dt,fade=1){
    if(disposed)return;dt=Math.min(dt,1/30);const texel=[1/velocity.read.width,1/velocity.read.height];
    pass('advect',velocity.write,{source:velocity.read,velocity:velocity.read,texel,dt,decay:.65});velocity.swap();
    pass('curl',curl,{velocity:velocity.read,texel});
    pass('vorticity',velocity.write,{velocity:velocity.read,curl,texel,dt});velocity.swap();
    pass('divergence',divergence,{velocity:velocity.read,texel});
    for(let i=0;i<16;i++){pass('pressure',pressure.write,{source:pressure.read,divergence,texel});pressure.swap();}
    pass('project',velocity.write,{pressure:pressure.read,velocity:velocity.read,texel});velocity.swap();
    pass('advect',density.write,{source:density.read,velocity:velocity.read,texel,dt,decay:.85});density.swap();
    pass('display',null,{density:density.read,texel:[1/density.read.width,1/density.read.height],fade});
  }
  try{
    gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);const v=compile(gl.VERTEX_SHADER,vertex);
    for(const [name,body] of Object.entries(fragments)){const id=gl.createProgram();programs[name]={id,uniforms:{}};gl.attachShader(id,v);gl.attachShader(id,compile(gl.FRAGMENT_SHADER,header+body));gl.linkProgram(id);if(!gl.getProgramParameter(id,gl.LINK_STATUS))throw new Error('Fluid renderer unavailable');}
    vao=gl.createVertexArray();gl.bindVertexArray(vao);quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    resize(initialWidth,initialHeight);return {splat,step,clear,resize,destroy};
  }catch{destroy();return null;}
}
