import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, Menu, X, Code2, Layers3, Braces, Terminal, Check, CheckCheck, GraduationCap, Mouse, Pause, Play, Download, Sparkles, MoveUpRight } from 'lucide-react';
import './styles.css';

const bookingUrl = 'https://tidy-airport-868077.framer.app/book-a-call';
const services = [
  { title: 'Student projects.', subtitle: 'Build it. Understand it. Own it.', description: 'From the first “what if” to your final presentation. Hands-on guidance to plan, build, debug, and understand every part of your project.', tags: ['Project planning', 'Development', 'Walkthroughs'], icon: GraduationCap, art: 'code' },
  { title: 'Custom software.', subtitle: 'Your workflow. Your solution.', description: 'Thoughtful websites, web applications, dashboards, and everyday tools. Built around what you need, with room to grow.', tags: ['Websites & apps', 'Dashboards', 'Business tools'], icon: Layers3, art: 'dashboard' },
  { title: 'A little help. A big leap.', subtitle: 'Technical project assistance', description: 'Stuck on a bug or the next big feature? Move forward with focused debugging, integrations, testing, and deployment guidance.', tags: ['Debugging', 'Integrations', 'Deployment'], icon: Braces, art: 'terminal' },
  { title: 'Beyond the launch.', subtitle: 'Ongoing support', description: 'Software is a journey. Keep yours running smoothly with maintenance, thoughtful improvements, and support as your needs evolve.', tags: ['Maintenance', 'Improvements', 'Support'], icon: Sparkles, art: 'support' },
];
const steps = [
  { number: '01', title: 'Discover & plan', label: 'A good start changes everything.', description: 'Tell us about your idea, your goals, and your timeline. Together, we define the scope, choose the right technology, and map out a practical way forward.', items: ['A conversation about your idea', 'Clear scope and milestones', 'The right tools for the job'], file: 'project-plan.md', lines: ['# A plan for your next big idea', '', '01  Understand the problem', '02  Define what matters', '03  Map the way forward'], status: 'Clarity before code' },
  { number: '02', title: 'Build & collaborate', label: 'Good things are built together.', description: 'We bring the plan to life in clear milestones. See progress through demos, share feedback, and understand the decisions behind your software.', items: ['Development in manageable milestones', 'Regular demos and honest updates', 'Your feedback, built into the process'], file: 'build-together.js', lines: ['const idea = yourVision;', '', 'await design(idea);', 'await build({ withYou: true });', 'await improve(yourFeedback);'], status: 'Your vision, taking shape' },
  { number: '03', title: 'Deliver & support', label: 'Ready for the real world.', description: 'Receive tested software, setup guidance, and a walkthrough. Students get help understanding and presenting their work; businesses get a clear path beyond launch.', items: ['Testing and deployment guidance', 'A practical code walkthrough', 'Agreed support for what comes next'], file: 'ready-to-rise.md', lines: ['# Built. Tested. Ready.', '', '[✓] Features reviewed', '[✓] Walkthrough completed', '[✓] Ready for your next chapter'], status: 'Made to move you forward' },
];
const faqs = [
  ['Can you help with my student project?', 'Yes. We help with ideas, planning, implementation, debugging, and code walkthroughs so you can understand what you build. We work with you in line with your institution’s academic requirements.'],
  ['Do you build software for businesses too?', 'Absolutely. We develop custom websites, web applications, dashboards, and practical business tools around your specific requirements and everyday workflows.'],
  ['Can you improve a project I already have?', 'Yes. Share your existing project and what you want to improve. We can scope targeted debugging, new features, integrations, testing, or deployment support.'],
  ['How long will my project take?', 'That depends on the scope, complexity, and your deadline. We agree on milestones and delivery expectations with you before development starts.'],
  ['How does pricing work?', 'Pricing is based on the agreed scope and complexity. We discuss your requirements and share an estimate before work begins. Changes to the scope are discussed together.'],
  ['Will you explain how everything works?', 'Yes. Code walkthroughs, setup instructions, documentation, and presentation guidance can be included. We agree on the exact guidance and support as part of your project scope.'],
];

function useMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(false);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setReduced(query.matches); query.addEventListener('change', change); return () => query.removeEventListener('change', change); }, []);
  return { still: reduced || paused, paused, setPaused };
}

