// Export the patched application as one HTML document; no UI rewrite.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
const root=path.dirname(new URL(import.meta.url).pathname);
const dist=path.join(root,'.runtime/proposal/dist');
if(!fs.existsSync(path.join(dist,'app.js')))throw Error('Run build-full-apps.mjs first.');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'puls-html-'));
const bundled=path.join(temp,'app.js');
execFileSync('npx',['--yes','--package=esbuild@0.25.12','esbuild',path.join(dist,'app.js'),'--bundle','--format=iife','--target=es2022','--define:import.meta.url="https://puls-standalone.invalid/"','--outfile='+bundled],{stdio:'pipe'});
const data={};
for(const file of fs.readdirSync(path.join(dist,'api/banking')))if(file.endsWith('.json'))data['/api/banking/'+file]=JSON.parse(fs.readFileSync(path.join(dist,'api/banking',file),'utf8'));
// Retain the original banking fixtures and offline demo coach behavior without a server.
const adapter=`(()=>{const fixtures=${JSON.stringify(data)};const nativeFetch=window.fetch.bind(window);window.fetch=async(input,options)=>{const url=new URL(input instanceof Request?input.url:String(input),location.href);if(Object.hasOwn(fixtures,url.pathname))return new Response(JSON.stringify(fixtures[url.pathname]),{status:200,headers:{'Content-Type':'application/json'}});if(url.hostname==='puls-standalone.invalid')return new Response(JSON.stringify({status:'ok',aiConfigured:false}),{status:url.pathname==='/api/health'?200:503,headers:{'Content-Type':'application/json'}});return nativeFetch(input,options);};})();`;
const svg='data:image/svg+xml;base64,'+fs.readFileSync(path.join(dist,'assets/deutsche-bank.svg')).toString('base64');
const pip='data:image/png;base64,'+fs.readFileSync(path.join(dist,'assets/pip.png')).toString('base64');
const inlineAssets=s=>s.replaceAll('./assets/deutsche-bank.svg',svg).replaceAll('./assets/pip.png',pip);
const css=inlineAssets(fs.readFileSync(path.join(dist,'styles.css'),'utf8')+'\n'+fs.readFileSync(path.join(dist,'branch.css'),'utf8'));
let html=inlineAssets(fs.readFileSync(path.join(dist,'index.html'),'utf8'));
html=html.replace('<link rel="stylesheet" href="./styles.css">',`<style>\n${css}\n</style>`).replace(/\s*<link rel="stylesheet" href="\.\/branch.css">/,'').replace(/\s*<script type="module" src="\.\/app.js"><\/script>/,'');
const js=inlineAssets(adapter+'\n'+fs.readFileSync(bundled,'utf8')).replaceAll('</script','<\\/script');
html=html.replace('</body>',`<!-- Single-file export of the proposal. Original UI and demo data retained. -->\n<script>\n${js}\n</script>\n</body>`);
html=html.replace('<title>PULS · Financial health scanner</title>','<title>PULS · Deine Änderungen</title>');
const output=path.join(root,'PULS_Deine_Aenderungen.html');fs.writeFileSync(output,html);fs.rmSync(temp,{recursive:true,force:true});console.log(output+' ('+fs.statSync(output).size+' bytes)');
