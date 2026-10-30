# RISE — original Framer template in React

This homepage uses the supplied template's original structure, CSS, fonts, images, content, section order and responsive variants. The earlier redesign has been replaced.

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

This is homepage-only. Links to other pages retain their original destinations on the user's Framer website. No new contact forms, rewritten copy, or extra sections are introduced.

Source parity is not device-by-device visual verification. Browser visual QA depends on the available browser connection.
