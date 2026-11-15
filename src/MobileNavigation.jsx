import React,{useEffect,useState} from 'react';
import {House,Layers,Users,CalendarDays} from 'lucide-react';
import {SITE_PAGES} from './SiteChrome';

const items=[...SITE_PAGES,{href:'/book-a-call',label:'Book a call'}];
const icons=[House,Layers,Users,CalendarDays];
const isEditing=element=>element?.matches?.('input:not([type=radio]):not([type=checkbox]),textarea,select,[contenteditable="true"]')||false;

export default function MobileNavigation(){
  const [editing,setEditing]=useState(false);
  const current=window.location.pathname.replace(/\/+$/,'')||'/';
  useEffect(()=>{
    const focus=event=>setEditing(isEditing(event.target));
    const blur=event=>setEditing(isEditing(event.relatedTarget));
    document.addEventListener('focusin',focus);document.addEventListener('focusout',blur);
    return()=>{document.removeEventListener('focusin',focus);document.removeEventListener('focusout',blur);};
  },[]);
  return <nav className="mobile-app-nav" aria-label="Mobile page navigation" data-editing={editing} inert={editing}>
    {items.map((item,index)=>{const Icon=icons[index];return <a key={item.href} href={item.href} aria-current={current===item.href?'page':undefined}><Icon size={21} strokeWidth={1.7} aria-hidden="true"/><span>{item.label}</span></a>;})}
  </nav>;
}
