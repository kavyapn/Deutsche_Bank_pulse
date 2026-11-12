const size=document.querySelector('#size');
function scaleFrames(){document.querySelectorAll('.frame-host').forEach(host=>host.style.setProperty('--scale',Math.min(1,host.getBoundingClientRect().width/(size.value==='mobile'?392:902))))}
function resize(){document.body.classList.toggle('mobile',size.value==='mobile');scaleFrames();history.replaceState(null,'','?size='+size.value)}
const params=new URLSearchParams(location.search);if(params.get('size')==='mobile')size.value='mobile';
new ResizeObserver(scaleFrames).observe(document.querySelector('.comparison'));
size.addEventListener('change',resize);
document.querySelector('#restart').addEventListener('click',()=>document.querySelectorAll('iframe').forEach(frame=>frame.src=frame.src));
resize();

// REVIEW-06: Mirror real UI actions without changing either application's source files.
const frames=[...document.querySelectorAll('iframe')];
const status=document.querySelector('#mirror-status');
let pending=Promise.resolve();
let applying=false;
const boundDocuments=new WeakSet();
const mirroredScrolls=new WeakSet();
function description(element){
  const field=element.closest('input,select,textarea')||element.closest('label')?.querySelector('input,select,textarea');
  if(field){return {kind:'field',tag:field.tagName.toLowerCase(),id:field.id,name:field.name,form:field.form?.id,type:field.type,value:field.value};}
  const control=element.closest('button,a,summary');if(!control)return null;
  return {kind:'control',tag:control.tagName.toLowerCase(),id:control.id,form:control.form?.id,type:control.type,text:control.textContent.trim(),data:[...control.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value])};
}
function counterpart(doc,item){
  const esc=x=>doc.defaultView.CSS.escape(x);
  if(item.id){const byId=doc.getElementById(item.id);if(byId)return byId;}
  const scope=item.form?doc.getElementById(item.form):doc;if(!scope)return null;
  if(item.kind==='field'){
    let selector=item.tag+'[name="'+esc(item.name)+'"]';
    if(['radio','checkbox'].includes(item.type))selector+='[value="'+esc(item.value)+'"]';
    return scope.querySelector(selector);
  }
  if(item.data.length){const selector=item.tag+item.data.map(([k,v])=>'['+k+'="'+esc(v)+'"]').join('');const matches=scope.querySelectorAll(selector);if(matches.length===1)return matches[0];}
  if(item.type==='submit'&&item.form)return scope.querySelector('button[type="submit"],button:not([type]),input[type="submit"]');
  return [...scope.querySelectorAll(item.tag)].find(x=>x.textContent.trim()===item.text)||null;
}
function enqueue(other,item,action){
  pending=pending.then(async()=>{
    const deadline=Date.now()+5000;let target;
    do{target=counterpart(other.contentDocument,item);if(target&&!target.disabled)break;await new Promise(r=>setTimeout(r,60));}while(Date.now()<deadline);
    if(!target||target.disabled){status.textContent='Ansichten unterscheiden sich im Ablauf. Mit „Beide neu starten“ wieder angleichen.';return;}
    applying=true;try{target.dispatchEvent(new target.ownerDocument.defaultView.Event('pointerdown',{bubbles:true}));action(target);}finally{applying=false;}status.textContent='Bedienung gespiegelt · beide Richtungen';
  }).catch(()=>{status.textContent='Spiegelung unterbrochen. Beide Ansichten neu starten.';});
}
function attachMirror(frame){
  const doc=frame.contentDocument,other=frames.find(x=>x!==frame);if(!doc||!other||boundDocuments.has(doc))return;
  boundDocuments.add(doc);
  let clickedSubmitAt=0;
  doc.addEventListener('click',event=>{
    if(applying||!event.isTrusted)return;
    const item=description(event.target);if(!item)return;
    if(item.kind==='field')return;
    if(item.kind==='control'&&item.type==='submit')clickedSubmitAt=Date.now();
    enqueue(other,item,target=>target.click());
  },true);
  for(const name of ['input','change'])doc.addEventListener(name,event=>{
    if(applying)return;
    const field=event.target;if(!field.matches('input,textarea,select'))return;
    if(['radio','checkbox'].includes(field.type)){const checked=field.checked;enqueue(other,description(field),target=>{target.checked=checked;target.dispatchEvent(new target.ownerDocument.defaultView.Event(name,{bubbles:true}));});return;}
    if(field.type==='file'){
      // Local files can be mirrored without opening a second file picker.
      const files=field.files;enqueue(other,description(field),target=>{const transfer=new target.ownerDocument.defaultView.DataTransfer();for(const file of files)transfer.items.add(file);target.files=transfer.files;target.dispatchEvent(new target.ownerDocument.defaultView.Event(name,{bubbles:true}));});return;
    }
    const value=field.value;enqueue(other,description(field),target=>{target.value=value;target.dispatchEvent(new target.ownerDocument.defaultView.Event(name,{bubbles:true}));});
  },true);
  doc.addEventListener('submit',event=>{
    if(applying||!event.isTrusted||Date.now()-clickedSubmitAt<250)return;
    const formId=event.target.id;if(!formId)return;
    enqueue(other,{kind:'control',tag:'form',id:formId,data:[]},target=>target.requestSubmit());
  },true);
  doc.addEventListener('scroll',event=>{
    // Keep both views at the same scroll position; generated scroll events do not recurse.
    const source=event.target;if(mirroredScrolls.has(source)){mirroredScrolls.delete(source);return;}const target=source===doc?other.contentDocument?.scrollingElement:source.id?other.contentDocument?.getElementById(source.id):null;
    if(target&&Math.abs(target.scrollTop-(source===doc?doc.scrollingElement.scrollTop:source.scrollTop))>2){mirroredScrolls.add(source===doc?other.contentDocument:target);target.scrollTop=source===doc?doc.scrollingElement.scrollTop:source.scrollTop;}
  },true);
}
frames.forEach(frame=>{frame.addEventListener('load',()=>attachMirror(frame));if(frame.contentDocument?.readyState==='complete')attachMirror(frame);});
