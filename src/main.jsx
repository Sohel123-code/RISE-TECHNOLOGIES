import React, { createElement as h, createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { homeTemplate } from './siteTemplate';
import { SiteHeader,SiteFooter,SITE_PAGES } from './SiteChrome';
import { useHomepageMotion } from './useHomepageMotion';
import { useScrollEntrance } from './useScrollEntrance';
import TeamPage from './TeamPage';
import ServicesPage from './ServicesPage';
import BookCallPage from './BookCallPage';
import { AnimatedTextRotator } from './AnimatedTextRotator';
import './template.css';
import './styles.css';
import './hero-animation.css';

// Original markup, classes, text, inline styles and assets are preserved.
// This layer restores React interactions without redesigning the template.
const ServiceContext = createContext(null);
const ItemContext = createContext(null);
const FaqContext = createContext(null);
const NavContext = createContext(null);
const has = (node, name) => (node.props.className || '').split(' ').includes(name);
// Animate content groups rather than whole tall sections, so every row can
// enter independently. Keep parent containers still to avoid nested movement.
const stationaryContainers=['framer-1caco7b','framer-1maxjl5','framer-90u7qm','framer-1xesv98'];
const scrollGroups=['framer-1m3o843','framer-shjbam','framer-pba7ad','framer-3qj5v9','framer-1k7awun',
  'framer-1k8bq51','framer-s0ovhr','framer-drrldx','framer-12skbcj','framer-a5wxms','framer-v7dm12',
  'framer-15lkh37','framer-hf6inj','framer-fsh42a','framer-3dm54p','framer-17tef2b'];
const scrollOrder={'framer-129t9ks':1,'framer-15i6jd2-container':1,'framer-1jwt5t4-container':2,'framer-r5ooly-container':3,
  'framer-3b7q2r-container':1,'framer-41fkde-container':2,'framer-s0ovhr':1,'framer-hf6inj':1,'framer-fsh42a':2,'framer-3dm54p':3};
const childrenOf = node => node.children.map((child, i) => typeof child === 'string' ? child : <TemplateNode key={child.key || i} node={child}/>);

function ServiceGroup({node}) {
  const [active, setActive] = useState(0);
  return <ServiceContext.Provider value={{active,setActive}}><Element node={node}/></ServiceContext.Provider>;
}
function ServiceItem({node}) {
  const group = useContext(ServiceContext);
  const open = group.active === node.index;
  const toggle = () => group.setActive(open ? null : node.index);
  const hover = event => {
    if(event.pointerType==='mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches)group.setActive(node.index);
  };
  const base = node.props.className.replace(/framer-v-\S+/g,'');
  const variant = node.phone ? (open ? 'framer-v-10t9mj5' : 'framer-v-1deyhln') : (open ? 'framer-v-19vcvkh' : 'framer-v-14qc7mo');
  const props = {className:`${base} ${variant}`, tabIndex:undefined, onPointerEnter:hover, 'data-framer-name':open?'Opened':'Closed', style:{...node.props.style,backgroundColor:open?'rgb(18,18,18)':'rgba(18,18,18,0)'}};
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
  useEffect(()=>{
    if(!open)return;
    const trigger=document.querySelector('[aria-controls="mobile-links"]');
    const close=e=>{if(e.key==='Escape'){setOpen(false);trigger?.focus();}};
    const outside=e=>{if(!e.target.closest?.('.framer-v-hjvsdp'))setOpen(false);};
    const resize=()=>{if(window.innerWidth>=810)setOpen(false);};
    window.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);
    return()=>{window.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
  },[open]);
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
  if(/^https:\/\/tidy-airport-868077\.framer\.app\/book-a-call\/?$/.test(props.href||'')){props.href='/book-a-call';delete props.target;}
  if(props.href==='/book-a-call'&&/^\/book-a-call(?:\/|$)/.test(window.location.pathname))props['aria-current']='page';
  let children=childrenOf(node);
  if(has(node,'framer-hakzju'))children=[<AnimatedTextRotator key="hero-rotator"/>,<p key="hero-support" className="hero-support-copy">We help students learn, build and present projects — and create custom solutions for everyday business needs.</p>];
  if((node.reveal&&!stationaryContainers.some(name=>has(node,name)))||scrollGroups.some(name=>has(node,name))){
    props['data-scroll-rise']='';
    props['data-scroll-order']=Object.entries(scrollOrder).find(([name])=>has(node,name))?.[1]||0;
  }
  if(['framer-B5Esz','framer-3mexk4','framer-129t9ks'].some(name=>has(node,name))){props['data-motion-card']='';props.className=(props.className||'')+' motion-card';}
  if(has(node,'framer-3NEo4')||has(node,'framer-auvqy'))props['data-magnetic']='';
  if(node.props['data-code-component-plugin-id']==='84d4c1'){props.role='img';props['aria-label']='RISE';}
  if(node.props.style?.flexDirection==='column' && /^translateY\(-\d+px\)$/.test(node.props.style?.transform||'') && node.children.length===8 && node.children.every(child=>typeof child==='object'&&child.tag==='span')){
    props['data-letter-reel']='';props['aria-hidden']=true;props.style['--reel-end']=node.props.style.transform;
    props.style['--reel-delay']=`${Math.max(0,'RISE'.indexOf(node.children[0].children[0]))*110}ms`;
  }
  if(node.letter!==undefined){props.className=(props.className||'')+' rise-letter';props.style['--letter-index']=node.letter;}
  if(has(node,'framer-a3lt4s')&&item){
    Object.assign(props,{role:'button',tabIndex:0,'aria-expanded':item.open,'aria-controls':item.id,onClick:item.toggle,onKeyDown:e=>activateWithKeyboard(e,item.toggle)});
  }
  if(has(node,'framer-1q94b8m')&&item){Object.assign(props,{id:item.id,'aria-hidden':!item.open,inert:!item.open});props.style.opacity=item.open?1:0;}
  if(has(node,'framer-1qyq027')&&item)props.className+=' smooth-service-content';
  if(has(node,'framer-ww6gvx')&&faq)props.className+=' smooth-faq-content';
  if(has(node,'framer-1mq8hxg')&&item)props.style.transform=item.open?'rotate(45deg)':'rotate(0deg)';
  if(has(node,'framer-15oljsn')&&faq)Object.assign(props,{role:'button',tabIndex:0,id:`${faq.id}-question`,'aria-expanded':faq.open,'aria-controls':faq.id,onClick:faq.toggle,onKeyDown:e=>activateWithKeyboard(e,faq.toggle)});
  if(has(node,'framer-frwk85')&&faq){Object.assign(props,{id:faq.id,role:'region','aria-labelledby':`${faq.id}-question`,'aria-hidden':!faq.open,inert:!faq.open});props.style.opacity=faq.open?1:0;}
  if(has(node,'framer-1yteqnc')&&faq)props.style.transform=faq.open?'rotate(45deg)':'none';
  if(has(node,'framer-u8nkwu')&&nav)children=SITE_PAGES.map(page=><a key={page.href} className="site-page-link" href={page.href} aria-current={(window.location.pathname.replace(/\/$/,'')===(page.href==='/'?'':page.href))?'page':undefined}>{page.label}</a>);
  if(has(node,'framer-s8wikm')&&nav){
    children.unshift(<a className="template-brand" href="/" aria-label="RISE home" key="rise-logo"><img src="/rise-logo.svg" width="124" height="31" alt="RISE — Results. Innovation. Solutions. Engineering."/></a>);
    if(nav.phone)children.push(<div className="template-mobile-links" id="mobile-links" key="mobile-links" data-open={nav.open} aria-hidden={!nav.open} inert={!nav.open}>{SITE_PAGES.map(page=><a key={page.href} href={page.href} aria-current={(window.location.pathname.replace(/\/$/,'')===(page.href==='/'?'':page.href))?'page':undefined} onClick={()=>nav.setOpen(false)}>{page.label}</a>)}<a className="mobile-book" href="/book-a-call" onClick={()=>nav.setOpen(false)}>Book a free call</a></div>);
  }
  if(has(node,'framer-igo78h')&&nav)Object.assign(props,{'aria-label':nav.open?'Close navigation menu':'Open navigation menu','aria-expanded':nav.open,'aria-controls':'mobile-links',onClick:()=>nav.setOpen(v=>!v)});
  if(has(node,'framer-1ahgtuo')&&nav&&nav.open)children=[<p key="close" className="framer-text" style={{fontSize:14,color:'#fff'}}>Close</p>];
  if(has(node,'framer-1wuwnmh')){children.push(<HeroMotion key="green-wave"/>);props.tabIndex=undefined;}
  if(node.tag==='button'&&!props.onClick){props.type='button';props.tabIndex=-1;}
  if(has(node,'framer-a9i7x9')||has(node,'framer-1ow1dm0'))props['aria-hidden']=true;
  props.ref=ref;
  if(['img','input','br','hr'].includes(node.tag))return h(node.tag,props);
  if((has(node,'framer-1q94b8m')&&item)||(has(node,'framer-frwk85')&&faq)){
    const context=item||faq;
    return <div className={`motion-disclosure ${item?'service-disclosure':'faq-disclosure'}`} data-open={context.open} aria-hidden={!context.open} inert={!context.open}><div className="motion-disclosure-clip"><div className="motion-disclosure-space">{h(node.tag,props,...children)}</div></div></div>;
  }
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
    if(!gl){canvas.parentElement.classList.add('hero-motion-fallback');return()=>canvas.parentElement?.classList.remove('hero-motion-fallback');}
    const hero=canvas.closest('header');
    const pointer={x:.5,y:.25,power:0},target={x:.5,y:.25,power:0};
    let frame=0,visible=true,ready=false,disposed=false,lostContext=false,last=0,time=0;
    function shader(type,source){const result=gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);if(!gl.getShaderParameter(result,gl.COMPILE_STATUS)){gl.deleteShader(result);return null;}return result;}
    const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
    const fragment=shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform sampler2D artwork;uniform vec2 viewport;uniform vec2 sourceSize;uniform float time;uniform vec3 pointer;
      void main(){vec2 p=uv;float screenRatio=viewport.x/viewport.y;float imageRatio=sourceSize.x/sourceSize.y;
        if(screenRatio>imageRatio)p.y=(p.y-.5)*(imageRatio/screenRatio)+.5;else p.x=(p.x-.5)*(screenRatio/imageRatio)+.5;
        float lower=1.-smoothstep(.36,.68,p.y);float strength=lower*.012*min(time*.4,1.);
        vec2 delta=uv-pointer.xy;delta.x*=viewport.x/viewport.y;
        float distance=length(delta);float ripple=sin(distance*28.-time*1.8)*exp(-distance*5.)*pointer.z;
        vec2 flow=vec2(sin(p.y*15.+time*.42)*strength, sin(p.x*13.+time*.55)*strength+cos(p.x*8.-time*.35)*strength*.5);
        flow+=normalize(delta+vec2(.0001))*ripple*lower*.012;
        gl_FragColor=texture2D(artwork,clamp(p+flow,.001,.999));}`);
    if(!vertex||!fragment)return;
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const clock=gl.getUniformLocation(program,'time'),viewport=gl.getUniformLocation(program,'viewport'),size=gl.getUniformLocation(program,'sourceSize'),cursor=gl.getUniformLocation(program,'pointer');
    function draw(){if(!ready||disposed||lostContext)return;gl.uniform1f(clock,preference.matches?0:time);gl.uniform3f(cursor,pointer.x,pointer.y,preference.matches?0:pointer.power);gl.drawArrays(gl.TRIANGLES,0,6);}
    function resize(){if(!canvas.clientWidth)return;canvas.width=Math.min(canvas.clientWidth,1920);canvas.height=Math.round(canvas.clientHeight*(canvas.width/canvas.clientWidth));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(viewport,canvas.width,canvas.height);draw();}
    function load(){if(disposed||!image.naturalWidth||lostContext)return;gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform2f(size,image.naturalWidth,image.naturalHeight);ready=true;resize();canvas.style.opacity='1';sync();}
    function active(){return ready&&visible&&!disposed&&!lostContext&&!document.hidden&&!preference.matches;}
    function tick(now){frame=0;if(!active())return;frame=requestAnimationFrame(tick);if(now-last<(window.innerWidth<810?50:33))return;time+=Math.min(now-last,60)/1000;last=now;pointer.x+=(target.x-pointer.x)*.07;pointer.y+=(target.y-pointer.y)*.07;pointer.power+=(target.power-pointer.power)*.05;draw();}
    function sync(){if(!active()){cancelAnimationFrame(frame);frame=0;if(preference.matches)draw();}else if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
    function move(event){if(preference.matches||event.pointerType==='touch')return;const r=hero.getBoundingClientRect();target.x=(event.clientX-r.left)/r.width;target.y=1-(event.clientY-r.top)/r.height;target.power=1;}
    function leave(){target.power=0;}
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    const visibility=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();});visibility.observe(canvas);
    image.addEventListener('load',load);if(image.complete)load();
    preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);hero?.addEventListener('pointermove',move,{passive:true});hero?.addEventListener('pointerleave',leave);
    const lost=e=>{e.preventDefault();lostContext=true;canvas.style.opacity='0';canvas.parentElement.classList.add('hero-motion-fallback');sync();};canvas.addEventListener('webglcontextlost',lost);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();image.removeEventListener('load',load);preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);hero?.removeEventListener('pointermove',move);hero?.removeEventListener('pointerleave',leave);canvas.removeEventListener('webglcontextlost',lost);canvas.parentElement?.classList.remove('hero-motion-fallback');gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);};
  },[]);
  return <canvas ref={ref} className="original-green-motion" aria-hidden="true"/>;
}

function Homepage(){useHomepageMotion();return <>{homeTemplate.map(node=><TemplateNode key={node.key} node={node}/>)}</>;}
export function App(){useScrollEntrance();const team=/^\/team(?:\/|$)/.test(window.location.pathname),booking=/^\/book-a-call(?:\/|$)/.test(window.location.pathname),services=/^\/what-we-do(?:\/|$)/.test(window.location.pathname);return <div id="site-layout"><SiteHeader Renderer={TemplateNode}/>{team?<TeamPage/>:services?<ServicesPage/>:booking?<BookCallPage/>:<Homepage/>}<SiteFooter Renderer={TemplateNode}/></div>;}
export const appRoot=createRoot(document.getElementById('root'));
appRoot.render(<App/>);
