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

The site includes the homepage, `/team`, and `/book-a-call` pages. All template page links use local RISE destinations. The unbuilt Articles link is removed, and What we do replaces the old Case Studies entry. The hero phrases describe RISE's student assistance and software development services.

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

1. Mohamed Khaja Eshaq ? AI Engineer ? image 1
2. Mamidi Tejeshwar ? ML Engineer ? image 2
3. Maddineni Deepak ? QA Engineer ? image 3
4. Miriyala Sai Kiran ? Full Stack Developer ? image 4
5. Mabbu Trilok ? ML Engineer ? image 5
6. Kottala Jithendra Sesha Sai Ram ? Research and Data Analyst ? image 6

The Team page begins with "Meet the people behind RISE." Native scrolling fades the hero and brings each portrait forward from depth with the person's name and role. Portraits overlap through a fade, in the supplied order, and the last person leads into the shared footer. Scrolling back reverses the sequence. Index buttons and arrow/Home/End keys navigate the story (Home returns to the introduction). Portrait phones keep the animation; short landscape screens and reduced-motion preferences show all six portraits in normal document flow. Full names are used in headings, image descriptions, and navigation. Jithendra's "Sesha Sai Ram" suffix uses a smaller line. No biographies or social profiles have been invented.

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


## Mobile refinement

`src/responsive.css` adds safe-area spacing, scrollable menus for landscape phones, larger touch controls, readable form inputs, contact text wrapping, and narrower homepage card layouts. `useCompactViewport.js` uses stable viewport measurements and normal document flow on short screens so Team and What we do content stays reachable. DOM interaction checks and the production build pass; these do not establish compatibility with every physical device.

## Liquid heroes and green smoke

The Team and What we do introductions use the warp shader from the supplied [AnimatedLiquidBackground component](https://framer.com/m/AnimatedLiquidBackground-Prod-vIhm.js@ghH1aHLmGZ0iE7qXDFVk), mounted locally in `LiquidHeroBackground.jsx` with RISE's olive/sage palette and a dark text scrim. `liquidShader.js` records the shader source. This effect is limited to these two heroes. It pauses outside the introduction, offscreen, in hidden tabs, and for reduced-motion preferences. WebGL2 failures fall back to green CSS gradients. Rendering is capped at 30 fps, with a lower pixel budget and fewer swirl iterations on phones.

`SmokeCursor.jsx` supplies fluid smoke inside each page's hero only, using the November 15 recording as its movement reference. `fluidSmoke.js` replaces the original blurred particles with a local WebGL2 fluid simulation: pointer momentum, pressure projection, advection, and vorticity confinement at strength 25 produce connected plumes and rolling wisps. Sage highlights and darker olive folds match RISE; screen blending preserves the page beneath. This is a recreation from the video, not the original Framer cursor component.

The native pointer and all controls remain usable. Touch/coarse pointers and reduced motion disable the effect and release its textures; form fields do not emit smoke. The original 80% opacity, fluid density, and four-second fade are restored. Each canvas is positioned and clipped inside its hero, with pointer coordinates relative to that hero. Leaving the hero or scrolling clears the smoke immediately; Team portraits and service scenes disable it. The booking form, body sections, navigation, and footer have no smoke. Hidden tabs, blur, context loss, and unmount clear the simulation. Simulation, dye, and output resolutions have separate pixel budgets; pointer input is capped per frame. WebGL2/float framebuffer failures preserve the ordinary cursor. `ambient-effects.css` contains both effects' presentation. No runtime dependencies or remote scripts were added; the recording stays outside the published website.

`scripts/check-ambient.mjs` instruments the rendering lifecycle to check motion gates, touch/input behavior, resource cleanup, context recovery, and the mobile pixel budget. Real-browser rendering and GPU performance still need visual/device verification.


## Mobile app-style layout

`MobileNavigation.jsx` adds one shared phone-only bottom tab bar for Home, What we do, Team, and Book a call, with a current-page marker and large tap targets. It hides and becomes inert while text fields are focused so it does not compete with the on-screen keyboard. Desktop navigation is unchanged.

`mobile-app.css` adds a compact glass header, rounded controls, fluid hero typography, stacked homepage actions, shorter section spacing, safe-area gutters, and mobile form cards with 16px inputs. A reserved 72px navigation area plus the bottom safe area prevents content from sitting under the tab bar. Sticky Team and What we do stages use the remaining viewport height; `useCompactViewport` accounts for that space before choosing an animated story or natural-flow cards. Full team names remain readable, including the smaller Sesha Sai Ram line. Short and landscape layouts remain scrollable, and browser zoom is not disabled.

Automated checks cover current-page links on all routes, field-focus hiding/restoring, and compact layout selection at phone sizes from 320x568 through 430x932 and landscape 768x540. These DOM checks do not measure real browser layout or guarantee compatibility with every physical device.


## Team name motion

`TeamMemberCopy.jsx` and `team-name.css` give each name a masked, word-by-word rise and soft fade, followed by the role and a short sage accent line. The active portrait triggers the entrance in the scroll story; compact mobile cards trigger it as their copy enters the viewport. Returning to a person replays the entrance. Full names remain intact for assistive technology, the smaller Sesha Sai Ram line is preserved, and reduced-motion mode exposes all words and roles immediately. No looping text effects or layout-changing animations are used.


Team name typography uses the bundled Inter Semibold font with tighter editorial spacing; the smaller suffix uses Inter Medium. A soft ivory-to-sage metallic highlight runs directly through the visible letters, with a quiet pause between passes. It runs only while that person's copy is revealed. Reduced-motion and forced-color modes use solid, readable text. No external fonts are requested.


## Homepage scroll story

The homepage keeps the same template content, images, destinations, and section order. `homeStoryMotion.js` and `home-story.css` add reversible depth, a masked heading reveal, and image parallax to existing content groups. Their outer boxes remain stable layout anchors; no duplicated panels, scroll locking, or replacement content is introduced. The hero copy eases backward and fades as scrolling brings in the next section, with a separate movement layer for the original green artwork and a thin reading-progress line.

The existing scroll hooks batch these effects into event-driven animation frames, update after layout changes, and stop in hidden tabs. Phones use a smaller scale shift with no depth blur or rotation. Focused controls are fully revealed, and reduced-motion preferences restore static presentation. The homepage interaction checks verify forward/reverse motion, stable geometry, mobile limits, unchanged copy/image order, and existing accordions, navigation, and form routes.