function ParticleWave({ still }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let width = 0, height = 0, frame = 0, visible = true, previous = 0, elapsed = 0;
    const pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) draw(0);
    };
    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      smooth.x += (pointer.x - smooth.x) * .035; smooth.y += (pointer.y - smooth.y) * .035;
      const columns = width < 600 ? 95 : 160, rows = width < 600 ? 42 : 60;
      for (let row = 0; row < rows; row++) {
        const z = row / rows, perspective = .35 + z * .95;
        const alpha = .12 + z * .48;
        ctx.fillStyle = `rgba(${160 + Math.round(z * 26)},${207 + Math.round(z * 30)},${101 + Math.round(z * 27)},${alpha})`;
        ctx.beginPath();
        for (let col = 0; col < columns; col++) {
          const x = col / (columns - 1);
          const wave = Math.sin(x * 11 + z * 5 + t * .6) * .60 + Math.cos(x * 6 - z * 7 - t * .36) * .35;
          const px = (x - .5) * width * (1.75 * perspective) + width / 2 + smooth.x * 22 * z;
          const py = height * (.43 + z * .53) + wave * height * (.10 + z * .10) + smooth.y * 13 * z;
          const radius = .45 + z * 1.05;
          ctx.moveTo(px + radius, py); ctx.arc(px, py, radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    const animate = (now) => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden) { previous = now; return; }
      if (now - previous < (width < 600 ? 50 : 32)) return;
      elapsed += Math.min(now - previous, 60) / 1000; previous = now; draw(elapsed);
    };
    const move = e => { const r = canvas.getBoundingClientRect(); pointer.x = (e.clientX - r.left) / r.width - .5; pointer.y = (e.clientY - r.top) / r.height - .5; };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(canvas);
    canvas.parentElement.addEventListener('pointermove', move, { passive: true });
    resize(); if (!still) frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); canvas.parentElement?.removeEventListener('pointermove', move); };
  }, [still]);
  return <canvas ref={canvasRef} className="particle-wave" aria-hidden="true" />;
}

function Reveal({ children, className = '', delay = 0, ...props }) {
  const ref = useRef(null);
  useEffect(() => { const el = ref.current; const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); observer.unobserve(el); } }, { threshold: .1 }); observer.observe(el); return () => observer.disconnect(); }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }} {...props}>{children}</div>;
}

function Brand({ footer = false }) {
  return <a href="#home" aria-label="RISE home" className={`brand ${footer ? 'brand-footer' : ''}`}><img src="/rise-logo.svg" width="126" height="31" alt="RISE"/><span>RESULTS. INNOVATION. SOLUTIONS. ENGINEERING.</span></a>;
}

function Button({ children, className = '', href, onClick, icon: Icon = ArrowUpRight, ...props }) {
  const Tag = href ? 'a' : 'button';
  return <Tag className={`button ${className}`} href={href} onClick={onClick} {...props}><span>{children}</span><span className="button-icon"><Icon size={18} strokeWidth={1.7}/></span></Tag>;
}

function ServiceArt({ type }) {
  if (type === 'code') return <div className="service-art code-art" aria-hidden="true"><span className="float-tag"><Check size={12}/> A little clearer. A lot further.</span><div className="code-window"><div className="window-top"><span className="window-dots">● ● ●</span><span>your-next-idea.js</span><Code2 size={14}/></div><div className="code-content"><div><em>01</em><span className="code-purple">const</span> project = {'{'}</div><div><em>02</em> &nbsp; idea: <span className="code-green">'Something great'</span>,</div><div><em>03</em> &nbsp; guidance: <span className="code-orange">true</span>,</div><div><em>04</em> &nbsp; possibilities: <span className="code-green">'Endless'</span></div><div><em>05</em>{'}'};</div><div><em>06</em><span className="code-purple">await</span> <span className="code-green">bringToLife</span>(project);<span className="cursor"/></div></div></div><div className="art-icon"><GraduationCap size={27}/></div></div>;
  if (type === 'dashboard') return <div className="service-art dashboard-art" aria-hidden="true"><div className="dashboard-window"><div className="dashboard-sidebar"><span className="mini-mark">r.</span><span/><span/><span/><span/></div><div className="dashboard-main"><div className="dashboard-top"><span>Your workspace</span><span>↗</span></div><div className="dashboard-metrics"><div><small>One clear view</small><b>All connected.</b></div><span className="metric-icon"><Layers3 size={20}/></span></div><div className="chart">{[25, 40, 32, 55, 44, 65, 59, 78, 68, 90, 80, 100].map((h,i)=><i key={i} style={{ '--height': `${h}%`, '--i': i }}/>)}</div><div className="dashboard-bottom"><span>BUILT AROUND YOU</span><span>↗</span></div></div></div><div className="dashboard-chip"><span className="status-dot"/> Less busywork. More possibility.</div></div>;
  if (type === 'terminal') return <div className="compact-art terminal-art" aria-hidden="true"><Terminal size={19}/><span><span className="muted-code">$</span> npm run possibilities</span><span className="terminal-result"><CheckCheck size={15}/> Ready to move forward</span></div>;
  return <div className="compact-art support-art" aria-hidden="true"><span className="support-pulse"><Check size={22}/></span><div><strong>Built for what’s next.</strong><span>Maintained. Improved. Supported.</span></div><span className="support-line"/></div>;
}

