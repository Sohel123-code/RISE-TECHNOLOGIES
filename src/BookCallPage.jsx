import React,{useEffect,useState} from 'react';
import {ArrowUpRight,Check} from 'lucide-react';
import './booking.css';

const KEY='rise-call-draft-v1';
export const CALL_SERVICES=['Student project','Custom software','Project assistance','Research & data','Not sure yet'];
function loadDraft(){
  try{const draft=JSON.parse(window.localStorage.getItem(KEY)||'null');if(draft)return {name:String(draft.name||'').slice(0,100),service:CALL_SERVICES.includes(draft.service)?draft.service:CALL_SERVICES[0],message:String(draft.message||'').slice(0,3000)};}catch{}
  return {name:'',service:CALL_SERVICES[0],message:''};
}
export default function BookCallPage(){
  const [draft,setDraft]=useState(loadDraft),[status,setStatus]=useState('');
  useEffect(()=>{const previous=document.title;document.title='Book a Call — RISE';return()=>{document.title=previous;};},[]);
  function change(event){setDraft(value=>({...value,[event.target.name]:event.target.value}));setStatus('');}
  function save(event){
    event.preventDefault();
    try{window.localStorage.setItem(KEY,JSON.stringify(draft));setStatus('Your draft is saved on this device. No request has been sent or call booked.');}
    catch{setStatus('Your browser could not save this draft. Your text is still in the form.');}
  }
  return <main className="booking-page" id="booking-main">
    <section className="booking-intro" data-scroll-rise>
      <span className="booking-eyebrow">LET'S BUILD SOMETHING TOGETHER</span>
      <h1>Good ideas start<br/>with a <em>conversation.</em></h1>
      <p>Tell us what you have in mind. A student project, a custom application, or an idea you want to explore.</p>
      <div className="booking-availability"><span/> Call scheduling is coming soon</div>
      <ul><li><Check size={15}/> Discuss your idea and requirements</li><li><Check size={15}/> Explore the right approach</li><li><Check size={15}/> Identify the next steps</li></ul>
    </section>
    <section className="booking-panel" aria-labelledby="booking-form-title" data-scroll-rise data-scroll-order="1">
      <span className="booking-eyebrow">PREPARE YOUR CONVERSATION</span><h2 id="booking-form-title">Your project, in a few words.</h2>
      <p className="booking-note">You can save a draft here while booking is being set up. It stays on this device.</p>
      <form onSubmit={save}>
        <label htmlFor="call-name">Your name <span>(optional)</span></label><input id="call-name" name="name" autoComplete="name" maxLength={100} value={draft.name} onChange={change} placeholder="Your name"/>
        <fieldset><legend>What would you like to discuss?</legend><div className="booking-options">{CALL_SERVICES.map(service=><label key={service}><input type="radio" name="service" value={service} checked={draft.service===service} onChange={change}/><span>{service}</span></label>)}</div></fieldset>
        <label htmlFor="call-message">Your idea or question</label><textarea id="call-message" name="message" rows={5} required maxLength={3000} value={draft.message} onChange={change} placeholder="What would you like to build or improve?"/>
        <button type="submit">Save request draft <ArrowUpRight size={18}/></button>
        <p className="booking-status" role="status">{status}</p>
      </form>
    </section>
  </main>;
}
