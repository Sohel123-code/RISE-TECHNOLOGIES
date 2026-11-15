import React,{useEffect,useRef,useState} from 'react';
import {ArrowDown} from 'lucide-react';
import {TEAM_MEMBERS,TEAM_SCROLL_END,teamScrollPosition,teamPortraitPose,teamHeroPose,activeTeamMember} from './teamData';
import './team.css';
import {useCompactViewport} from './useCompactViewport';
import LiquidHeroBackground from './LiquidHeroBackground';
import SmokeCursor from './SmokeCursor';
import TeamMemberCopy from './TeamMemberCopy';

export default function TeamPage(){
  const story=useRef(null),stage=useRef(null),hero=useRef(null),portraits=useRef([]);
  const [active,setActive]=useState(-1);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const compact=useCompactViewport(680);
  const staticLayout=reduced||compact;
  const position=useRef(0),activeRef=useRef(-1);
  useEffect(()=>{
    const oldTitle=document.title,description=document.querySelector('meta[name="description"]'),oldDescription=description?.content;
    document.title='Our Team \u2014 RISE';
    if(description)description.content='Meet the people behind RISE: AI, machine learning, quality assurance, full stack development, research and data analysis.';
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>setReduced(preference.matches);
    preference.addEventListener('change',change);
    return()=>{document.title=oldTitle;if(description)description.content=oldDescription;preference.removeEventListener('change',change);};
  },[]);
  useEffect(()=>{
    let frame=0,last=0,target=0,dirty=true,visible=true;
    function paint(){
      const heroPose=teamHeroPose(position.current);
      hero.current.style.setProperty('--hero-opacity',heroPose.opacity.toFixed(4));
      hero.current.style.setProperty('--hero-y',`${heroPose.y.toFixed(2)}px`);
      hero.current.style.setProperty('--hero-scale',heroPose.scale.toFixed(4));
      hero.current.style.setProperty('--hero-blur',`${heroPose.blur.toFixed(2)}px`);
      portraits.current.forEach((portrait,i)=>{
        const pose=teamPortraitPose(i,position.current);
        for(const [key,value] of Object.entries(pose))portrait.style.setProperty(`--person-${key}`,`${value.toFixed(4)}${['y','z','blur'].includes(key)?'px':key==='tilt'?'deg':''}`);
        portrait.dataset.visible=String(pose.opacity>.005);
      });
      const next=activeTeamMember(position.current);
      if(next!==activeRef.current){activeRef.current=next;setActive(next);}
      story.current.style.setProperty('--team-progress',String(Math.min(1,position.current/TEAM_SCROLL_END)));
    }
    function tick(now){
      frame=0;if(document.hidden||!visible)return;
      if(dirty){const r=story.current.getBoundingClientRect();target=teamScrollPosition(r.top,r.height,stage.current.clientHeight||window.innerHeight);dirty=false;}
      const dt=Math.min(now-last||16,50);last=now;
      position.current+=(target-position.current)*(1-Math.exp(-dt/80));
      if(Math.abs(position.current-target)<.0005)position.current=target;
      paint();if(position.current!==target)frame=requestAnimationFrame(tick);
    }
    function schedule(){dirty=true;if(!staticLayout&&!document.hidden&&visible&&!frame){last=0;frame=requestAnimationFrame(tick);}}
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();}
    if(staticLayout){hero.current.removeAttribute('style');portraits.current.forEach(p=>{p.removeAttribute('style');p.dataset.visible='true';});return;}
    const resize=new ResizeObserver(schedule);resize.observe(story.current);resize.observe(stage.current);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0});observer.observe(story.current);
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',visibility);schedule();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',visibility);};
  },[staticLayout]);
  function choose(index){
    if(staticLayout){document.getElementById(index<0?'team-hero':`member-${TEAM_MEMBERS[index].slug}`)?.scrollIntoView({behavior:'instant',block:'center'});return;}
    const r=story.current.getBoundingClientRect(),h=stage.current.clientHeight||window.innerHeight;
    window.scrollTo({top:window.scrollY+r.top+(index+1)/TEAM_SCROLL_END*Math.max(0,r.height-h),behavior:'smooth'});
  }
  function keyboard(event){
    let index;
    if(['ArrowDown','ArrowRight'].includes(event.key))index=Math.min(TEAM_MEMBERS.length-1,activeRef.current+1);
    if(['ArrowUp','ArrowLeft'].includes(event.key))index=Math.max(-1,activeRef.current-1);
    if(event.key==='Home')index=-1;
    if(event.key==='End')index=TEAM_MEMBERS.length-1;
    if(index!==undefined){event.preventDefault();choose(index);}
  }
  return <main id="team-main" className="team-page" data-static={staticLayout} data-reduced={reduced}>
    <a href="#team-story" className="team-skip">Skip to the team</a>
    <section ref={story} id="team-story" className="team-story" aria-label="The people behind RISE">
      <div ref={stage} className="team-stage" tabIndex={staticLayout?-1:0} onKeyDown={keyboard} aria-label="Scroll to meet our team. Arrow keys explore, Home returns to the introduction.">
        <div ref={hero} id="team-hero" className="team-hero" data-smoke-hero>
          <LiquidHeroBackground variant="team" active={staticLayout||active<0}/>
          <SmokeCursor active={staticLayout||active<0}/>
          <div className="team-hero-orbit" aria-hidden="true"/>
          <p className="team-eyebrow">OUR PEOPLE / OUR STRENGTH</p>
          <h1><span>Meet the people</span>{' '}<span>behind <em>RISE.</em></span></h1>
          <p className="team-intro">Six perspectives. One shared purpose.<br/>Turning ideas into software that makes a difference.</p>
          <div className="team-hero-scroll"><ArrowDown size={17}/><span>SCROLL TO MEET US</span></div>
        </div>
        <div className="team-portraits">
          {TEAM_MEMBERS.map((member,i)=><article ref={el=>portraits.current[i]=el} key={member.slug} id={`member-${member.slug}`} className="team-portrait" data-active={active===i} aria-labelledby={`name-${member.slug}`}>
            <div className="team-photo"><img src={`/team/${member.slug}.jpeg`} alt={member.name} width="1200" height="1500" loading={i<2?'eager':'lazy'} decoding="async" style={{objectPosition:member.position}}/><span className="team-photo-mark" aria-hidden="true">RISE / 0{i+1}</span></div>
            <TeamMemberCopy member={member} index={i} active={active===i} staticLayout={staticLayout} reduced={reduced}/>
          </article>)}
        </div>
        <div className="team-bottom" data-show={active>=0} inert={active<0&&!staticLayout}>
          <span className="team-chapter">THE TEAM <span>{active>=0?`0${active+1}`:'00'} / 06</span></span>
          <nav className="team-index" aria-label="Choose a team member">{TEAM_MEMBERS.map((member,i)=><button key={member.slug} type="button" aria-label={`Meet ${member.name}`} aria-current={active===i?'true':undefined} onClick={()=>choose(i)}><span>0{i+1}</span><span className="team-index-name">{member.name}</span></button>)}</nav>
          <ArrowDown size={16} aria-hidden="true"/>
        </div>
        <div className="team-reading-progress" aria-hidden="true"><span/></div>
      </div>
    </section>
  </main>;
}
