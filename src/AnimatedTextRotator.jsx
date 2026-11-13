import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { rotationPhaseLength } from './animationMath';
import { useAnimationGate } from './useAnimationGate';

// Timing and character-by-character blur behavior from the user's Framer
// AnimatedTextRotatorVF reference. Standalone React; no Framer runtime needed.
export const HERO_WORDS = ['From your first idea to working software.', 'Student projects. Real understanding.', 'Custom software. Real possibilities.'];
export function AnimatedTextRotator({words=HERO_WORDS}) {
  const ref=useRef(null);
  const {reduced,running}=useAnimationGate(ref);
  const [index,setIndex]=useState(0),[phase,setPhase]=useState('enter');
  const [paused,setPaused]=useState(false),[hovered,setHovered]=useState(false);
  const timer=useRef({key:'',remaining:0});
  const word=words[index % words.length];
  const enabled=running&&!paused&&!hovered&&words.length>1;
  useEffect(()=>{
    const key=`${index}:${phase}:${word}`;
    if(timer.current.key!==key)timer.current={key,remaining:rotationPhaseLength(word,phase)};
    if(!enabled)return;
    const start=performance.now();
    const id=setTimeout(()=>{
      if(phase==='enter')setPhase('exit');
      else {setIndex(i=>(i+1)%words.length);setPhase('enter');}
    },timer.current.remaining);
    return()=>{clearTimeout(id);timer.current.remaining=Math.max(0,timer.current.remaining-(performance.now()-start));};
  },[index,phase,word,enabled,words.length]);
  let letter=0;
  return <div ref={ref} className="hero-rotator" data-phase={phase} data-running={enabled} data-reduced={reduced}
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
    <div className="rotator-grid" aria-hidden="true">
      {words.map(w=><span className="rotator-measure" key={w}>{w}</span>)}
      <span className="rotator-word" key={`${index}-${phase}`}>
        {word.split(/(\s+)/).map((part,i)=>{
          if(/^\s+$/.test(part)){letter+=Array.from(part).length;return part;}
          return <span className="rotator-token" key={i}>{Array.from(part).map(char=><span className="rotator-letter" key={letter} style={{'--character':letter++}}>{char}</span>)}</span>;
        })}
      </span>
    </div>
    <span className="motion-sr-only">{words.join(' ')}</span>
    {!reduced&&<button type="button" className="rotator-control" aria-label={paused?'Play hero text animation':'Pause hero text animation'} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={12}/>:<Pause size={12}/>}</button>}
  </div>;
}
