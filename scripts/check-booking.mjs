import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {COMPANY_EMAIL,CONTACT_ENDPOINT,CALL_SERVICES,enquiryPayload,sendEnquiry} from '../src/bookingApi.js';

const valid={name:' Test Client ',email:'client@example.com',service:CALL_SERVICES[0],message:' Please help plan our web application. '};
const payload=enquiryPayload(valid);
assert.equal(payload['Client name'],'Test Client');assert.equal(payload._replyto,valid.email);
assert.equal(payload._template,'box');
assert.equal(payload._url,'https://www.risetechnologies.tech/book-a-call');
assert.equal(payload._subject,'RISE | New enquiry | Full-stack development | Test Client');
assert.equal(payload['Project brief'],valid.message.trim());
assert.equal(payload['Contact number'],'Not provided');
assert.ok(!/[\r\n]/.test(enquiryPayload({...valid,name:'Test\r\nClient'})._subject));
assert.equal(COMPANY_EMAIL,'risetechnologies285@gmail.com');assert.equal(CONTACT_ENDPOINT,`https://formsubmit.co/ajax/${COMPANY_EMAIL}`);
for(const invalid of [{...valid,email:'invalid'},{...valid,name:'  '},{...valid,message:'  '},{...valid,service:'unknown'},{...valid,message:'x'.repeat(3001)}])assert.throws(()=>enquiryPayload(invalid));
for(const success of [true,'true'])await sendEnquiry(payload,{fetcher:async(url,options)=>{assert.equal(url,CONTACT_ENDPOINT);assert.equal(options.method,'POST');assert.equal(JSON.parse(options.body)._replyto,valid.email);return {ok:true,json:async()=>({success})};}});
for(const result of [{success:'false'},{success:false},{},{success:true,message:'Please activate your email address'}])await assert.rejects(sendEnquiry(payload,{fetcher:async()=>({ok:true,json:async()=>result})}));
await assert.rejects(sendEnquiry(payload,{fetcher:async()=>({ok:false,json:async()=>({success:true})})}));
await assert.rejects(sendEnquiry(payload,{fetcher:async()=>({ok:true,json:async()=>{throw new Error('Not JSON');}})}));
await assert.rejects(sendEnquiry(payload,{fetcher:async()=>{throw new TypeError('Network error');}}));

const dom=new JSDOM('<!doctype html><html><head><title>RISE</title></head><body><div id="root"></div></body></html>',{url:'http://localhost/book-a-call',pretendToBeVisual:true});
globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.HTMLElement=dom.window.HTMLElement;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
globalThis.requestAnimationFrame=fn=>setTimeout(()=>fn(performance.now()),5);globalThis.cancelAnimationFrame=clearTimeout;
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
const errors=[],originalError=console.error;console.error=(...args)=>errors.push(args.join(' '));
let pending,requests=0,lastPayload;
globalThis.fetch=async(url,options)=>{requests++;assert.equal(url,CONTACT_ENDPOINT);lastPayload=JSON.parse(options.body);return new Promise(resolve=>{pending=resolve;});};
const output=await build({entryPoints:['src/main.jsx'],bundle:true,write:false,platform:'node',format:'esm',loader:{'.css':'empty'},external:['react','react-dom/client','lucide-react'],jsx:'automatic'});
await mkdir('.sites-runtime',{recursive:true});const file=path.resolve('.sites-runtime/booking-check.mjs');await writeFile(file,output.outputFiles[0].text);
const {appRoot}=await import(pathToFileURL(file).href);
const settle=()=>new Promise(resolve=>setTimeout(resolve,30));
async function until(fn){const end=Date.now()+10000;while(!fn()&&Date.now()<end)await settle();assert.ok(fn(),'Expected form state');}
function input(selector,value){const el=document.querySelector(selector);Object.getOwnPropertyDescriptor(el instanceof window.HTMLTextAreaElement?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));}
function submit(){document.querySelector('.booking-panel form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}
try{
 await until(()=>document.querySelector('#call-email'));
 submit();assert.equal(requests,0,'Invalid forms never call the mail service');
 input('#call-name','Test Client');input('#call-email','client@example.com');input('#call-phone','+91 98765 43210');input('#call-message','Please help build our application.');await settle();
 submit();await until(()=>requests===1&&document.querySelector('button[type="submit"]').disabled);
 submit();assert.equal(requests,1,'Duplicate submissions are prevented');
 assert.equal(document.querySelector('button[type="submit"]').disabled,true);
 assert.equal(lastPayload['Contact number'],'+91 98765 43210');
 assert.equal(lastPayload._url,'http://localhost/book-a-call');
 assert.equal(lastPayload.email,'client@example.com');assert.equal(lastPayload._replyto,'client@example.com');
 pending({ok:false,json:async()=>({success:false})});
 await until(()=>document.querySelector('.booking-status').dataset.state==='error');
 assert.equal(document.querySelector('#call-message').value,'Please help build our application.');
 assert.equal(document.querySelector('#call-email').value,'client@example.com');
 assert.equal(document.querySelector('#call-phone').value,'+91 98765 43210');
 assert.equal(document.querySelector('button[type="submit"]').disabled,false);
 submit();await until(()=>requests===2);pending({ok:true,json:async()=>({success:'true',message:'Please activate your email address'})});
 await until(()=>document.querySelector('.booking-status').dataset.state==='error');
 assert.match(document.querySelector('.booking-status').textContent,/awaiting email verification/);
 submit();await until(()=>requests===3);pending({ok:true,json:async()=>({success:'true',message:'Form successfully submitted'})});
 await until(()=>document.querySelector('.booking-status').dataset.state==='success');
 assert.match(document.querySelector('.booking-status').textContent,/A call is not booked yet/);
 assert.equal(document.querySelector('#call-phone').value,'');
 assert.equal(document.querySelector('#call-email').value,'');assert.equal(document.querySelector('#call-message').value,'');
 input('#call-name','Test Client');input('#call-email','client@example.com');input('#call-message','Another project enquiry.');await settle();
 document.querySelector('[name="_honey"]').value='spam';submit();assert.equal(requests,3,'Honeypot submissions are not sent');
 dom.reconfigure({url:'https://www.risetechnologies.tech/book-a-call?private=not-forwarded#form'});
 const live=enquiryPayload(valid);
 assert.equal(live._url,'https://www.risetechnologies.tech/book-a-call');
 assert.equal(live['Enquiry source'],live._url);
 assert.equal(live['Company website'],'https://www.risetechnologies.tech');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: enquiry destination, client Reply-To, required fields, provider errors and activation state, retry recovery, successful submission, duplicate prevention, and honeypot. No real emails sent.');
}finally{appRoot.unmount();dom.window.close();console.error=originalError;await unlink(file);}
