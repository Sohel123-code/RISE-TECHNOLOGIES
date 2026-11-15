import {useEffect,useState} from 'react';

// A stable small-viewport measurement avoids switching the story layout when
// mobile browser toolbars expand/collapse. Short screens use natural flow.
export function useCompactViewport(mobileMinimum,desktopMinimum=600){
  const compact=height=>height<(window.innerWidth<810?mobileMinimum+(window.innerWidth<375?60:0):desktopMinimum);
  const [value,setValue]=useState(()=>compact(window.innerHeight));
  useEffect(()=>{
    const probe=document.createElement('div');
    probe.setAttribute('aria-hidden','true');
    probe.style.cssText='position:fixed;top:0;left:0;width:0;height:100vh;height:calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom));visibility:hidden;pointer-events:none;overflow:hidden;';
    document.body.appendChild(probe);
    const measure=()=>setValue((probe.clientHeight||window.innerHeight)<(window.innerWidth<810?mobileMinimum+(window.innerWidth<375?60:0):desktopMinimum));
    const observer=new ResizeObserver(measure);observer.observe(probe);
    window.addEventListener('resize',measure);measure();
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);probe.remove();};
  },[mobileMinimum,desktopMinimum]);
  return value;
}
