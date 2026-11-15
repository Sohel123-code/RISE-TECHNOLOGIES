import React,{useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight,Code2,Database,Layers,Check,GitBranch,MousePointer2,ShieldCheck} from 'lucide-react';
import {SERVICES,servicePose,servicePosition} from './servicesData';
import './services.css';
import {useCompactViewport} from './useCompactViewport';
import LiquidHeroBackground from './LiquidHeroBackground';
import SmokeCursor from './SmokeCursor';

function ServiceVisual({type}){
  if(type===0)return <div className="expert-art art-stack" aria-hidden="true">
    <div className="stack-orbit"/><div className="stack-layer stack-database"><Database size={24}/><span>DATA LAYER</span><div className="stack-status"/></div>
    <div className="stack-layer stack-api"><GitBranch size={23}/><span>APPLICATION LOGIC</span><code>{'{ }'}</code></div>
    <div className="stack-layer stack-browser"><div className="art-window"><i/><i/><i/><span>your next idea / built</span></div><div className="browser-content"><Code2 size={32}/><span>Make it<br/><b>work beautifully.</b></span><div className="browser-blocks"><i/><i/><i/></div></div></div>
    <span className="art-caption">INTERFACE / LOGIC / DATA</span>
  </div>;
  if(type===1)return <div className="expert-art art-data" aria-hidden="true"><div className="data-grid"/><div className="data-topline"><span>THE BIGGER PICTURE</span><Database size={16}/></div><div className="data-bars">{[.24,.38,.3,.57,.46,.72,.63,.92].map((height,i)=><i key={i} style={{'--bar':height,'--delay':`${i*60}ms`}}/>)}</div><svg className="data-line" viewBox="0 0 400 200"><path d="M15 170 C55 170 40 120 88 130 S140 135 165 90 S215 120 248 65 S300 100 325 45 S363 40 385 15"/></svg><div className="data-insight"><span>CONNECT THE DOTS</span><strong>Clarity, from complexity.</strong><div><i/><i/><i/></div></div><span className="art-caption">EXPLORE / VISUALIZE / UNDERSTAND</span></div>;
  if(type===2)return <div className="expert-art art-ai" aria-hidden="true"><div className="ai-halo"/><svg viewBox="0 0 460 360" className="ai-network">{[0,1,2].flatMap(layer=>[0,1,2,3].flatMap(a=>[0,1,2,3].map(b=><line key={`${layer}-${a}-${b}`} x1={60+layer*113} y1={65+a*76} x2={60+(layer+1)*113} y2={65+b*76} style={{'--delay':`${(a+b+layer)*130}ms`}}/>)))}{[0,1,2,3].flatMap(layer=>[0,1,2,3].map(row=><g key={`${layer}-${row}`}><circle className="ai-node-glow" cx={60+layer*113} cy={65+row*76} r="14"/><circle className="ai-node" cx={60+layer*113} cy={65+row*76} r="5" style={{'--delay':`${(layer+row)*220}ms`}}/></g>))}</svg><div className="ai-label"><span>LEARNING THROUGH CONNECTIONS</span><strong>Possibility, with purpose.</strong></div><span className="art-caption">INPUT / LEARNING / OUTPUT</span></div>;
  if(type===3)return <div className="expert-art art-design" aria-hidden="true"><div className="design-board"><div className="art-window"><Layers size={14}/><span>IDEA → EXPERIENCE</span></div><div className="design-layout"><div className="design-sidebar"><i/><i/><i/></div><div className="design-canvas"><span className="design-label">A LITTLE MORE HUMAN.</span><strong>Simple.<br/>By design.</strong><div className="design-button">Explore <ArrowUpRight size={14}/></div><div className="design-cards"><i/><i/></div></div></div></div><div className="design-palette"><i/><i/><i/><span>Aa</span></div><div className="design-cursor"><MousePointer2 fill="currentColor" size={26}/><span>Every detail matters</span></div><span className="art-caption">JOURNEYS / WIREFRAMES / PROTOTYPES</span></div>;
  return <div className="expert-art art-qa" aria-hidden="true"><div className="qa-shield"><ShieldCheck size={62} strokeWidth={1}/></div><div className="qa-panel"><div className="data-topline"><span>A BETTER RELEASE STARTS HERE</span><Code2 size={16}/></div>{['Functionality','Compatibility','User experience','Regression'].map((label,i)=><div className="qa-check" key={label} style={{'--delay':`${i*180}ms`}}><Check size={17}/><span>{label}</span><i/></div>)}<div className="qa-scan"/></div><span className="art-caption">TEST / REFINE / VALIDATE</span></div>;
}

