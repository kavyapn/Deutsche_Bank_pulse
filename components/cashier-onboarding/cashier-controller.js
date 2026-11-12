(() => {
  'use strict';
  const frame=document.querySelector('#pulsScreen'),hw=document.querySelector('#hardwarePad');
  const enterPin=document.querySelector('#enterPin'),status=document.querySelector('#status');
  const terminal=document.querySelector('.terminal'),windowMask=document.querySelector('#cashierCardWindow'),actor=document.querySelector('#cashierCardActor');
  const card=actor.querySelector('deutsche-bank-card');
  const allKeys=[...hw.querySelectorAll('.pad-key')],digits=[...hw.querySelectorAll('[data-digit]')];
  const appHTML=new TextDecoder().decode(Uint8Array.from(atob(document.querySelector('#puls-app-data').textContent.trim()),char=>char.charCodeAt(0)));
  let boundDocument=null;
  let observer=null,count=0,busy=false,wasPin=false,generation=0,forwarding=false,cardAnimation=null;
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setStatus=(text,kind='idle')=>{status.textContent=text;status.dataset.kind=kind;};
  const getDoc=()=>{try{return frame.contentDocument;}catch{return null;}};
  const getNative=()=>{const doc=getDoc(),button=doc?.querySelector('[data-branch="pin"]');return doc?.querySelector('#pin-display')&&button?{doc,button}:null;};
  function showDots(doc){doc.querySelectorAll('#pin-display span').forEach((dot,index)=>{dot.style.background=index<count?'#cde8ff':'';dot.style.boxShadow=index<count?'0 0 0 2px #a3cdf655':'';});}
  function sync(){
    const doc=getDoc(),native=getNative();
    if(!doc?.querySelector('#main')){enterPin.disabled=true;allKeys.forEach(key=>key.disabled=true);setStatus('Loading PULS…');return;}
    if(!native&&wasPin){count=0;busy=false;generation++;}
    wasPin=Boolean(native);
    const enabled=Boolean(native)&&!busy&&!native.button.disabled;
    enterPin.disabled=!enabled;digits.forEach(key=>key.disabled=!enabled||count>=4);
    hw.querySelector('[data-key="clear"]').disabled=!enabled||count===0;
    hw.querySelector('[data-key="enter"]').disabled=!enabled||count!==4;
    if(terminal.dataset.cardState==='inserting')return;
    if(native?.button.disabled){setStatus('Demo PIN entered. Reading your profile…','ready');return;}
    if(busy)return;
    if(native){setStatus(count===4?'Four demo digits entered. Confirm with the green ✓ key.':`Enter four demo digits on the keypad, or use Enter PIN · ${count}/4.`, 'ready');return;}
    if(doc.querySelector('#branch-goals'))setStatus('Choose your life plans on the display.','good');
    else if(doc.querySelector('#branch-answer'))setStatus('Answer the original onboarding question on the display.','good');
    else if(doc.querySelector('#branch-priorities'))setStatus('Set your topic priorities on the display.','good');
    else if(doc.querySelector('#data-sources-title'))setStatus('Add optional demo data, or open your PULS score.','good');
    else if(doc.querySelector('.scan-transition'))setStatus('Reading demo balances and preparing your PULS score…','ready');
    else if(doc.querySelector('.puls-navigation'))setStatus('Onboarding complete. Your demo PULS score is ready.','good');
    else if(doc.querySelector('[data-branch="goals"]'))setStatus('Card and demo PIN accepted. Continue on the display.','good');
    else if(doc.querySelector('[data-branch="read"]'))setStatus('Choose a sample card on the display. Its insertion will be animated.');
    else setStatus('Press Insert a bank card on the display to start.');
  }
  async function insertCard(button){
    if(busy)return;
    const token=++generation;busy=true;terminal.dataset.cardState='inserting';
    const id=button.dataset.persona;
    card.setAttribute('holder',({lena:'Lena Muster',alex:'Alex Muster',maya:'Maya Muster'})[id]||'PULS Demo');
    card.setAttribute('last-four',({lena:'0428',alex:'1580',maya:'6703'})[id]||'0428');
    setStatus('Inserting your demo card…','ready');sync();
    let slot=document.querySelector('.slot-opening').getBoundingClientRect();
    if(slot.bottom>innerHeight||slot.top<0){document.querySelector('.slot-wrap').scrollIntoView({block:'center',behavior:'instant'});slot=document.querySelector('.slot-opening').getBoundingClientRect();}
    const width=Math.min(290,innerWidth-40),height=width*53.98/85.6;
    const scale=Math.min(.7,(slot.width-10)/height),rotatedHeight=width*scale;
    const seam=slot.top+slot.height/2,startCenter=seam-Math.max(180,width*.6);
    const slotCenter=slot.left+slot.width/2;
    const startX=Math.max(width/2+16,Math.min(slotCenter,innerWidth-width/2-16));
    const shiftX=slotCenter-startX;
    actor.style.width=width+'px';actor.style.left=(startX-width/2)+'px';actor.style.top=(startCenter-height/2)+'px';
    windowMask.style.clipPath=`inset(0 0 ${Math.max(0,innerHeight-seam)}px 0)`;
    windowMask.hidden=false;
    const approach=seam-rotatedHeight/2-8-startCenter,end=seam+rotatedHeight/2+96-startCenter;
    cardAnimation=actor.animate([
      {transform:'translate(0,0) rotate(-6deg) scale(1)',offset:0},
      {transform:`translate(${shiftX}px,4px) rotate(90deg) scale(${scale})`,offset:.4},
      {transform:`translate(${shiftX}px,${approach}px) rotate(90deg) scale(${scale})`,offset:.6},
      {transform:`translate(${shiftX}px,${end}px) rotate(90deg) scale(${scale})`,offset:1}
    ],{duration:reduced()?1:1900,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
    try{await cardAnimation.finished;}catch{return;}
    if(token!==generation)return;
    windowMask.hidden=true;terminal.dataset.cardState='inserted';busy=false;
    forwarding=true;try{button.click();}finally{forwarding=false;}
    sync();
  }
  function increment(key){const native=getNative();if(!native||busy||count>=4||native.button.disabled)return;count++;showDots(native.doc);key?.classList.add('pressed');setTimeout(()=>key?.classList.remove('pressed'),reduced()?1:140);sync();}
  function submit(){const native=getNative();if(!native||count!==4||busy||native.button.disabled)return;busy=true;setStatus('Demo PIN entered. Reading your profile…','ready');native.button.click();sync();}
  function clear(){count=0;const native=getNative();if(native)showDots(native.doc);sync();}
  hw.addEventListener('click',event=>{const key=event.target.closest('.pad-key');if(!key||key.disabled||busy)return;if(key.dataset.digit!==undefined)increment(key);else if(key.dataset.key==='clear')clear();else if(key.dataset.key==='enter')submit();});
  function handleKeyboard(event){if(!getNative()||busy||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select'))return;if(/^\d$/.test(event.key)){event.preventDefault();increment(hw.querySelector(`[data-digit="${event.key}"]`));}else if(event.key==='Backspace'||event.key==='Delete'){event.preventDefault();clear();}else if(event.key==='Enter'&&event.target.tagName!=='BUTTON'){event.preventDefault();submit();}}
  document.addEventListener('keydown',handleKeyboard);
  enterPin.addEventListener('click',async()=>{
    if(!getNative()||busy)return;
    const token=++generation;busy=true;count=0;showDots(getNative().doc);sync();setStatus('Entering four demo digits on the keypad…','ready');
    const key=hw.querySelector('[data-digit="0"]');
    for(let i=0;i<4;i++){
      if(token!==generation||!getNative())return;
      count++;showDots(getNative().doc);key.classList.add('pressed');await delay(reduced()?1:150);key.classList.remove('pressed');await delay(reduced()?1:90);
    }
    if(token!==generation||!getNative())return;
    busy=false;submit();
  });
  function reload(){generation++;observer?.disconnect();observer=null;boundDocument=null;cardAnimation?.cancel();cardAnimation=null;windowMask.hidden=true;count=0;busy=false;wasPin=false;terminal.dataset.cardState='ready';allKeys.forEach(key=>key.classList.remove('pressed'));setStatus('Loading current GitHub onboarding…');frame.srcdoc=appHTML;}
  document.querySelector('#restart').addEventListener('click',reload);
  document.querySelector('#reloadApp').addEventListener('click',reload);
  function attach(){
    const doc=getDoc();if(!doc?.body||!doc.querySelector('#main')){sync();return;}
    if(boundDocument===doc)return;boundDocument=doc;observer?.disconnect();
    doc.addEventListener('click',event=>{const button=event.target.closest('[data-branch="read"]');if(!button||forwarding)return;event.preventDefault();event.stopImmediatePropagation();void insertCard(button);},true);
    doc.addEventListener('keydown',handleKeyboard);
    observer=new MutationObserver(sync);observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','class']});sync();
  }
  frame.addEventListener('load',attach);
  window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='puls-cashier:ready')attach();});
  window.addEventListener('resize',()=>{if(terminal.dataset.cardState==='inserting')reload();});
  window.addEventListener('pagehide',()=>{observer?.disconnect();generation++;cardAnimation?.cancel();});
  reload();
})();
