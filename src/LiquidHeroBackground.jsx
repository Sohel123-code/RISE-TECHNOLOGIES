import React,{useEffect,useRef} from 'react';
import {useAnimationGate} from './useAnimationGate';
import {liquidFragmentShader} from './liquidShader';
import './ambient-effects.css';

const vertexShader=`#version 300 es
in vec2 a_position;
void main(){gl_Position=vec4(a_position,0.,1.);}`;

export default function LiquidHeroBackground({variant='team',active=true}){
  const host=useRef(null),canvas=useRef(null),renderer=useRef(null);
  const {running}=useAnimationGate(host);
  const shouldRun=useRef(false);shouldRun.current=running&&active;
  useEffect(()=>{
    if(!window.WebGL2RenderingContext)return;
    const element=canvas.current,container=host.current;
    let gl;try{gl=element.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});}catch{return;}
    if(!gl)return;
    let program,buffer,shaders=[],frame=0,last=0,elapsed=variant==='team'?174:532,ratio=1,lost=false,disposed=false;
    const uniforms={};
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
    function release(){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));shaders=[];buffer=null;program=null;}
    function shader(type,source){
      const result=gl.createShader(type);shaders.push(result);gl.shaderSource(result,source);gl.compileShader(result);
      if(!gl.getShaderParameter(result,gl.COMPILE_STATUS))throw new Error('Shader unavailable');return result;
    }
    function initialize(){
      try{
        release();program=gl.createProgram();
        gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexShader));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,liquidFragmentShader));gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Renderer unavailable');
        gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const attribute=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
        for(const name of ['time','pixelRatio','resolution','scale','rotation','color1','color2','color3','proportion','softness','shape','shapeScale','distortion','swirl','swirlIterations'])uniforms[name]=gl.getUniformLocation(program,`u_${name}`);
        gl.uniform4f(uniforms.color1,6/255,8/255,6/255,1);
        gl.uniform4f(uniforms.color2,138/255,166/255,107/255,1);
        gl.uniform4f(uniforms.color3,18/255,30/255,15/255,1);
        for(const [key,value] of Object.entries({rotation:variant==='team'?-.2:.35,proportion:.4,softness:.94,shape:0,shapeScale:.38,distortion:.18,swirl:.78}))gl.uniform1f(uniforms[key],value);
        lost=false;resize();container.dataset.renderer='webgl';sync();
      }catch{stop();release();container.dataset.renderer='fallback';}
    }
    function draw(){if(!program||lost||disposed)return;gl.useProgram(program);gl.uniform1f(uniforms.time,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);}
    function resize(){
      if(!program||lost)return;
      const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight),phone=width<810;
      ratio=Math.min(window.devicePixelRatio||1,phone?1:1.25,Math.sqrt((phone?460000:1100000)/(width*height)));
      element.width=Math.max(1,Math.round(width*ratio));element.height=Math.max(1,Math.round(height*ratio));
      gl.viewport(0,0,element.width,element.height);gl.useProgram(program);gl.uniform2f(uniforms.resolution,element.width,element.height);gl.uniform1f(uniforms.pixelRatio,ratio);
      gl.uniform1f(uniforms.scale,phone ? .75 : .55);gl.uniform1f(uniforms.swirlIterations,phone?5:7);draw();
    }
    function tick(now){
      frame=0;if(!shouldRun.current||lost||disposed)return;
      if(!last||now-last>=1000/30){elapsed+=Math.min((now-last||16)/1000,.08)*.32;last=now;draw();}
      frame=requestAnimationFrame(tick);
    }
    function sync(){container.dataset.running=String(shouldRun.current&&!lost&&!!program);if(shouldRun.current&&!lost&&program&&!frame)frame=requestAnimationFrame(tick);else if(!shouldRun.current)stop();}
    function contextLost(event){event.preventDefault();lost=true;stop();container.dataset.renderer='fallback';container.dataset.running='false';}
    const observer=new ResizeObserver(resize);observer.observe(container);
    element.addEventListener('webglcontextlost',contextLost);element.addEventListener('webglcontextrestored',initialize);window.addEventListener('resize',resize);
    renderer.current={sync};initialize();
    return()=>{disposed=true;stop();observer.disconnect();window.removeEventListener('resize',resize);element.removeEventListener('webglcontextlost',contextLost);element.removeEventListener('webglcontextrestored',initialize);release();renderer.current=null;};
  },[variant]);
  useEffect(()=>{renderer.current?.sync();},[running,active]);
  return <div ref={host} className="liquid-hero-background" data-variant={variant} data-renderer="fallback" aria-hidden="true"><canvas ref={canvas}/><div className="liquid-hero-shade"/></div>;
}
