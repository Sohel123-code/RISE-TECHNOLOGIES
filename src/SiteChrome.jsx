import React,{useEffect,useRef} from 'react';
import {headerTemplate,footerTemplates} from './siteTemplate';

export const SITE_PAGES=[{href:'/',label:'Home'},{href:'/what-we-do',label:'What we do'},{href:'/team',label:'Team'}];

export function SiteHeader({Renderer}){
  const ref=useRef(null);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;ref.current?.classList.toggle('navigation-scrolled',window.scrollY>32);};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);};
  },[]);
  return <header ref={ref} className="site-header-template framer-ffAti" data-site-header><Renderer node={headerTemplate}/></header>;
}

export function SiteFooter({Renderer}){
  return <div className="site-footer-template framer-ffAti" data-site-footer>
    {footerTemplates.map(node=><Renderer key={node.key} node={node}/>)}
  </div>;
}