export default function ServicesPage(){
  const story=useRef(null),stage=useRef(null),hero=useRef(null),panels=useRef([]),position=useRef(0),current=useRef(-1);
  const [active,setActive]=useState(-1),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const compact=useCompactViewport(780),staticLayout=reduced||compact;
  useEffect(()=>{
    const oldTitle=document.title,meta=document.querySelector('meta[name="description"]'),oldDescription=meta?.content;
    document.title='What We Do — RISE';if(meta)meta.content='Full-stack development, data analytics, AI and machine learning, UI/UX design, and quality assurance for student projects and businesses.';
    const media=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);
    media.addEventListener('change',update);
    return()=>{document.title=oldTitle;if(meta)meta.content=oldDescription;media.removeEventListener('change',update);};
  },[]);
  useEffect(()=>{
    let frame=0,last=0,target=0,dirty=true,visible=true;
    function draw(){
      const intro=1-Math.min(1,position.current/.85);
      hero.current.style.setProperty('--intro',intro);hero.current.style.setProperty('--intro-y',`${(1-intro)*-70}px`);
      hero.current.inert=intro<.1;
      panels.current.forEach((el,i)=>{
        const pose=servicePose(i,position.current);
        for(const [key,value] of Object.entries(pose))el.style.setProperty(`--scene-${key}`,`${value.toFixed(4)}${['y','blur'].includes(key)?'px':''}`);
        el.dataset.visible=String(pose.opacity>.005);
      });
      const next=position.current<.65?-1:Math.min(SERVICES.length-1,Math.floor(position.current+.4)-1);
      if(current.current!==next){current.current=next;setActive(next);}
      story.current.style.setProperty('--story-progress',Math.min(1,position.current/(SERVICES.length+.25)));
    }
    function tick(now){
      frame=0;if(document.hidden||!visible)return;
      if(dirty){const r=story.current.getBoundingClientRect();target=servicePosition(r.top,r.height,stage.current.clientHeight||window.innerHeight);dirty=false;}
      const dt=Math.min(now-last||16,50);last=now;position.current+=(target-position.current)*(1-Math.exp(-dt/75));
      if(Math.abs(target-position.current)<.0005)position.current=target;
      draw();if(position.current!==target)frame=requestAnimationFrame(tick);
    }
    function schedule(){dirty=true;if(!staticLayout&&!document.hidden&&visible&&!frame){last=0;frame=requestAnimationFrame(tick);}}
    function visibility(){story.current.dataset.running=String(!staticLayout&&visible&&!document.hidden);if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();}
    if(staticLayout){hero.current.removeAttribute('style');hero.current.inert=false;panels.current.forEach(el=>{for(const key of ['opacity','y','scale','blur','reveal'])el.style.removeProperty(`--scene-${key}`);el.dataset.visible='true';});story.current.dataset.running='false';return;}
    const resize=new ResizeObserver(schedule);resize.observe(story.current);resize.observe(stage.current);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility();if(!visible){cancelAnimationFrame(frame);frame=0;}});observer.observe(story.current);
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',visibility);visibility();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',visibility);};
  },[staticLayout]);
  function choose(index){
    if(staticLayout){document.getElementById(index<0?'expertise-intro':SERVICES[index].slug)?.scrollIntoView({behavior:'instant',block:'start'});return;}
    const r=story.current.getBoundingClientRect();window.scrollTo({top:window.scrollY+r.top+(index+1)/(SERVICES.length+.25)*(r.height-(stage.current.clientHeight||window.innerHeight)),behavior:'smooth'});
  }
  function keyboard(event){
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    const next=event.key==='Home'?-1:event.key==='End'?4:['ArrowDown','ArrowRight'].includes(event.key)?Math.min(4,current.current+1):['ArrowUp','ArrowLeft'].includes(event.key)?Math.max(-1,current.current-1):null;
    if(next!==null){event.preventDefault();choose(next);}
  }
  return <main className="expertise-page" id="expertise-main" data-static={staticLayout}>
    <a className="expertise-skip" href="#expertise-footer">Skip service animation</a>
    <section className="expertise-story" ref={story} aria-label="Explore what we do">
      <div className="expertise-stage" ref={stage} tabIndex={staticLayout?-1:0} onKeyDown={keyboard} aria-label="Scroll to explore services. Use arrow keys to navigate, or Home to return to the introduction.">
        <div className="expertise-hero" ref={hero} id="expertise-intro" data-smoke-hero><SmokeCursor active={staticLayout||active<0}/><LiquidHeroBackground variant="services" active={staticLayout||active<0}/><div className="expertise-orbit" aria-hidden="true"/><p className="expertise-eyebrow">WHAT WE DO / BUILT AROUND YOUR IDEA</p><h1>Ideas rise.<br/><em>We make them real.</em></h1><p className="expertise-lead">Five disciplines. One collaborative team.<br/>Practical digital solutions for students and businesses.</p><button className="expertise-explore" onClick={()=>choose(0)}>Explore our expertise <ArrowDown size={16}/></button></div>
        <div className="expertise-scenes">{SERVICES.map((service,i)=><article className="expertise-scene" id={service.slug} ref={el=>panels.current[i]=el} data-active={active===i} key={service.slug} aria-labelledby={`${service.slug}-title`} style={{'--layer':SERVICES.length-i}}>
          <div className="expertise-copy"><span className="expertise-eyebrow">0{i+1} / {service.eyebrow}</span><h2 id={`${service.slug}-title`}>{service.title}</h2><p>{service.description}</p><ul>{service.deliverables.map(item=><li key={item}>{item}</li>)}</ul><span className="expertise-line">{service.line}</span></div><ServiceVisual type={i}/>
        </article>)}</div>
        <div className="expertise-bottom"><span className="expertise-counter">OUR EXPERTISE <b>{active<0?'00':`0${active+1}`} / 05</b></span><nav aria-label="Choose a service">{SERVICES.map((service,i)=><button key={service.slug} onClick={()=>choose(i)} aria-label={`Explore ${service.title}`} aria-current={active===i?'step':undefined}><span>0{i+1}</span><span className="expertise-nav-label">{service.short}</span></button>)}</nav><span className="expertise-scroll-label">SCROLL TO EXPLORE <ArrowDown size={13}/></span></div>
        <div className="expertise-progress" aria-hidden="true"/>
      </div>
    </section>
    <div id="expertise-footer" tabIndex={-1}/>
  </main>;
}