function ProjectDialog({ open, onClose }) {
  const ref = useRef(null);
  const [projectType, setProjectType] = useState('Student project');
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => { const dialog = ref.current; if (open) { dialog.showModal(); setDownloaded(false); document.body.style.overflow = 'hidden'; } else { dialog.close(); document.body.style.overflow = ''; } return () => { document.body.style.overflow = ''; }; }, [open]);
  function downloadBrief(e) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    const content = `RISE — Project brief\n\nProject type: ${projectType}\nName: ${data.get('name')}\nIdea: ${data.get('idea')}\nTimeline: ${data.get('timeline') || 'To discuss'}\n\nBring this brief to your first conversation with RISE.\nBooking: ${bookingUrl}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'my-rise-project-brief.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
  }
  return <dialog ref={ref} className="project-dialog" onCancel={onClose} onClick={e => { if (e.target === ref.current) onClose(); }} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="close-button" aria-label="Close project brief" onClick={onClose}><X size={21}/></button><span className="eyebrow"><span className="status-dot"/> A SMALL START. A BIG POSSIBILITY.</span><h2 id="dialog-title">Let’s bring your<br/>idea to life<span className="green-text">.</span></h2><p>Create a short project brief to bring to our first conversation.</p><form onSubmit={downloadBrief}><fieldset><legend>What are you working on?</legend><div className="type-options">{['Student project','Business software','An existing project'].map(type => <label className={projectType === type ? 'selected' : ''} key={type}><input type="radio" name="project-type" value={type} checked={projectType === type} onChange={() => setProjectType(type)}/>{type}</label>)}</div></fieldset><label className="field">Your name<input name="name" autoComplete="name" placeholder="What should we call you?" required maxLength={120}/></label><label className="field">A little about your idea<textarea name="idea" placeholder="What would you like to build or improve?" required rows={3} maxLength={2500}/></label><label className="field">Your timeline <span>(optional)</span><input name="timeline" placeholder="A date, a month, or just exploring" maxLength={120}/></label><Button className="button-dark" icon={Download} type="submit">{downloaded ? 'Download brief again' : 'Download my project brief'}</Button><p className="form-note" role="status">{downloaded ? 'Your brief is ready. Nothing has been sent — bring it to your call.' : 'Your details stay in this browser. This form downloads a brief; it does not send an enquiry.'}</p></form><a className="text-link" href={bookingUrl} target="_blank" rel="noreferrer">Continue to book a free call <ArrowUpRight size={17}/></a></div></dialog>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false), [activeStep, setActiveStep] = useState(0), [faqOpen, setFaqOpen] = useState(0), [projectOpen, setProjectOpen] = useState(false);
  const { still, paused, setPaused } = useMotion();
  const step = steps[activeStep];
  const openProject = () => { setMenuOpen(false); setProjectOpen(true); };
  useEffect(() => { const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);
  return <div className={still ? 'site motion-paused' : 'site'} id="home">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="nav-wrap"><Brand/><nav aria-label="Main navigation" id="primary-navigation" className={menuOpen ? 'nav-links menu-open' : 'nav-links'}>{[['About us','about'],['Services','services'],['Our process','process']].map(([name,id])=><a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{name}</a>)}<button className="mobile-project" onClick={openProject}>Discuss your project <ArrowUpRight size={16}/></button></nav><div className="nav-actions"><a className="nav-cta" href={bookingUrl} target="_blank" rel="noreferrer">Let’s talk <ArrowUpRight size={17}/></a><button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button></div></div></header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title"><div className="hero-texture"/><ParticleWave still={still}/><div className="hero-shade"/><div className="hero-content"><div className="hero-topline"><span><span className="status-dot"/> IDEAS INTO REAL POSSIBILITIES</span><span>SOFTWARE. WITH A HUMAN SIDE.</span></div><h1 id="hero-title" className="rise-title" aria-label="RISE">{'RISE'.split('').map((letter,i)=><span className="letter-mask" key={letter}><span style={{ '--letter': i }}>{letter}</span></span>)}<span className="rise-period" aria-hidden="true"/></h1><div className="hero-message"><p className="hero-headline">Your next big idea.<br/><span>Let’s make it real.</span></p><div className="hero-description"><p>From your first line of code to software that makes a difference. We help students build with confidence and businesses move forward.</p><div className="hero-buttons"><Button className="button-lime" onClick={openProject}>Discuss your project</Button><a className="hero-secondary" href="#process">How we work <ArrowDown size={17}/></a></div></div></div><div className="hero-bottom"><span>STUDENT PROJECTS <b>↗</b> REAL-WORLD SOFTWARE</span><a href="#about" className="scroll-cue"><span>SCROLL TO EXPLORE</span><ArrowDown size={16}/></a><button className="motion-toggle" onClick={() => setPaused(v => !v)} aria-label={paused ? 'Play animations' : 'Pause animations'} aria-pressed={paused}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button></div></div></section>
      <div className="values-strip" aria-label="Results. Innovation. Solutions. Engineering.">{['Results','Innovation','Solutions','Engineering'].map((word,i)=><React.Fragment key={word}><span>{word}<span className="word-dot">.</span></span>{i < 3 && <span className="strip-star" aria-hidden="true">✳</span>}</React.Fragment>)}</div>
      <section id="about" className="about-section section-shell"><Reveal className="section-eyebrow"><span className="eyebrow"><span className="tiny-plus">+</span> THE PEOPLE BEHIND THE POSSIBILITIES</span><span className="section-number">01 / ABOUT RISE</span></Reveal><div className="about-grid"><Reveal><h2>Your ideas.<br/>Our engineering.<br/><span className="muted-heading">Real possibilities.</span></h2></Reveal><Reveal delay={120} className="about-copy"><span className="small-symbol" aria-hidden="true">↗</span><p className="lead">Big ambitions deserve a team<br className="desktop-break"/> that gets them.</p><p>We’re RISE, a software development and services company turning ideas into practical digital solutions.</p><p>Whether you’re a student building your first project or a business ready for something better, we work alongside you. Clear communication. Thoughtful development. Support that stays.</p><a className="text-link" href="#services">Find your way forward <ArrowUpRight size={18}/></a></Reveal></div><Reveal className="about-note"><span><Code2 size={18}/> Built with you. Built for you.</span><p>One committed team. From the first conversation to what comes next.</p></Reveal></section>
      <section id="services" className="services-section section-shell"><Reveal className="section-eyebrow"><span className="eyebrow"><span className="tiny-plus">+</span> WHAT WE CAN DO TOGETHER</span><span className="section-number">02 / OUR SERVICES</span></Reveal><Reveal className="section-heading"><h2>Software that solves.<br/><span className="muted-heading">Support that stays.</span></h2><p>A fresh start or a next step.<br/>There’s a way forward, together.</p></Reveal><div className="services-grid">{services.map((s,i)=><Reveal key={s.title} delay={i % 2 * 100} className={`service-card service-${s.art}`}><div className="card-top"><span className="service-icon"><s.icon size={21}/></span><span className="card-number">0{i+1}</span></div>{i < 2 && <ServiceArt type={s.art}/>}<div className="service-copy"><span className="service-kicker">{s.subtitle}</span><h3>{s.title}</h3><p>{s.description}</p></div>{i > 1 && <ServiceArt type={s.art}/>}<div className="card-bottom"><div className="tags">{s.tags.map(t=><span key={t}>{t}</span>)}</div><button className="circle-link" aria-label={`Discuss ${s.title.replace('.','').toLowerCase()}`} onClick={openProject}><ArrowUpRight size={20}/></button></div></Reveal>)}</div></section>
      <section id="process" className="process-section"><div className="section-shell"><Reveal className="section-eyebrow"><span className="eyebrow"><span className="tiny-plus">+</span> LESS GUESSWORK. MORE MOMENTUM.</span><span className="section-number">03 / THE PROCESS</span></Reveal><Reveal className="section-heading"><h2>From “what if”<br/>to <span className="lime-text">“it works.”</span></h2><p>A clear path from your first idea<br/>to a project you can be proud of.</p></Reveal><Reveal><div className="process-tabs" role="tablist" aria-label="Our working process">{steps.map((s,i)=><button key={s.number} role="tab" id={`step-tab-${i}`} aria-selected={activeStep === i} aria-controls={`step-panel-${i}`} tabIndex={activeStep === i ? 0 : -1} className={activeStep === i ? 'active' : ''} onClick={() => setActiveStep(i)} onKeyDown={e => { let next; if(e.key==='ArrowRight') next=(i+1)%3; if(e.key==='ArrowLeft') next=(i+2)%3; if(e.key==='Home') next=0; if(e.key==='End') next=2; if(next !== undefined) {e.preventDefault(); setActiveStep(next); document.getElementById(`step-tab-${next}`).focus();} }}><span>{s.number}</span>{s.title}<ArrowUpRight size={20}/></button>)}</div><div className="process-panel" key={activeStep} role="tabpanel" id={`step-panel-${activeStep}`} aria-labelledby={`step-tab-${activeStep}`} tabIndex={0}><div className="process-description"><span className="process-overline">GOOD SOFTWARE STARTS WITH PEOPLE</span><h3>{step.label}</h3><p>{step.description}</p><ul>{step.items.map(item=><li key={item}><Check size={15}/>{item}</li>)}</ul></div><div className="process-visual"><div className="process-orbit orbit-one"/><div className="process-orbit orbit-two"/><div className="process-code"><div className="window-top"><span className="window-dots">● ● ●</span><span>{step.file}</span><Code2 size={15}/></div><div className="process-lines">{step.lines.map((line,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span>{line || '\u00a0'}</div>)}</div><div className="process-status"><span className="status-dot"/>{step.status}</div></div><div className="process-floating"><span>YOU + RISE</span><ArrowUpRight size={24}/></div></div></div></Reveal></div></section>
      <section className="why-section section-shell"><Reveal className="why-intro"><span className="eyebrow"><span className="tiny-plus">+</span> A PARTNER, NOT JUST A PROVIDER</span><h2>Good code.<br/>Even better<br/><span className="muted-heading">collaboration.</span></h2><Button className="button-dark" onClick={openProject}>Let’s build together</Button></Reveal><div className="principles">{[['Clarity from day one.','A shared plan, clear scope, and honest conversations. You know what we’re building and why.'],['Built around you.','Your idea, your goals, your way of working. We shape the solution to fit, from the ground up.'],['Understanding comes with it.','We explain the decisions and walk through the code, so you can move forward with confidence.'],['A next step, together.','Launch is a milestone. We agree on the support and improvements that help you keep moving.']].map(([title,desc],i)=><Reveal key={title} className="principle" delay={i*50}><span className="principle-number">0{i+1}</span><div><h3>{title}</h3><p>{desc}</p></div><ArrowUpRight size={20}/></Reveal>)}</div></section>
      <section id="faq" className="faq-section section-shell"><Reveal className="faq-intro"><span className="eyebrow"><span className="tiny-plus">+</span> A LITTLE MORE CLARITY</span><h2>Good questions.<br/><span className="muted-heading">Straight answers.</span></h2><p>Something else on your mind?</p><a className="text-link" href={bookingUrl} target="_blank" rel="noreferrer">Let’s talk it through <ArrowUpRight size={17}/></a></Reveal><Reveal className="faq-list">{faqs.map(([q,a],i)=><div className={`faq-item ${faqOpen === i ? 'faq-open' : ''}`} key={q}><h3><button aria-expanded={faqOpen === i} aria-controls={`faq-answer-${i}`} id={`faq-question-${i}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span>{q}</span>{faqOpen === i ? <Minus size={19}/> : <Plus size={19}/>}</button></h3><div className="faq-answer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} inert={faqOpen !== i}><div><p>{a}</p></div></div></div>)}</Reveal></section>
      <section className="contact-section" id="contact"><div className="contact-grid" aria-hidden="true"/><Reveal><span className="eyebrow"><span className="status-dot"/> YOUR NEXT CHAPTER STARTS WITH A CONVERSATION</span><h2>You bring the idea.<br/>Together, we <span>rise<ArrowUpRight aria-hidden="true"/></span>.</h2><p>A student project. A business tool. Something completely new.<br/>Let’s turn your “what if” into what’s next.</p><Button className="button-dark" onClick={openProject}>Discuss your project</Button><span className="contact-note">A simple conversation. A clearer way forward.</span></Reveal></section>
    </main><footer className="site-footer section-shell"><div className="footer-top"><Brand footer/><p>Practical software.<br/>Human at heart.</p><div><a href="#about">About us</a><a href="#services">Services</a><a href="#process">Our process</a><a href="#faq">FAQs</a></div><a className="back-top" href="#home" aria-label="Back to top"><MoveUpRight size={23}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RISE. All rights reserved.</span><span>Results. Innovation. Solutions. Engineering.</span><a href="#home">Made to move you forward <ArrowUpRight size={13}/></a></div></footer><ProjectDialog open={projectOpen} onClose={() => setProjectOpen(false)}/>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
