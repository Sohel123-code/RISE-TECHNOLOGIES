export const COMPANY_EMAIL='risetechnologies285@gmail.com';
export const COMPANY_WEBSITE='https://www.risetechnologies.tech';
export const CONTACT_ENDPOINT=`https://formsubmit.co/ajax/${COMPANY_EMAIL}`;
export const CALL_SERVICES=['Full-stack development','Data analytics','AI & ML','UI/UX design','Quality assurance','Student project','Not sure yet'];

export function enquiryPayload(draft){
  const name=draft.name.trim(),email=draft.email.trim(),message=draft.message.trim(),phone=(draft.phone||'').trim();
  if(!name||name.length>100||!email||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!message||message.length>3000||!CALL_SERVICES.includes(draft.service))throw new Error('Please enter your name, a valid email, and your project details.');
  if(phone.length>40)throw new Error('Please keep your contact number within 40 characters.');
  // FormSubmit renders these labels in order; keep `email` for its reply support.
  // The subject is a single line even when a name is supplied outside the UI.
  const subjectName=name.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,60);
  // Identify the real submitting website, without forwarding query parameters.
  // Local testing stays labelled as local; the live site uses its own origin.
  const sourceUrl=typeof window!=='undefined'&&/^https?:$/.test(window.location.protocol)
    ?new URL('/book-a-call',window.location.origin).href
    :`${COMPANY_WEBSITE}/book-a-call`;
  return {
    'Client name':name,
    email,
    'Contact number':phone||'Not provided',
    'Service requested':draft.service,
    'Project brief':message,
    'Next step':'Reply directly to the client to discuss requirements and arrange an introductory call.',
    'Company website':COMPANY_WEBSITE,
    'Enquiry source':sourceUrl,
    'Company':'RISE — Results. Innovation. Solutions. Engineering.',
    _replyto:email,
    _url:sourceUrl,
    _subject:`RISE | New enquiry | ${draft.service} | ${subjectName}`,
    _template:'box',
    _honey:'',
  };
}

export async function sendEnquiry(payload,{signal,fetcher=fetch}={}){
  const response=await fetcher(CONTACT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),credentials:'omit',signal});
  let result;try{result=await response.json();}catch{throw new Error('The mail service returned an unexpected response. Please email us directly or try again later.');}
  // Activation is a mailbox-owner step, never a delivered enquiry.
  if(/activat|confirm.{0,25}(email|address)/i.test(String(result?.message||'')))throw new Error('Our enquiry form is awaiting email verification. Please use the email link to contact us directly for now.');
  if(!response.ok||!(result?.success===true||result?.success==='true'))throw new Error('The mail service did not accept your enquiry. Please email us directly or try again later.');
}
