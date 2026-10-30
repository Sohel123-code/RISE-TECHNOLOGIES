import React, { createElement as h, createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import template from './template.json';
import './template.css';
import './styles.css';

// Original markup, classes, text, inline styles and assets are preserved.
// This layer restores React interactions without redesigning the template.
const ServiceContext = createContext(null);
const ItemContext = createContext(null);
const FaqContext = createContext(null);
const NavContext = createContext(null);
const has = (node, name) => (node.props.className || '').split(' ').includes(name);
const childrenOf = node => node.children.map((child, i) => typeof child === 'string' ? child : <TemplateNode key={child.key || i} node={child}/>);

function ServiceGroup({node}) {
  const [active, setActive] = useState(0);
  return <ServiceContext.Provider value={{active,setActive}}><Element node={node}/></ServiceContext.Provider>;
}
function ServiceItem({node}) {
  const group = useContext(ServiceContext);
  const open = group.active === node.index;
  const toggle = () => group.setActive(open ? null : node.index);
  const base = node.props.className.replace(/framer-v-\S+/g,'');
  const variant = node.phone ? (open ? 'framer-v-10t9mj5' : 'framer-v-1deyhln') : (open ? 'framer-v-19vcvkh' : 'framer-v-14qc7mo');
  const props = {className:`${base} ${variant}`, tabIndex:undefined, 'data-framer-name':open?'Opened':'Closed', style:{...node.props.style,backgroundColor:open?'rgb(18,18,18)':'rgba(18,18,18,0)'}};
  return <ItemContext.Provider value={{open,toggle,id:`service-${node.key}`}}><Element node={node} override={props}/></ItemContext.Provider>;
}
function FaqItem({node}) {
  const [open, setOpen] = useState(false);
  const className = node.props.className.replace(/framer-v-\S+/g,open?'framer-v-5jmr8o':'framer-v-p3lmfz');
  return <FaqContext.Provider value={{open,toggle:()=>setOpen(v=>!v),id:`faq-${node.key}`}}><Element node={node} override={{className,tabIndex:undefined,'data-framer-name':open?'Opened':'Closed'}}/></FaqContext.Provider>;
}
function Navigation({node}) {
  const [open,setOpen] = useState(false);
  const phone = has(node,'framer-v-hjvsdp');
  useEffect(()=>{if(!open)return; const close=e=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
  return <NavContext.Provider value={{open,setOpen,phone}}><Element node={node}/></NavContext.Provider>;
}
function activateWithKeyboard(event, action) {
  if(event.key==='Enter'||event.key===' ') {event.preventDefault();action();}
}

function Element({node,override={}}) {
  const ref=useRef(null);
  const item=useContext(ItemContext), faq=useContext(FaqContext), nav=useContext(NavContext);
  const props={...node.props,...override};
  props.style={...node.props.style,...override.style};
  let children=childrenOf(node);
  if(node.reveal)props.className=(props.className||'')+' template-reveal';
  useEffect(()=>{
    if(!node.reveal)return;
    const el=ref.current;
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){el.classList.add('template-visible');observer.disconnect();}},{threshold:.06});
    observer.observe(el);return()=>observer.disconnect();
  },[node]);
  if(node.letter!==undefined){props.className=(props.className||'')+' rise-letter';props.style['--letter-index']=node.letter;}
  if(has(node,'framer-a3lt4s')&&item){
    Object.assign(props,{role:'button',tabIndex:0,'aria-expanded':item.open,'aria-controls':item.id,onClick:item.toggle,onKeyDown:e=>activateWithKeyboard(e,item.toggle)});
  }
  if(has(node,'framer-1q94b8m')&&item){Object.assign(props,{id:item.id,'aria-hidden':!item.open,inert:!item.open});props.style.opacity=item.open?1:0;}
  if(has(node,'framer-1mq8hxg')&&item)props.style.transform=item.open?'rotate(45deg)':'rotate(0deg)';
  if(has(node,'framer-15oljsn')&&faq)Object.assign(props,{role:'button',tabIndex:0,id:`${faq.id}-question`,'aria-expanded':faq.open,'aria-controls':faq.id,onClick:faq.toggle,onKeyDown:e=>activateWithKeyboard(e,faq.toggle)});
  if(has(node,'framer-frwk85')&&faq){Object.assign(props,{id:faq.id,role:'region','aria-labelledby':`${faq.id}-question`,'aria-hidden':!faq.open,inert:!faq.open});props.style.opacity=faq.open?1:0;}
  if(has(node,'framer-1yteqnc')&&faq)props.style.transform=faq.open?'rotate(45deg)':'none';
  if(has(node,'framer-s8wikm')&&nav){
    children.unshift(<a className="template-brand" href="#" aria-label="RISE home" key="rise-logo"><img src="/rise-logo.svg" width="124" height="31" alt="RISE — Results. Innovation. Solutions. Engineering."/></a>);
    if(nav.phone && nav.open)children.push(<div className="template-mobile-links" id="mobile-links" key="mobile-links"><a href="#who-we-are" onClick={()=>nav.setOpen(false)}>About us</a><a href="#services" onClick={()=>nav.setOpen(false)}>Services</a><a href="#how-we-work" onClick={()=>nav.setOpen(false)}>Our Process</a><a className="mobile-book" href="https://tidy-airport-868077.framer.app/book-a-call">Book a free call</a></div>);
  }
  if(has(node,'framer-igo78h')&&nav)Object.assign(props,{'aria-label':nav.open?'Close navigation menu':'Open navigation menu','aria-expanded':nav.open,'aria-controls':'mobile-links',onClick:()=>nav.setOpen(v=>!v)});
  if(has(node,'framer-1ahgtuo')&&nav&&nav.open)children=[<p key="close" className="framer-text" style={{fontSize:14,color:'#fff'}}>Close</p>];
  if(has(node,'framer-1wuwnmh')){children.push(<HeroMotion key="green-wave"/>);props.tabIndex=undefined;}
  if(node.tag==='button'&&!props.onClick){props.type='button';props.tabIndex=-1;}
  if(has(node,'framer-a9i7x9')||has(node,'framer-1ow1dm0'))props['aria-hidden']=true;
  props.ref=ref;
  if(['img','input','br','hr'].includes(node.tag))return h(node.tag,props);
  return h(node.tag,props,...children);
}
function TemplateNode({node}) {
  if(node.kind==='services')return <ServiceGroup node={node}/>;
  if(node.kind==='service')return <ServiceItem node={node}/>;
  if(node.kind==='faq')return <FaqItem node={node}/>;
  if(node.kind==='nav')return <Navigation node={node}/>;
  return <Element node={node}/>;
}

