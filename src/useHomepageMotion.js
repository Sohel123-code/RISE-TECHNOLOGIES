import { useEffect } from 'react';

/** Motion enhances the existing template without owning layout or content. */
export function useHomepageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const hero = document.querySelector('[data-framer-name="Hero Section"]');
    const cards = [...document.querySelectorAll('[data-motion-card]')];
    let scrollFrame = 0, pointerFrame = 0, card = null, button = null, point = null;

    function resetPointer() {
      for (const el of [card,button]) {
        if (!el) continue;
        el.style.removeProperty('--pointer-x');el.style.removeProperty('--pointer-y');
        el.style.removeProperty('--tilt-x');el.style.removeProperty('--tilt-y');
        el.style.removeProperty('--magnet-x');el.style.removeProperty('--magnet-y');
        el.removeAttribute('data-pointer-active');
      }
      card=null;button=null;
    }
    function updateScroll() {
      scrollFrame=0;
      const y=window.scrollY || 0;
      if(hero && !reduced.matches)hero.style.setProperty('--hero-drift',`${Math.min(y*.065,32)}px`);
      else hero?.style.removeProperty('--hero-drift');
    }
    function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
    function updatePointer(){
      pointerFrame=0;
      if(!point||reduced.matches||!fine.matches)return;
      if(card){
        const r=card.getBoundingClientRect();
        if(r.width&&r.height){
          const x=Math.max(0,Math.min(1,(point.x-r.left)/r.width)),y=Math.max(0,Math.min(1,(point.y-r.top)/r.height));
          card.style.setProperty('--pointer-x',`${x*100}%`);card.style.setProperty('--pointer-y',`${y*100}%`);
          card.style.setProperty('--tilt-x',`${(0.5-y)*3}deg`);card.style.setProperty('--tilt-y',`${(x-0.5)*3}deg`);
          card.setAttribute('data-pointer-active','true');
        }
      }
      if(button){
        const r=button.getBoundingClientRect();
        button.style.setProperty('--magnet-x',`${Math.max(-4,Math.min(4,(point.x-r.left-r.width/2)*.06))}px`);
        button.style.setProperty('--magnet-y',`${Math.max(-3,Math.min(3,(point.y-r.top-r.height/2)*.12))}px`);
      }
    }
    function move(e){
      if(reduced.matches||!fine.matches||e.pointerType==='touch')return;
      const nextCard=e.target.closest?.('[data-motion-card]');
      const nextButton=e.target.closest?.('[data-magnetic]');
      if(nextCard!==card||nextButton!==button){resetPointer();card=nextCard;button=nextButton;}
      if(!card&&!button)return;
      point={x:e.clientX,y:e.clientY};
      if(!pointerFrame)pointerFrame=requestAnimationFrame(updatePointer);
    }
    function preferences(){resetPointer();root.classList.toggle('motion-reduced',reduced.matches);updateScroll();}
    const visibleCards=new IntersectionObserver(entries=>{
      for(const entry of entries)entry.target.classList.toggle('motion-in-view',entry.isIntersecting);
    },{threshold:.25});
    cards.forEach(el=>visibleCards.observe(el));
    window.addEventListener('scroll',scheduleScroll,{passive:true});
    window.addEventListener('resize',scheduleScroll,{passive:true});
    document.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerleave',resetPointer);
    window.addEventListener('blur',resetPointer);
    reduced.addEventListener('change',preferences);fine.addEventListener('change',preferences);
    preferences();
    return()=>{
      cancelAnimationFrame(scrollFrame);cancelAnimationFrame(pointerFrame);visibleCards.disconnect();resetPointer();
      window.removeEventListener('scroll',scheduleScroll);window.removeEventListener('resize',scheduleScroll);
      document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',resetPointer);window.removeEventListener('blur',resetPointer);
      reduced.removeEventListener('change',preferences);fine.removeEventListener('change',preferences);
      root.classList.remove('motion-reduced');hero?.style.removeProperty('--hero-drift');
    };
  },[]);
}
