import {useEffect} from 'react';

export function entranceProgress(top,viewportHeight,order=0){
  const start=viewportHeight*.96-Math.min(order,3)*22;
  const end=viewportHeight*.52-Math.min(order,3)*10;
  const linear=Math.max(0,Math.min(1,(start-top)/Math.max(1,start-end)));
  return 1-Math.pow(1-linear,2);
}

/** Scroll position drives each entrance in both directions. No scroll locking,
 * duplicated content or continuous frame loop; layout remains the template's. */
export function useScrollEntrance(){
  useEffect(()=>{
    const host=document.getElementById('site-layout');
    if(!host)return;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const entries=[...host.querySelectorAll('[data-scroll-rise]')].map(el=>({el,y:0,order:Number(el.dataset.scrollOrder)||0}));
    let frame=0,disposed=false;
    const variables=['--scroll-rise-y','--scroll-rise-opacity'];
    function draw(){
      frame=0;
      if(disposed||document.hidden)return;
      if(preference.matches){
        host.classList.remove('homepage-scroll-motion');
        entries.forEach(entry=>{entry.y=0;variables.forEach(key=>entry.el.style.removeProperty(key));});
        return;
      }
      // Read all geometry before writing styles. Remove our previous translation
      // from the measured top, so the animation never feeds back into itself.
      const height=window.innerHeight;
      const measurements=entries.map(entry=>{
        if(!entry.el.getClientRects().length)return null;
        const focused=entry.el.matches(':focus-within');
        const top=entry.el.getBoundingClientRect().top-(focused?0:entry.y);
        return {progress:focused?1:entranceProgress(top,height,entry.order)};
      });
      host.classList.add('homepage-scroll-motion');
      entries.forEach((entry,i)=>{
        const measurement=measurements[i];
        if(!measurement)return;
        const progress=measurement.progress;
        entry.y=(1-progress)*(window.innerWidth<810?54:92);
        entry.el.style.setProperty('--scroll-rise-y',`${entry.y.toFixed(2)}px`);
        entry.el.style.setProperty('--scroll-rise-opacity',(.12+.88*progress).toFixed(3));
      });
    }
    function schedule(){if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();}
    const resize=new ResizeObserver(schedule);resize.observe(host);
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('load',schedule,true);host.addEventListener('focusin',schedule);host.addEventListener('focusout',schedule);
    document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',schedule);
    document.fonts?.ready.then(schedule);
    schedule();
    return()=>{
      disposed=true;cancelAnimationFrame(frame);resize.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
      document.removeEventListener('load',schedule,true);host.removeEventListener('focusin',schedule);host.removeEventListener('focusout',schedule);
      document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',schedule);
      host.classList.remove('homepage-scroll-motion');entries.forEach(({el})=>variables.forEach(key=>el.style.removeProperty(key)));
    };
  },[]);
}
