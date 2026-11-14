# RISE — original Framer template in React

This homepage retains the supplied template's original CSS, fonts, images and responsive variants, with rotating hero copy.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates `dist/`. `npm run preview` serves the production build.

## Files

- `src/template.json`: original page structure rendered as React elements, without an iframe or a dependency on Framer's JavaScript runtime.
- `src/template.css`: original styles, including desktop, tablet and phone layouts.
- `src/main.jsx`: React service accordions, FAQs, mobile navigation, reveals and hero motion.
- `src/styles.css`: interaction transitions and the originally requested logo and RISE entrance.
- `public/template-assets/`: locally hosted original images and fonts.
- `scripts/import-template.py`: importer for `../reference-latest.html`. Requires Python BeautifulSoup and tinycss2; only needed to import an updated snapshot.

The top-left logo is the vector recreation of the supplied image from the first implementation. The green hero motion gently displaces the original image. Reduced-motion preferences retain the original static artwork.

The site includes the homepage, `/team`, and `/book-a-call` pages. Other unimplemented pages retain their original destinations on the user's Framer website. The hero phrases describe RISE's student assistance and software development services.

Source parity is not device-by-device visual verification. Browser visual QA depends on the available browser connection.

## Dynamic interactions

- Original green artwork flows with ambient waves and responds to a mouse pointer. Rendering stops when the hero is offscreen, the tab is hidden, or reduced motion is enabled. A gentle CSS fallback is used when WebGL is unavailable.
- The original transparent navigation gains glass blur while scrolling and highlights the current section.
- Service panels and FAQs expand/collapse through animated grid heights; hidden links remain unfocusable.
- Fine-pointer devices get subtle magnetic buttons, card tilt, moving highlights, and image zoom. Touch devices retain ordinary tap behavior.
- Mobile navigation animates in and out, closes on link selection, outside press, Escape, or desktop resize. Escape returns focus to the trigger.
- Every homepage content section now has scroll-driven rise and fade entrances: About, Services, Process, Comparison, FAQs, the closing call to action, and footer. Headings and rows enter independently with scroll-based staggering and reverse naturally when scrolling back. Phone movement is shorter; keyboard focus reveals controls immediately, and reduced-motion mode shows all content without these effects. The original RISE entrance and hero parallax remain.

Run `npm test` for DOM interaction and accessibility-state checks. These do not replace real-browser visual or GPU performance testing.

## November animation references

