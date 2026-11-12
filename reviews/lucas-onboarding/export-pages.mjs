// Each HTML retains the complete exported app. Startup actions open a real screen, never a recreated template.
import fs from 'node:fs';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname);
const folder=path.join(root,'seperatre i. files');fs.mkdirSync(folder,{recursive:true});
const base=fs.readFileSync(path.join(root,'PULS_Deine_Aenderungen.html'),'utf8');
const branch=fs.readFileSync(path.join(root,'.runtime/proposal/dist/branch.js'),'utf8');
const goals=Function(`return (${branch.match(/export const GOALS = ([\s\S]*?);\n/)[1]})`)();
const pages=[];
const add=(file,title,section,config)=>pages.push({file,title,section,...config});
add('01-start.html','Startseite','Onboarding',{screen:'home'});
add('02-karte.html','Karte auswählen','Onboarding',{screen:'cards'});
add('03-demo-pin.html','Simulierte PIN-Eingabe','Onboarding',{screen:'pin'});
add('04-einfuehrung.html','Start with your plans','Onboarding',{screen:'intro'});
add('05-lebensplaene.html','Lebenspläne auswählen','Onboarding',{screen:'goals'});
for(const [goal,info] of Object.entries(goals)){
 add(`frage-${goal}-01.html`,`${info.label} · Zeitpunkt`,'Fragen je Lebensplan',{screen:'q1',goal});
 add(`frage-${goal}-02.html`,`${info.label} · ${info.question}`,'Fragen je Lebensplan',{screen:'q2',goal});
 add(`frage-${goal}-03.html`,`${info.label} · ${info.preparation}`,'Fragen je Lebensplan',{screen:'q3',goal});
}
add('06-themen-prioritaeten.html','Themenprioritäten · bestehende Daumen-Auswahl','Onboarding',{screen:'priorities'});
add('07-datenquellen.html','Datenquellen · Übersicht','Datenquellen',{screen:'sources'});
for(const [mode,title] of [['bank','Bank verbinden'],['csv','CSV importieren'],['manual','Manuell hinzufügen']])add(`08-datenquelle-${mode}.html`,title,'Datenquellen',{screen:'sources',assetMode:mode});
add('09-bank-vorschau.html','Bankverbindung · Demo-Salden prüfen','Datenquellen',{screen:'bank-preview'});
add('10-puls-score.html','PULS · Score-Übersicht','PULS Hauptansichten',{screen:'score'});
for(const [screen,title] of [['fitness','Financial fitness'],['behaviour','Financial behavior'],['report','Score report'],['capability','Capability assessment'],['weekly','Weekly advice'],['edit-priorities','Personalize priorities'],['simulator','Simulator · Lebensereignisse'],['simulator-family','Simulator · Family'],['simulator-retirement','Simulator · Retirement'],['learn','Lernpfad'],['progress','Fortschritt']])add(`puls-${screen}.html`,title,'PULS Hauptansichten',{screen});
for(const [id,title] of [['lesson-cash','Cash buffer'],['lesson-borrowing','Borrowing'],['lesson-diversification','Diversification'],['lesson-fraud','Fraud']])add(`lernen-${id}.html`,`Lektion · ${title}`,'Lernen',{screen:'lesson',lesson:id});
for(const [screen,title] of [['bank-home','Mobile banking · Übersicht'],['invest','Mobile banking · Investments'],['services','Mobile banking · Services']])add(`mobile-${screen}.html`,title,'Mobile banking',{screen});
function openPage(config){
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const find=async selector=>{const limit=Date.now()+12000;while(Date.now()<limit){const el=document.querySelector(selector);if(el&&!el.disabled)return el;await delay(25);}throw Error('Ansicht nicht verfügbar: '+selector);};
 const click=async selector=>(await find(selector)).click();
 const answer=async value=>{const field=await find(`#branch-answer input[value="${value}"]`);if(!field.checked)field.click();};
 const submit=async id=>(await find('#'+id)).requestSubmit();
 const finish=()=>{document.body.removeAttribute('data-page-loading');document.body.dataset.exportReady='true';window.scrollTo(0,0);document.activeElement?.blur();};
 (async()=>{
  const screen=config.screen,goal=config.goal||'income';
  if(screen==='home')return finish();
  await click('[data-action="branch"]');if(screen==='cards')return finish();
  await click('[data-branch="read"][data-persona="alex"]');if(screen==='pin')return finish();
  await click('[data-branch="pin"]');await find('[data-branch="goals"]');if(screen==='intro')return finish();
  await click('[data-branch="goals"]');await click(`#branch-goals input[value="${goal}"]`);if(screen==='goals')return finish();
  await submit('branch-goals');await answer('later');if(screen==='q1')return finish();
  await submit('branch-answer');await answer('2');if(screen==='q2')return finish();
  await submit('branch-answer');await answer('1');if(screen==='q3')return finish();
  await submit('branch-answer');await find('#branch-priorities');if(screen==='priorities')return finish();
  await submit('branch-priorities');await find('#data-sources-title');
  if(config.assetMode)await click(`[data-action="asset-mode"][data-id="${config.assetMode}"]`);
  if(screen==='sources')return finish();
  if(screen==='bank-preview'){await click('[data-action="asset-mode"][data-id="bank"]');await click('[data-action="asset-bank"]');await find('[data-action="asset-confirm"]');return finish();}
  await click('[data-action="finish-sources"]');await find('.puls-navigation');if(screen==='score')return finish();
  if(['fitness','behaviour'].includes(screen)){await click(`[data-action="dimension"][data-id="${screen}"]`);return finish();}
  if(['report','capability'].includes(screen)){await click('[data-action="report"]');if(screen==='capability')await click('[data-action="capability"]');return finish();}
  if(screen==='weekly'){await click('[data-action="weekly"]');await find('.weekly-page, .weekly-advice, .weekly-story, [data-action="coach-next"]');return finish();}
  if(screen==='edit-priorities'){await click('[data-action="priorities"]');return finish();}
  if(screen.startsWith('simulator')){await click('[data-action="dimension"][data-id="readiness"]');if(screen!=='simulator')await click(`[data-action="long-goal"][data-id="${screen==='simulator-family'?'family':'retirement'}"]`);return finish();}
  if(screen==='learn'||screen==='lesson'){await click('[data-action="dimension"][data-id="literacy"]');if(screen==='lesson')await click(`[data-action="lesson"][data-id="${config.lesson}"]`);return finish();}
  if(screen==='progress'){await click('[data-action="stage"][data-index="3"]');return finish();}
  if(['bank-home','invest','services'].includes(screen)){await click('[data-action="phone"]');if(screen!=='bank-home')await click(`[data-action="${screen}"]`);return finish();}
  throw Error('Unbekannte Exportseite');
 })().catch(error=>{document.body.removeAttribute('data-page-loading');document.body.dataset.exportError=error.message;const note=document.createElement('p');note.setAttribute('role','alert');note.style.cssText='padding:16px;background:#fff3e6;color:#142944';note.textContent='Die Exportseite konnte nicht direkt geöffnet werden. '+error.message+' Der reguläre Ablauf bleibt bedienbar.';document.body.prepend(note);});
}
for(const page of pages){
 let html=base.replace('<title>PULS · Deine Änderungen</title>',`<title>PULS · ${page.title.replaceAll('&','&amp;').replaceAll('<','&lt;')}</title>`).replace('<body>','<body data-page-loading>');
 html=html.replace('</head>','<style>body[data-page-loading]{visibility:hidden}</style>\n</head>');
 html=html.replace('</body>',`<script>(${openPage.toString()})(${JSON.stringify(page)});</script>\n</body>`);
 fs.writeFileSync(path.join(folder,page.file),html);
}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const sections=[...new Set(pages.map(p=>p.section))];
const index=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PULS · Einzelne Seiten</title><style>body{font:16px/1.5 system-ui;color:#142944;background:#f4f7fb;margin:0}main{max-width:1000px;margin:auto;padding:32px 24px}h1{letter-spacing:-.04em}h2{margin:32px 0 12px}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}a{display:block;background:white;border:1px solid #dce5ef;border-radius:10px;padding:12px 16px;color:#0756bc;text-decoration:none}a:hover{text-decoration:underline}p{color:#556c87;max-width:760px}@media(max-width:600px){ul{grid-template-columns:1fr}}</style><main><h1>PULS · Einzelne Seiten</h1><p>${pages.length} eigenständige HTML-Dateien deiner aktuellen Version. Jede Datei öffnet automatisch die angegebene Ansicht der vollständigen Anwendung. Der Aufbau wird aus dem echten App-Code erzeugt. Beim Öffnen späterer Seiten werden die nötigen Demo-Schritte kurz im Hintergrund ausgeführt.</p><p>Die bestehende Daumen-Auswahl ist unverändert. Schrift: Inter über Google Fonts, mit Systemschrift als Offline-Ersatz. Keine echte Bankverbindung, kein KI-Backend.</p>${sections.map(section=>`<h2>${section}</h2><ul>${pages.filter(p=>p.section===section).map(p=>`<li><a href="${p.file}" target="_blank">${esc(p.title)}</a></li>`).join('')}</ul>`).join('')}</main></html>`;
fs.writeFileSync(path.join(folder,'index.html'),index);
fs.writeFileSync(path.join(folder,'seiten.json'),JSON.stringify(pages,null,2)+'\n');
fs.writeFileSync(path.join(folder,'README.md'),`# Einzelne HTML-Seiten\n\nindex.html öffnen. ${pages.length} eigenständige Ansichten; jede HTML-Datei enthält die vollständige Anwendung samt Styles, Bildern und Demo-Bankdaten. Kein Server erforderlich. Der genaue Dateiname des Ordners ist wie gewünscht „seperatre i. files“.\n\nDie richtige Ansicht wird durch das Ausführen der bestehenden Demo-Aktionen geöffnet, ohne eigene Seiten-Templates oder Änderungen an den App-Funktionen. Spätere Ansichten benötigen kurz für die ursprüngliche PIN-/Scan-Animation. Danach ist die Seite regulär bedienbar.\n\nEnthalten: Onboarding, alle drei Fragen für jeden der elf Lebenspläne, bestehende Themenprioritäten, Datenquellen und Eingabemodi, Hauptansichten, vier Lektionen und Mobile Banking. Nicht jede mögliche Zwischenmeldung, Dialog- oder Antwortkombination ist eine eigene Datei.\n\nDer zuletzt besprochene Vorschlag zum Ersetzen der Daumen wurde nicht umgesetzt. Jede Datei zeigt den aktuellen freigegebenen Designstand. Demo-Antworten sind bei direkten Fragenansichten exemplarisch vorausgewählt.\n\nNeu erzeugen: im übergeordneten Ordner node export-pages.mjs ausführen, nachdem die einzelne Gesamt-HTML exportiert wurde.\n`);
console.log(`Exported ${pages.length} pages to ${folder}`);
