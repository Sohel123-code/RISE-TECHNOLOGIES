import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {servicePose} from '../src/servicesData.js';

const dom=new JSDOM('<!doctype html><html><head><title>Home</title><meta name="description" content="Home description"></head><body><div id="root"></div></body></html>',{url:'http://localhost/what-we-do',pretendToBeVisual:true});
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
await mkdir('.sites-runtime',{recursive:true});const file=path.resolve('.sites-runtime/services-check.mjs');await writeFile(file,output.outputFiles[0].text);
const {appRoot}=await import(pathToFileURL(file).href);
const settle=()=>new Promise(resolve=>setTimeout(resolve,30));
async function until(fn){const end=Date.now()+10000;while(!fn()&&Date.now()<end)await settle();assert.ok(fn(),'Expected scroll position is reached');}
try{
 await until(()=>document.querySelector('.expertise-page'));
 const page=document.querySelector('.expertise-page'),story=document.querySelector('.expertise-story'),stage=document.querySelector('.expertise-stage'),hero=document.querySelector('.expertise-hero');
 const scenes=[...document.querySelectorAll('.expertise-scene')],buttons=[...document.querySelectorAll('.expertise-bottom nav button')];
 assert.equal(scenes.length,5);assert.equal(buttons.length,5);
 assert.deepEqual(scenes.map(scene=>scene.querySelector('h2').textContent),['Full-stack development','Data analytics','AI & machine learning','UI/UX design','Quality assurance']);
 assert.equal(document.querySelectorAll('[data-site-header]').length,1);assert.equal(document.querySelectorAll('[data-site-footer]').length,1);
 assert.equal(document.querySelectorAll('[data-site-footer] .framer-1gggnc9-container').length,3);
 assert.equal(new Set(scenes.map(scene=>scene.querySelector('.expert-art').className)).size,5,'Each service has its own illustration');
 Object.defineProperty(stage,'clientHeight',{configurable:true,get:()=>window.innerHeight-(window.innerWidth<810?72:0)});
 story.getBoundingClientRect=()=>({top:-window.scrollY,height:window.innerHeight*6.5,left:0,width:window.innerWidth});
 window.dispatchEvent(new window.Event('resize'));
 await until(()=>hero.style.getPropertyValue('--intro')==='1');
 assert.ok(scenes.every(scene=>scene.dataset.visible==='false'),'Introduction appears before service scenes');
 const opacity=i=>parseFloat(scenes[i].style.getPropertyValue('--scene-opacity'));
 for(let i=0;i<5;i++){
  buttons[i].click();await until(()=>buttons[i].getAttribute('aria-current')==='step'&&opacity(i)===1);
  assert.equal(lastScroll.behavior,'smooth');assert.equal(document.querySelectorAll('.expertise-scene[data-active="true"]').length,1);
 }
 assert.equal(hero.inert,true,'Hidden introduction cannot receive focus');
 assert.ok(servicePose(0,1.6).opacity>0&&servicePose(1,1.6).opacity>0,'Outgoing and incoming services crossfade');
 assert.equal(servicePose(4,6).opacity,0,'Final service yields to footer');
 stage.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
 await until(()=>hero.style.getPropertyValue('--intro')==='1');assert.equal(hero.inert,false);
 stage.dispatchEvent(new window.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
 await until(()=>buttons[4].getAttribute('aria-current')==='step');
 const end=lastScroll.top;
 stage.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));assert.equal(lastScroll.top,end,'The story has a finite end');
 for(const type of ['wheel','touchmove']){const event=new window.Event(type,{bubbles:true,cancelable:true});stage.dispatchEvent(event);assert.equal(event.defaultPrevented,false,'Native scrolling remains enabled');}
 window.innerWidth=430;window.innerHeight=932;window.dispatchEvent(new window.Event('resize'));await settle();
 assert.equal(page.dataset.static,'false','Tall phones retain the scroll story');
 window.innerWidth=390;window.innerHeight=844;window.dispatchEvent(new window.Event('resize'));await until(()=>page.dataset.static==='true');
 assert.equal(page.dataset.static,'true','The bottom navigation is included in the available story height');
 for(const [width,height] of [[320,568],[360,640],[375,667],[390,390]]){window.innerWidth=width;window.innerHeight=height;window.dispatchEvent(new window.Event('resize'));await until(()=>page.dataset.static==='true'&&scenes.every(scene=>!scene.style.getPropertyValue('--scene-opacity')));}
 buttons[2].click();assert.equal(scrolledMember,'ai-ml','Short phones show ordinary scrollable content');
 window.innerWidth=430;window.innerHeight=932;window.dispatchEvent(new window.Event('resize'));await until(()=>page.dataset.static==='false');
 const reduced=preferences.get('(prefers-reduced-motion: reduce)');reduced.matches=true;reduced.listeners.forEach(fn=>fn());
 await until(()=>page.dataset.static==='true'&&scenes.every(scene=>scene.dataset.visible==='true'&&!scene.style.getPropertyValue('--scene-opacity')));
 assert.equal(story.dataset.running,'false');assert.equal(hero.inert,false);
 assert.equal(document.querySelectorAll('.expertise-copy h2').length,5,'Reduced motion retains all service content');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: What we do route, five distinct services and visuals, shared green footer, forward/reverse scroll, crossfades, keyboard navigation, native touch/wheel, compact-phone and reduced-motion layouts.');
}finally{appRoot.unmount();dom.window.close();await unlink(file);}
