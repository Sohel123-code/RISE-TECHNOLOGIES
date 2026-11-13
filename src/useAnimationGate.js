import { useEffect, useState } from 'react';

export function useAnimationGate(ref) {
  const [reduced,setReduced] = useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible,setVisible] = useState(false);
  const [foreground,setForeground] = useState(()=>!document.hidden);
  useEffect(()=>{
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>setReduced(preference.matches);
    const visibility=()=>setForeground(!document.hidden);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.12});
    if(ref.current)observer.observe(ref.current);
    preference.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);
    return()=>{observer.disconnect();preference.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);};
  },[ref]);
  return { reduced, running:visible&&foreground&&!reduced };
}