`AnimatedTextRotator.jsx` reproduces the default character blur preset from the supplied [AnimatedTextRotatorVF component](https://framer.com/m/AnimatedTextRotator-vf-JL9C8s.js@OhyYXRLeYqpLezkQp1Qg): 8px blur, 450ms entry, 350ms exit, 60ms entry stagger, 36ms exit stagger and 1.6s hold. The RISE wordmark retains its rise-from-below entrance. Rotating hero phrases are editable in `HERO_WORDS`.

Hero animation files: `src/AnimatedTextRotator.jsx`, `src/useAnimationGate.js`, `src/animationMath.js`, `src/hero-animation.css`.

The original template CSS and JSON remain unchanged. The external Framer component is not executed at runtime, and the screen recording is not published with the website.

## Team page

`/team` and `/team/` render the six supplied portraits in this order:

1. Md Khaja Eshaq ? AI Engineer ? image 1
2. M Tejeshwar ? ML Engineer ? image 2
3. M Deepak ? QA Engineer ? image 3
4. M Sai Kiran ? Full Stack Developer ? image 4
5. M Trilok ? ML Engineer ? image 5
6. K Jithendra ? Research and Data Analyst ? image 6

The Team page begins with "Meet the people behind RISE." Native scrolling fades the hero and brings each portrait forward from depth with the person's name and role. Portraits overlap through a fade, in the supplied order, and the last person leads into the shared footer. Scrolling back reverses the sequence. Index buttons and arrow/Home/End keys navigate the story (Home returns to the introduction). Portrait phones keep the animation; short landscape screens and reduced-motion preferences show all six portraits in normal document flow. No biographies or social profiles have been invented.

Files: `src/TeamPage.jsx`, `src/teamData.js`, `src/team.css`, `public/team/`. Original JPEG bytes are preserved. `vite.config.js` emits `dist/team/index.html` with Team-specific metadata for direct static-host access. Desktop and mobile homepage navigation link to `/team`.

`npm test` includes Team route, photo/name/role mapping, scroll geometry, selection, finite boundaries, native touch/wheel, responsive-mode and accessibility-state checks. These DOM checks do not verify rendered portrait crops or device performance. Browser visual QA and publication remain blocked by unavailable browser infrastructure and the existing Sites project returning `NOT_FOUND`.

`src/useScrollEntrance.js` batches scroll and resize updates into animation frames and recalculates after fonts, images, and accordion layout changes. It animates existing content groups without adding sections, altering page order, or intercepting scrolling.

## Shared site layout

Home, Team, and Book a call render the same `SiteHeader` and `SiteFooter` from `src/SiteChrome.jsx`, reusing the original Framer header/footer design. The entire closing section is shared: the green artwork, project call to action, and footer navigation, with the original desktop, tablet, and phone variants. `src/siteTemplate.js` separates those template nodes from page content so they are never rendered twice. The primary desktop and mobile navigation contains Home, Team, and the existing call link; homepage section shortcuts have been removed. The current page is highlighted. Footer section links use home-root URLs so they work from all three pages.

The interaction suite compares the rendered header and footer DOM between routes, verifies one shared instance per route, and checks mobile menu dismissal and keyboard focus. Homepage and shared-footer scroll entrances remain enabled.


## Book a call

All booking links open `/book-a-call` with the common header and green footer. The enquiry form requires a name, reply email, service, and message, and includes an optional contact number that is sent with the enquiry. It submits through [FormSubmit](https://formsubmit.co/documentation) to `risetechnologies285@gmail.com`. The visitor's address is set as Reply-To; the form does not impersonate their email account. Enquiry emails use FormSubmit's boxed template, with a RISE/service/client subject and ordered client details, contact number, service, project brief, follow-up note, source, and company signature. FormSubmit controls the outer email layout and branding; custom HTML or logo styling is not supplied by this integration. It requests a conversation, not a confirmed calendar booking.

**One-time setup required:** submit the form from the actual website, then open the FormSubmit activation email in `risetechnologies285@gmail.com` (check spam) and confirm the address. Submit a test again after activation and verify receipt and Reply-To before treating delivery as live. No Gmail password or API key is required. The local build does not prove mailbox delivery; the hosting deployment must also contain this version.

`src/bookingApi.js` holds the fixed recipient, payload validation, and provider request. The page keeps the form in place, prevents duplicate clicks while sending, times out after 20 seconds, retains details after a failed/uncertain request, and only shows submission success after an explicit successful provider response. A honeypot filters basic automated submissions; provider abuse controls are not disabled. The direct company email link remains available. FormSubmit processes the submitted information; a disclosure links its privacy terms. Client contact details are not newly saved in browser storage. Legacy local drafts are restored where possible and removed after a successful submission.

`node scripts/check-booking.mjs` checks validation, destination and Reply-To, success/error/activation responses, failed-request recovery, and duplicate prevention using mocked requests; tests never send real client email. Run `npm test` and `npm run build` for all routes.


## What we do

`/what-we-do` introduces five services: full-stack development, data analytics, AI and machine learning, UI/UX design, and quality assurance. The hero leads into a reversible scroll story with five distinct HTML/SVG illustrations, service details, a progress indicator, and keyboard-accessible chapter controls. Decorative animations only run for the active chapter while the page is visible. Short viewports and reduced-motion preferences use normal document flow. Illustrations are conceptual, not client results or measured performance claims.

The shared navigation and footer link to this page, and its full green footer is rendered by the common site layout. `vite.config.js` emits its direct-access static entry. `scripts/check-services.mjs` covers sequence behavior, navigation, responsive fallbacks, and reduced motion.


## Production domain

The official website is `https://www.risetechnologies.tech`. Enquiry emails include this company website and pass the submitting page's origin plus `/book-a-call` through FormSubmit's `_url` field. On the live domain this is `https://www.risetechnologies.tech/book-a-call`; local tests are explicitly identified by their local origin. Query parameters and fragments are not forwarded.

Deploy the output of `npm run build` (`dist/`) to the production host, including its `book-a-call/index.html` entry. After deploying, submit a test from the live HTTPS page, complete any FormSubmit confirmation requested for that form, and check the company inbox and spam folder. This configuration sets the website source; FormSubmit remains the email delivery service and the recipient remains `risetechnologies285@gmail.com`. Sending as an address at `@risetechnologies.tech` would need a verified domain email service.
