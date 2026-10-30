# RISE homepage

A responsive React + Vite homepage adapted from the supplied RISE Framer template. Includes a live canvas particle landscape, staggered RISE entrance, glass details, mobile navigation, keyboard-accessible process tabs, FAQs, and a local project-brief download dialog.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The production output is `dist/`.

## Content and assets

- Main content and booking destination: `src/main.jsx`.
- Responsive layouts and animation: `src/styles.css`.
- `public/rise-logo.svg` is a clean vector recreation of the user-provided black-and-copper logo. Replace it with the original transparent brand asset if available.
- Hero reference artwork comes from the supplied Framer template. The moving foreground is generated in a canvas; it is not a video.
- Geist is served locally. The template’s original booking destination is retained until a final company contact URL is supplied.
- The project brief form only downloads a text file. It does not submit, store, or send information to a server.

## Accessibility and motion

System reduced-motion preferences are respected. The hero includes an animation pause control. Animation stops rendering while the hero is offscreen or the tab is hidden, and canvas resolution and frame rates are capped for mobile devices. Navigation, process tabs, FAQs, and the modal support keyboard use.
