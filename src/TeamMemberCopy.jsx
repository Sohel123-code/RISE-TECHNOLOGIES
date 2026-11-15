import React,{useEffect,useRef,useState} from 'react';
import './team-name.css';

function NameWords({text,offset=0}){
  return text.split(' ').map((word,index)=><React.Fragment key={`${word}-${index}`}>{index>0?' ':null}<span className="team-name-mask"><span className="team-name-word" style={{'--word-order':offset+index}}>{word}</span></span></React.Fragment>);
}

export default function TeamMemberCopy({member,index,active,staticLayout,reduced}){
  const copy=useRef(null);
  const [inView,setInView]=useState(false);
  useEffect(()=>{
    if(!staticLayout||reduced)return;
    const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.2,rootMargin:'0px 0px -12% 0px'});
    observer.observe(copy.current);return()=>observer.disconnect();
  },[staticLayout,reduced]);
  const visible=reduced||(staticLayout?inView:active);
  const lead=member.nameSuffix?member.name.slice(0,-member.nameSuffix.length).trim():member.name;
  return <div ref={copy} className="team-person-copy" data-copy-visible={visible}>
    <span className="team-member-number">THE PEOPLE BEHIND THE WORK / 0{index+1}</span>
    <h2 className="team-name-title" id={`name-${member.slug}`} aria-label={member.name}>
      <NameWords text={lead}/>{member.nameSuffix?<>{' '}<span className="team-name-suffix"><NameWords text={member.nameSuffix} offset={lead.split(' ').length}/></span></>:null}
    </h2>
    <p className="team-role">{member.role}</p>
    <span className="team-person-line" aria-hidden="true"/>
    <span className="team-person-signature">Results. Innovation.<br/>Solutions. Engineering.</span>
  </div>;
}
