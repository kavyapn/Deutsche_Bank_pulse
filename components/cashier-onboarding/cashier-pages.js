// Page real application nodes in the Cashier display. Forms and source event handlers stay intact.
(() => {
  const main=document.querySelector('#main');if(!main)return;
  let observer,scheduled=false,footer=null,units=[],containers=[],pages=[],page=0,handlingInvalid=false;
  const off='cashier-page-off';
  const visible=e=>getComputedStyle(e).display!=='none';
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;layout();});}
  function watch(){observer.observe(main,{childList:true,subtree:true,characterData:true});}
  function show(indices){
    const active=new Set(indices);units.forEach((e,i)=>e.classList.toggle(off,!active.has(i)));
    for(const container of containers)container.classList.toggle(off,!units.some((u,i)=>active.has(i)&&container.contains(u)));
  }
  function fits(indices){const limit=footer.getBoundingClientRect().top-10;return indices.every(i=>units[i].getBoundingClientRect().bottom<=limit+.5);}
  function select(index){
    page=Math.max(0,Math.min(index,pages.length-1));show(pages[page]||[]);
    footer.querySelector('[data-page="previous"]').disabled=page===0;
    footer.querySelector('[data-page="next"]').disabled=page===pages.length-1;
    footer.querySelector('[data-page-label]').textContent=`Page ${page+1} of ${pages.length}`;
    document.body.dataset.cashierPageOverflow=String(!fits(pages[page]||[]));
    document.body.dataset.cashierPage=String(page+1);document.body.dataset.cashierPages=String(pages.length);
    window.scrollTo(0,0);
  }
  function attach(){
    units=[];containers=[];pages=[];page=0;
    main.querySelectorAll('.'+off).forEach(e=>e.classList.remove(off));
    const fixed=new Set();
    main.querySelectorAll('.branch-steps,.branch-heading,.puls-navigation').forEach(e=>fixed.add(e));
    const sourceTitle=main.querySelector('h1');if(sourceTitle&&!sourceTitle.closest('.branch-heading'))fixed.add(sourceTitle);
    footer=document.createElement('footer');footer.className='cashier-page-footer';footer.dataset.cashierUi='footer';
    footer.innerHTML='<nav class="cashier-page-navigation" aria-label="Display pages"><button type="button" data-page="previous" aria-label="Previous page">← Previous</button><span data-page-label aria-live="polite"></span><button type="button" data-page="next" aria-label="Next page">Next →</button></nav><div class="cashier-native-actions"></div><p class="cashier-page-error" role="alert"></p>';
    const actionHost=footer.querySelector('.cashier-native-actions');
    const actions=[...main.querySelectorAll('.actions,form > button[type="submit"]')].filter(e=>!e.closest('.puls-navigation')&&!e.parentElement.closest('.actions'));
    for(const action of actions){
      for(const button of action.matches('button')?[action]:action.querySelectorAll('button'))if(button.form?.id)button.setAttribute('form',button.form.id);
      actionHost.append(action);
    }
    // Atomic units preserve original text and live inputs. Containers collapse when their units are on another page.
    const atomic='.intro-notes > section,p,h2,h3,label,summary,button,a.button,li,tr,figure,.branch-card,.score-circle,.health-score-center,.weekly-chart,.cash-chart,.lesson-example,.forecast-results > div,.metric-list > div,.analysis-pair,.bar-row,.measurement-result';
    function walk(element){
      if(fixed.has(element)||element.matches('.health-outline,script,style,legend.sr-only,[data-cashier-ui]')||!visible(element))return;
      if(element.matches(atomic)){units.push(element);return;}
      for(const child of element.children)walk(child);
    }
    for(const child of main.children)walk(child);
    const stops=new Set([main,...main.querySelectorAll('.branch-flow,.branch-inner,.branch-content,.sources-page,.scan-page')]);
    const wrappers=new Set();
    for(const unit of units)for(let parent=unit.parentElement;parent&&!stops.has(parent);parent=parent.parentElement)if(!fixed.has(parent)&&!parent.contains(sourceTitle))wrappers.add(parent);
    containers=[...wrappers];
    main.append(footer);
    footer.addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button&&!button.disabled){observer.disconnect();select(page+(button.dataset.page==='next'?1:-1));observer.takeRecords();watch();}});
  }
  function layout(){
    observer.disconnect();
    const direct=main.querySelector('.branch-welcome,#pin-display,.scan-transition,.cashier-complete');
    document.body.classList.toggle('cashier-paged',!direct);
    if(direct){footer=null;units=[];pages=[];delete document.body.dataset.cashierPages;delete document.body.dataset.cashierPage;delete document.body.dataset.cashierPageOverflow;observer.takeRecords();watch();return;}
    if(!footer?.isConnected)attach();
    if(!units.length){observer.takeRecords();watch();return;}
    const sourceError=[...main.querySelectorAll('.message')].map(e=>e.textContent.trim()).filter(Boolean).join(' ');
    if(sourceError)footer.querySelector('.cashier-page-error').textContent=sourceError;
    const nav=footer.querySelector('nav');nav.hidden=true;
    const all=units.map((_,i)=>i);show(all);
    if(fits(all))pages=[all];
    else{
      nav.hidden=false;pages=[];let current=[];show([]);
      for(let i=0;i<units.length;i++){
        show([...current,i]);
        if(current.length&&!fits([...current,i])){pages.push(current);current=[i];show(current);}else current.push(i);
      }
      if(current.length)pages.push(current);
    }
    document.documentElement.style.setProperty('--cashier-footer-height',footer.offsetHeight+'px');
    select(page);observer.takeRecords();watch();
  }
  observer=new MutationObserver(()=>schedule());watch();
  main.addEventListener('invalid',event=>{
    if(!document.body.classList.contains('cashier-paged'))return;
    event.preventDefault();if(handlingInvalid)return;handlingInvalid=true;setTimeout(()=>handlingInvalid=false,0);
    const unit=units.findIndex(e=>e===event.target||e.contains(event.target));
    const destination=pages.findIndex(indices=>indices.includes(unit));
    if(destination>=0){observer.disconnect();select(destination);footer.querySelector('.cashier-page-error').textContent=event.target.validationMessage;event.target.focus({preventScroll:true});observer.takeRecords();watch();}
  },true);
  main.addEventListener('input',()=>{if(footer)footer.querySelector('.cashier-page-error').textContent='';});
  new ResizeObserver(schedule).observe(document.documentElement);
  window.addEventListener('resize',schedule);schedule();
})();
