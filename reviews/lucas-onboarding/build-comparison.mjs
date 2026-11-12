// Rebuild only the review artifacts; never writes to the source checkout.
import fs from 'node:fs';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Usage: node build-comparison.mjs /path/to/Lucas-PULS');
const out = path.dirname(new URL(import.meta.url).pathname);
const read = name => fs.readFileSync(path.join(source, 'dist', name), 'utf8');
const write = (name, content) => fs.writeFileSync(path.join(out, name), content);
const branch = read('branch.js');
const features = read('feature-ui.js');
const GOALS = Function(`return (${branch.match(/export const GOALS = ([\s\S]*?);\n/)[1]})`)();
const HORIZONS = Function(`return (${branch.match(/const HORIZONS = ([\s\S]*?);\n/)[1]})`)();
const button = (label, action, variant = '', attrs = '') => `<button type="button" class="button ${variant}" data-action="${action}" ${attrs}>${label}</button>`;
const goalPicker = Function('GOALS', 'DEFAULT_GOALS', `return (${branch.match(/function goalPicker\([\s\S]*?\n\}/)[0]})`)(GOALS, {lena:'buffer',alex:'business',maya:'inheritance'});
const dataView = Function('assetTotals', 'button', `return (${features.match(/export function dataView\([\s\S]*?\n\}/)[0].replace('export ', '')})`)(()=>({cash:0,investment:0,other:0}),button);
const intro = branch.match(/function introduction\(\) \{\n  return `([\s\S]*?)`;\n\}/)[1];
const steps = active => `<ol class="branch-steps" aria-label="Scan setup">${['Register','About PULS','Life plans','Priorities'].map((s,i)=>`<li class="${i<active?'done':''}" ${i===active?'aria-current="step"':''}><span>${i<active?'✓':i+1}</span>${s}</li>`).join('')}</ol>`;
const question = (title, choices, multiple, selected, index) => `<p class="branch-lead">Change jobs or take a break · Question ${index} of 3</p>${multiple?'<p class="question-hint">Select all that apply.</p>':''}<form id="branch-answer"><fieldset class="branch-options"><legend class="sr-only">${title}</legend>${choices.map(([v,label])=>`<label class="branch-option"><input type="${multiple?'checkbox':'radio'}" name="answer" value="${v}" ${multiple?'':'required'} ${selected.includes(String(v))?'checked':''}><span>${label}</span></label>`).join('')}</fieldset><div class="actions"><button type="button" class="button quiet">Back</button><button class="button" type="submit">Continue <span aria-hidden="true">→</span></button></div></form>`;
const views = {
 intro: {title:'Get to know PULS', afterTitle:'Start with your plans', step:1, before:intro, after:'<p class="branch-lead">Choose what’s coming up in your life, then answer a few questions about your finances.</p><div class="actions"><button class="button" type="button" data-branch="goals">Choose your plans <span aria-hidden="true">→</span></button></div>'},
 goals: {title:'What’s coming up for you?',step:2,before:goalPicker('alex',['income'],false)},
 timing:{title:'When do you expect this change?',step:2,before:question('When do you expect this change?',Object.entries(HORIZONS),false,['later'],1)},
 priorities:{title:GOALS.income.question,step:2,before:question(GOALS.income.question,GOALS.income.priority.map((x,i)=>[i,x]),true,['2'],2)},
 sources:{title:'Add data sources',step:2, before:dataView([], '', null, '', true), after:`<div class="sources-review"><h1 id="data-sources-title">Add data sources</h1><p class="subtle">Optional. Connect another account, import a CSV or enter assets manually.</p><div class="source-choices" role="group" aria-label="Ways to add data">${[['bank','Connect a bank'],['csv','Import a CSV'],['manual','Add manually']].map(([id,label])=>`<button type="button" data-action="asset-mode" data-id="${id}" aria-pressed="false">${label}<span aria-hidden="true">→</span></button>`).join('')}</div><p class="sources-disclosure subtle">The measured score uses your verified banking snapshot. Added assets are stored in this demo on this device.</p><div class="sources-score">${button('View my PULS score','finish-sources')}</div></div>`}
};
const proposedDataView = Function('assetTotals', 'button', `return (${fs.readFileSync(path.join(out, 'data-view.proposed.js'), 'utf8').replace(/^\/\/[^\n]*\n/, '').replace('export ', '')})`)(()=>({cash:0,investment:0,other:0}), button);
views.sources.after = proposedDataView([], '', null, '', true);
write('views.json', JSON.stringify(views));
const proposalCss = `/* REVIEW-04: Select the entire card. Keep native inputs available to keyboard and assistive technology. */
.branch-goal,.branch-option { position:relative; min-height:58px; padding:15px 18px; transition:background-color .12s,border-color .12s; }
.branch-goal input,.branch-option input { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
.branch-goal:has(input:checked),.branch-option:has(input:checked) { background:var(--navy); border-color:var(--navy); color:white; }
.branch-goal:has(input:focus-visible),.branch-option:has(input:focus-visible) { outline:3px solid #2673ce; outline-offset:3px; }
@media(prefers-reduced-motion:reduce){.branch-goal,.branch-option{transition:none}}
/* REVIEW-05: Make connection methods the main choices; place the score action outside the asset summary. */
.sources-review { display:grid; gap:16px; }
.sources-review .source-choices { display:grid; gap:10px; margin-top:8px; }
.sources-review .source-choices button { display:flex; align-items:center; justify-content:space-between; width:100%; min-height:64px; padding:16px 20px; text-align:left; font-size:1rem; }
.sources-review .source-choices button[aria-pressed=true] { background:var(--navy); border-color:var(--navy); color:white; }
.sources-review .sources-disclosure { margin-top:4px; font-size:.82rem; }
.sources-review .sources-score { display:flex; justify-content:center; margin-top:12px; }
.sources-review .sources-score .button { min-height:50px; min-width:min(100%,260px); }
.sources-review .sources-summary { padding-top:16px; border-top:1px solid var(--line); }
`;
write('proposal.css',proposalCss);
const header = `<header class="site-header"><div class="shell header-inner"><div class="brand"><img src="deutsche-bank.svg" width="32" height="32" alt=""><span>Deutsche Bank</span></div><div class="mode-switch"><button aria-pressed="true" disabled>Branch</button><button aria-pressed="false" disabled>Mobile banking</button></div></div></header>`;
for(const side of ['before','after']) {
 write(`comparison-${side}.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PULS · ${side}</title><link rel="stylesheet" href="source-styles.css">${side==='after'?'<link rel="stylesheet" href="proposal.css">':''}<style>button:disabled,.button:disabled{opacity:1;cursor:default}</style><body data-view="intake">${header}<main id="main"></main><script type="module">
const views=await (await fetch('views.json')).json();
const key=new URLSearchParams(location.search).get('view')||'intro';const view=views[key]||views.intro;
const after=${side==='after'};
const steps=${JSON.stringify(steps(2))};
const introSteps=${JSON.stringify(steps(1))};
const content=after?(view.after||view.before):view.before;
document.querySelector('main').innerHTML='<section class="branch-flow"><div class="branch-inner">'+(key==='intro'?introSteps:steps)+(key==='sources'?content:'<div class="branch-heading"><h1>'+(after?(view.afterTitle||view.title):view.title)+'</h1><button class="button quiet branch-exit" disabled>Exit scan</button></div><div class="branch-content">'+content+'</div>')+'</div></section>';
// REVIEW-06: Comparison only. Mirror choices between both frames to show the same state.
document.addEventListener('change',e=>{if(e.target.matches('input')){const inputs=[...document.querySelectorAll('input')].map(x=>({name:x.name,value:x.value,checked:x.checked}));parent.postMessage({type:'puls-review-selection',key,inputs},location.origin)}});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data.type!=='puls-review-sync'||e.data.key!==key)return;for(const state of e.data.inputs){const input=[...document.querySelectorAll('input')].find(x=>x.name===state.name&&x.value===state.value);if(input)input.checked=state.checked}});
document.addEventListener('submit',e=>e.preventDefault());
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='asset-mode'){document.querySelectorAll('.source-choices button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));parent.postMessage({type:'puls-review-mode',key,id:b.dataset.id},location.origin)}});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data.type!=='puls-review-sync-mode')return;document.querySelectorAll('.source-choices button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.id===e.data.id)))});
</script></body></html>`);
}
// The comparison shell (preview.html, comparison.css and comparison.js) is maintained directly.
console.log('Generated five paired design views.');
