import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {mkdir,writeFile,unlink,access} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {teamScrollPosition,teamPortraitPose,teamHeroPose,TEAM_SCROLL_END} from '../src/teamData.js';

const expected=[['Mohamed Khaja Eshaq','AI Engineer','md-khaja-eshaq'],['Mamidi Tejeshwar','ML Engineer','m-tejeshwar'],['Maddineni Deepak','QA Engineer','m-deepak'],['Miriyala Sai Kiran','Full Stack Developer','m-sai-kiran'],['Mabbu Trilok','ML Engineer','m-trilok'],['Kottala Jithendra Sesha Sai Ram','Research and Data Analyst','k-jithendra']];
const dom=new JSDOM('<!doctype html><html><head><title>Home</title><meta name="description" content="Home description"></head><body><div id="root"></div></body></html>',{url:'http://localhost/team',pretendToBeVisual:true});
globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.HTMLElement=dom.window.HTMLElement;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const preferences=new Map();
globalThis.matchMedia=query=>{if(!preferences.has(query))preferences.set(query,{matches:query.includes('pointer: fine'),listeners:new Set(),addEventListener(type,fn){this.listeners.add(fn);},removeEventListener(type,fn){this.listeners.delete(fn);}});return preferences.get(query);};
globalThis.requestAnimationFrame=fn=>setTimeout(()=>fn(performance.now()),5);globalThis.cancelAnimationFrame=clearTimeout;
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
globalThis.IntersectionObserver=class{constructor(fn){this.fn=fn;}observe(target){this.fn([{target,isIntersecting:true}]);}disconnect(){}};
window.innerHeight=900;window.innerWidth=1440;window.scrollY=0;
let lastScroll,scrolledMember;
window.scrollTo=options=>{lastScroll=options;window.scrollY=options.top;window.dispatchEvent(new window.Event('scroll'));};
HTMLElement.prototype.scrollIntoView=function(){scrolledMember=this.id;};
const errors=[];console.error=(...args)=>errors.push(args.join(' '));
const output=await build({entryPoints:['src/main.jsx'],bundle:true,write:false,platform:'node',format:'esm',loader:{'.css':'empty'},external:['react','react-dom/client','lucide-react'],jsx:'automatic'});
await mkdir('.sites-runtime',{recursive:true});const file=path.resolve('.sites-runtime/team-check.mjs');await writeFile(file,output.outputFiles[0].text);
const {appRoot}=await import(pathToFileURL(file).href);
const settle=()=>new Promise(resolve=>setTimeout(resolve,30));
async function until(fn){const end=Date.now()+10000;while(!fn()&&Date.now()<end)await settle();assert.ok(fn(),'Expected scroll position is reached');}
try{
 await until(()=>document.title==='Our Team — RISE');
 const page=document.querySelector('.team-page'),story=document.querySelector('.team-story'),stage=document.querySelector('.team-stage');
 assert.ok(page,'/team renders the Team page');assert.equal(document.querySelector('.framer-TV27D'),null,'Homepage does not render on /team');
 assert.equal(document.title,'Our Team — RISE');
 assert.equal(document.querySelector('.site-header-template a[aria-current="page"]').getAttribute('href'),'/team');
 assert.equal(document.querySelector('.site-header-template a[aria-label="RISE home"]').getAttribute('href'),'/');
 const portraits=[...document.querySelectorAll('.team-portrait')],index=[...document.querySelectorAll('.team-index button')];
 assert.equal(portraits.length,6);assert.equal(index.length,6);
 assert.equal(new Set(portraits.map(p=>p.querySelector('img').src)).size,6);
 assert.equal(portraits[5].querySelector('h2 .team-name-suffix').textContent,'Sesha Sai Ram','Jithendra retains his complete name with a smaller suffix');
 for(let i=0;i<6;i++){
  const [name,role,slug]=expected[i],p=portraits[i];
  assert.equal(p.querySelector('h2').textContent,name);assert.equal(p.querySelector('.team-role').textContent,role);
  assert.equal(p.querySelector('img').getAttribute('src'),`/team/${slug}.jpeg`);assert.equal(p.querySelector('img').alt,name);
  await access(path.resolve('public/team',`${slug}.jpeg`));
 }
 Object.defineProperty(stage,'clientHeight',{configurable:true,get:()=>window.innerHeight-(window.innerWidth<810?72:0)});
 story.getBoundingClientRect=()=>({top:-window.scrollY,height:window.innerHeight*7.6,left:0,width:window.innerWidth});
 const opacity=p=>parseFloat(p.style.getPropertyValue('--person-opacity'));
 window.dispatchEvent(new window.Event('resize'));await settle();
 assert.match(document.querySelector('.team-hero h1').textContent,/Meet the people behind RISE/);
 assert.equal(document.querySelector('.team-hero').style.getPropertyValue('--hero-opacity'),'1.0000');
 assert.ok(portraits.every(p=>opacity(p)===0),'Hero starts alone');
 for(let i=0;i<6;i++){
   index[i].click();assert.equal(lastScroll.behavior,'smooth');
   await until(()=>index[i].getAttribute('aria-current')==='true'&&opacity(portraits[i])===1);
   assert.equal(document.querySelectorAll('.team-portrait[data-active="true"]').length,1);
 }
 assert.equal(document.querySelector('.team-hero').style.getPropertyValue('--hero-opacity'),'0.0000');
 const exiting=teamPortraitPose(0,1.6),entering=teamPortraitPose(1,1.6);
 assert.ok(exiting.opacity>0&&exiting.opacity<1&&entering.opacity>0&&entering.opacity<1,'Portraits crossfade');
 assert.ok(entering.z<0&&entering.scale<1,'Next portrait emerges from depth');
 assert.equal(teamPortraitPose(5,7).opacity,0,'Last portrait fades as footer enters');
 assert.equal(teamHeroPose(1).opacity,0);
 const wheel=new window.WheelEvent('wheel',{deltaY:200,cancelable:true,bubbles:true});stage.dispatchEvent(wheel);assert.equal(wheel.defaultPrevented,false);
 const touch=new window.Event('touchmove',{cancelable:true,bubbles:true});stage.dispatchEvent(touch);assert.equal(touch.defaultPrevented,false);
 document.querySelector('.team-portraits').dispatchEvent(new window.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
 await until(()=>index[5].getAttribute('aria-current')==='true');
 document.querySelector('.team-portraits').dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
 assert.equal(lastScroll.top,6/TEAM_SCROLL_END*900*6.6,'Final member does not loop back');
 stage.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
 await until(()=>document.querySelector('.team-hero').style.getPropertyValue('--hero-opacity')==='1.0000');
 assert.equal(document.querySelectorAll('.team-index [aria-current]').length,0,'Reverse scrolling restores hero');
 assert.equal(teamScrollPosition(-8000,4320,900),7);assert.equal(teamScrollPosition(200,4320,900),0);
 window.innerWidth=390;window.innerHeight=844;window.dispatchEvent(new window.Event('resize'));await settle();
 index[4].click();await until(()=>index[4].getAttribute('aria-current')==='true');
 assert.equal(page.dataset.static,'false','Portrait phones keep the animated story');
 window.innerHeight=390;window.dispatchEvent(new window.Event('resize'));await settle();
 assert.equal(page.dataset.static,'true','Short landscape screens use natural document flow');
 for(const [width,height] of [[320,568],[360,640],[375,667],[768,540]]){window.innerWidth=width;window.innerHeight=height;window.dispatchEvent(new window.Event('resize'));await until(()=>page.dataset.static==='true');}
 index[2].click();assert.equal(scrolledMember,'member-m-deepak');
 window.innerWidth=390;window.innerHeight=844;window.dispatchEvent(new window.Event('resize'));await settle();
 const reduced=preferences.get('(prefers-reduced-motion: reduce)');reduced.matches=true;reduced.listeners.forEach(fn=>fn());await settle();
 assert.equal(page.dataset.static,'true');assert.equal(page.dataset.reduced,'true');
 await until(()=>portraits.every(p=>p.style.getPropertyValue('--person-y')===''));
 for(const p of portraits)assert.equal(p.style.getPropertyValue('--person-y'),'');
 index[5].click();assert.equal(scrolledMember,'member-k-jithendra');
 assert.equal(document.querySelectorAll('.team-portrait img').length,6,'Reduced motion keeps every person available');
 for(const a of document.querySelectorAll('a[href^="#"]'))assert.ok(document.getElementById(a.getAttribute('href').slice(1)));
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: /team route, exact photo/name/role order, unique portraits, hero-first depth crossfades and selection, index/keyboard navigation, finite ends, native wheel/touch, phone and short-landscape modes, reduced motion, page metadata.');
}finally{appRoot.unmount();dom.window.close();await unlink(file);}