function HeroMotion() {
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current, image=canvas.parentElement.querySelector('img');
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    if(!image)return;
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
    if(!gl)return;
    let frame=0,visible=true,ready=false,disposed=false,last=0,time=0;
    function shader(type,source){const result=gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);if(!gl.getShaderParameter(result,gl.COMPILE_STATUS)){gl.deleteShader(result);return null;}return result;}
    const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
    const fragment=shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform sampler2D artwork;uniform vec2 viewport;uniform vec2 sourceSize;uniform float time;
      void main(){vec2 p=uv;float screenRatio=viewport.x/viewport.y;float imageRatio=sourceSize.x/sourceSize.y;
        if(screenRatio>imageRatio)p.y=(p.y-.5)*(imageRatio/screenRatio)+.5;else p.x=(p.x-.5)*(screenRatio/imageRatio)+.5;
        float lower=1.-smoothstep(.36,.68,p.y);float strength=lower*.006*min(time*.4,1.);
        vec2 flow=vec2(sin(p.y*15.+time*.32)*strength, sin(p.x*13.+time*.43)*strength+cos(p.x*8.-time*.25)*strength*.5);
        gl_FragColor=texture2D(artwork,clamp(p+flow,.001,.999));}`);
    if(!vertex||!fragment)return;
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const clock=gl.getUniformLocation(program,'time'),viewport=gl.getUniformLocation(program,'viewport'),size=gl.getUniformLocation(program,'sourceSize');
    function draw(){if(!ready||disposed)return;gl.uniform1f(clock,preference.matches?0:time);gl.drawArrays(gl.TRIANGLES,0,6);}
    function resize(){if(!canvas.clientWidth)return;canvas.width=Math.min(canvas.clientWidth,1920);canvas.height=Math.round(canvas.clientHeight*(canvas.width/canvas.clientWidth));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(viewport,canvas.width,canvas.height);draw();}
    function load(){if(disposed||!image.naturalWidth)return;gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform2f(size,image.naturalWidth,image.naturalHeight);ready=true;resize();canvas.style.opacity='1';}
    function tick(now){frame=requestAnimationFrame(tick);if(!visible||document.hidden||preference.matches){last=now;return;}if(now-last<(innerWidth<810?50:33))return;time+=Math.min(now-last,60)/1000;last=now;draw();}
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    const visibility=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});visibility.observe(canvas);
    image.addEventListener('load',load);if(image.complete)load();
    preference.addEventListener('change',draw);frame=requestAnimationFrame(tick);
    const lost=e=>{e.preventDefault();canvas.style.opacity='0';cancelAnimationFrame(frame);};canvas.addEventListener('webglcontextlost',lost);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();image.removeEventListener('load',load);preference.removeEventListener('change',draw);canvas.removeEventListener('webglcontextlost',lost);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);};
  },[]);
  return <canvas ref={ref} className="original-green-motion" aria-hidden="true"/>;
}

createRoot(document.getElementById('root')).render(<>{template.map(node=><TemplateNode key={node.key} node={node}/>)}</>);
