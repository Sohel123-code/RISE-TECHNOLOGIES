import React,{useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Check,LoaderCircle,Mail} from 'lucide-react';
import {COMPANY_EMAIL,CALL_SERVICES,enquiryPayload,sendEnquiry} from './bookingApi';
import './booking.css';

const KEY='rise-call-draft-v1';
function loadDraft(){
  const empty={name:'',email:'',phone:'',service:CALL_SERVICES[0],message:''};
  try{const draft=JSON.parse(window.localStorage.getItem(KEY)||'null');if(draft)return {...empty,name:String(draft.name||'').slice(0,100),service:CALL_SERVICES.includes(draft.service)?draft.service:CALL_SERVICES[0],message:String(draft.message||'').slice(0,3000)};}catch{}
  return empty;
}
export default function BookCallPage(){
  const [draft,setDraft]=useState(loadDraft),[status,setStatus]=useState({kind:'idle',text:''});
  const busy=useRef(false),request=useRef(null),mounted=useRef(true);
  const sending=status.kind==='sending';
  useEffect(()=>{
    mounted.current=true;
    const previous=document.title,meta=document.querySelector('meta[name="description"]'),oldDescription=meta?.content;
    document.title='Book a Call \u2014 RISE';if(meta)meta.content='Tell RISE about your project. Send an enquiry and our team will reply to your email to discuss the next steps.';
    return()=>{mounted.current=false;request.current?.abort();document.title=previous;if(meta)meta.content=oldDescription;};
  },[]);
  function change(event){setDraft(value=>({...value,[event.target.name]:event.target.value}));setStatus({kind:'idle',text:''});}
  async function submit(event){
    event.preventDefault();if(busy.current)return;
    if(!event.currentTarget.reportValidity())return;
    // The hidden field is only for automated submissions; never send it onward.
    if(event.currentTarget.elements.namedItem('_honey').value)return;
    let payload;try{payload=enquiryPayload(draft);}catch(error){setStatus({kind:'error',text:error.message});return;}
    busy.current=true;setStatus({kind:'sending',text:'Sending your enquiry...'});
    const controller=new AbortController();request.current=controller;
    const timeout=setTimeout(()=>controller.abort(),20000);
    try{
      await sendEnquiry(payload,{signal:controller.signal});
      if(!mounted.current)return;
      setStatus({kind:'success',text:'Your enquiry has been submitted. We will reply to your email to discuss your project and arrange a call. A call is not booked yet.'});
      setDraft({name:'',email:'',phone:'',service:CALL_SERVICES[0],message:''});
      try{window.localStorage.removeItem(KEY);}catch{}
    }catch(error){
      if(mounted.current)setStatus({kind:'error',text:error.name==='AbortError'?'The request timed out, so we could not confirm submission. Your details are still here. Please email us directly before retrying to avoid duplicate enquiries.':error instanceof TypeError?'We could not confirm submission. Check your connection or email us directly. Your details are still here.':error.message});
    }finally{clearTimeout(timeout);busy.current=false;request.current=null;}
  }
  return <main className="booking-page" id="booking-main">
    <section className="booking-intro" data-scroll-rise>
      <span className="booking-eyebrow">LET'S BUILD SOMETHING TOGETHER</span>
      <h1>Good ideas start<br/>with a <em>conversation.</em></h1>
      <p>Tell us what you have in mind. A student project, a custom application, or an idea you want to explore.</p>
      <div className="booking-availability"><span/> Start a conversation with RISE</div>
      <a className="booking-email" href={`mailto:${COMPANY_EMAIL}`}><Mail size={16}/><span>{COMPANY_EMAIL}</span><ArrowUpRight size={15}/></a>
      <ul><li><Check size={15}/> Share your idea and requirements</li><li><Check size={15}/> Get a reply from our team</li><li><Check size={15}/> Arrange a call and explore next steps</li></ul>
    </section>
    <section className="booking-panel" aria-labelledby="booking-form-title" data-scroll-rise data-scroll-order="1">
      <span className="booking-eyebrow">CONNECT WITH OUR TEAM</span><h2 id="booking-form-title">Your project, in a few words.</h2>
      <p className="booking-note">Send your enquiry to RISE. We will use your email to reply and arrange a conversation.</p>
      <form onSubmit={submit} aria-busy={sending} aria-describedby="booking-privacy">
        <label htmlFor="call-name">Your name</label><input id="call-name" name="name" autoComplete="name" required maxLength={100} disabled={sending} value={draft.name} onChange={change} placeholder="Your name"/>
        <label htmlFor="call-email">Your email</label><input id="call-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} disabled={sending} value={draft.email} onChange={change} placeholder="you@example.com"/>
        <label htmlFor="call-phone">Contact number <span>(optional)</span></label><input id="call-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} disabled={sending} value={draft.phone} onChange={change} placeholder="Include your country code, e.g. +91"/>
        <fieldset disabled={sending}><legend>What would you like to discuss?</legend><div className="booking-options">{CALL_SERVICES.map(service=><label key={service}><input type="radio" name="service" value={service} checked={draft.service===service} onChange={change}/><span>{service}</span></label>)}</div></fieldset>
        <label htmlFor="call-message">Your idea or question</label><textarea id="call-message" name="message" rows={5} required maxLength={3000} disabled={sending} value={draft.message} onChange={change} placeholder="What would you like to build or improve?"/>
        <div className="booking-honey" aria-hidden="true"><label htmlFor="call-website">Leave this field empty</label><input id="call-website" name="_honey" tabIndex={-1} autoComplete="off"/></div>
        <p className="booking-privacy" id="booking-privacy">Your name, email, contact number (if provided), and project details will be sent to RISE through <a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener noreferrer">FormSubmit</a> so we can respond to your enquiry.</p>
        <button type="submit" disabled={sending}>{sending?'Sending...':'Send enquiry'}{sending?<LoaderCircle className="booking-spinner" size={18}/>:<ArrowUpRight size={18}/>}</button>
        <p className="booking-status" role="status" aria-live="polite" aria-atomic="true" data-state={status.kind}>{status.text}</p>
      </form>
    </section>
  </main>;
}
