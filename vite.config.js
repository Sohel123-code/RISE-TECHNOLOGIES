import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Physical entries support direct navigation on static hosts without rewrites.
function pageEntries(){
  let output;
  const pages=[
    ['what-we-do','What We Do \u2014 RISE','Full-stack development, data analytics, AI and machine learning, UI/UX design, and quality assurance for students and businesses.'],
    ['team','Our Team \u2014 RISE','Meet the six people behind RISE: AI, machine learning, quality assurance, full stack development, research and data analysis.'],
    ['book-a-call','Book a Call \u2014 RISE','Prepare your project conversation with RISE. Call scheduling is coming soon.'],
  ];
  return {name:'page-entries',configResolved(config){output=path.resolve(config.root,config.build.outDir);},async closeBundle(){
    const source=await readFile(path.join(output,'index.html'),'utf8');
    for(const [route,title,description] of pages){
      await mkdir(path.join(output,route),{recursive:true});
      const html=source.replace(/<title>.*?<\/title>/,`<title>${title}</title>`)
        .replace(/<meta name="description" content="[^"]*"\/?\s*>/,`<meta name="description" content="${description}"/>`);
      await writeFile(path.join(output,route,'index.html'),html);
    }
  }};
}
export default defineConfig({ plugins: [react(),pageEntries()] });
