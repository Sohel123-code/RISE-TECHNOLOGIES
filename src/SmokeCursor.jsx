import React,{useEffect,useRef} from 'react';
import {createFluidSmoke} from './fluidSmoke';
import './ambient-effects.css';

// Screen-blended fluid smoke, driven by pointer momentum rather than particles.
export default function SmokeCursor({active=true}){
  const canvas=useRef(null);
  useEffect(()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
    const element=canvas.current,host=element.parentElement;
    element.dataset.enabled='false';
    if(!active)return;
    let fluid=null,frame=0,lastFrame=0,lastPointer=null,pending=[],idle=0,lost=false,failed=false,visible=true;
    const permitted=()=>visible&&fine.matches&&!reduced.matches&&!document.hidden&&!lost;
    function clear(){cancelAnimationFrame(frame);frame=0;lastFrame=0;lastPointer=null;pending=[];idle=0;fluid?.clear();}
    function prepare(){
      if(!fluid&&!failed&&window.WebGL2RenderingContext){fluid=createFluidSmoke(element,host.clientWidth,host.clientHeight);failed=!fluid;}
      return !!fluid;
    }
    function preferences(){
      clear();const enabled=permitted()&&prepare();element.dataset.enabled=String(enabled);
      // Touch devices and reduced-motion users do not retain GPU textures.
      if((!fine.matches||reduced.matches)&&fluid){fluid.destroy();fluid=null;}
    }
    function resize(){clear();if(fluid){try{fluid.resize(host.clientWidth,host.clientHeight);}catch{fluid.destroy();fluid=null;failed=true;element.dataset.enabled='false';}}}
    function tick(now){
      frame=0;if(!permitted()||!fluid){clear();return;}
      const elapsed=Math.min((now-lastFrame||16.67)/1000,.05);lastFrame=now;
      if(pending.length){for(const point of pending)fluid.splat(...point);pending=[];idle=0;}else idle+=elapsed;
      if(idle>=4){clear();return;}
      fluid.step(elapsed,Math.min(1,(4-idle)/1.2));
      frame=requestAnimationFrame(tick);
    }
    function move(event){
      if(event.pointerType!=='mouse'||!permitted()||!fluid)return;
      const rect=host.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0||event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom){if(frame||lastPointer)clear();return;}
      if(event.target.closest?.('input,textarea,select,[contenteditable="true"]')){lastPointer=null;return;}
      if(event.target.closest?.('[data-site-header],[data-site-footer]')){clear();return;}
      const point={x:(event.clientX-rect.left)*host.clientWidth/rect.width,y:(event.clientY-rect.top)*host.clientHeight/rect.height},previous=lastPointer||point;lastPointer=point;
      const dx=point.x-previous.x,dy=point.y-previous.y,distance=Math.hypot(dx,dy);
      if(distance<1)return;
      // Interpolate quick sweeps so the plume stays connected; cap work per frame.
      const count=Math.min(6,Math.max(1,Math.ceil(distance/16)));
      for(let i=1;i<=count;i++)pending.push([previous.x+dx*i/count,previous.y+dy*i/count,dx/count,dy/count,distance/count]);
      if(pending.length>24)pending.splice(0,pending.length-24);
      if(!frame)frame=requestAnimationFrame(tick);
    }
    function contextLost(event){event.preventDefault();lost=true;clear();element.dataset.enabled='false';}
    function contextRestored(){fluid?.destroy();fluid=null;lost=false;failed=false;preferences();}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;preferences();});observer.observe(host);
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('resize',resize);window.addEventListener('blur',clear);
    window.addEventListener('scroll',clear,{passive:true});
    document.addEventListener('pointerleave',clear);document.addEventListener('visibilitychange',preferences);
    element.addEventListener('webglcontextlost',contextLost);element.addEventListener('webglcontextrestored',contextRestored);
    reduced.addEventListener('change',preferences);fine.addEventListener('change',preferences);preferences();
    return()=>{clear();fluid?.destroy();element.dataset.enabled='false';observer.disconnect();sizeObserver.disconnect();window.removeEventListener('scroll',clear);window.removeEventListener('pointermove',move);window.removeEventListener('resize',resize);window.removeEventListener('blur',clear);document.removeEventListener('pointerleave',clear);document.removeEventListener('visibilitychange',preferences);element.removeEventListener('webglcontextlost',contextLost);element.removeEventListener('webglcontextrestored',contextRestored);reduced.removeEventListener('change',preferences);fine.removeEventListener('change',preferences);};
  },[active]);
  return <canvas ref={canvas} className="site-smoke-cursor" data-enabled="false" aria-hidden="true"/>;
}
