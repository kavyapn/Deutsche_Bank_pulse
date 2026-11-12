// Cashier onboarding ends at widget activation, before the original score/scan action.
(() => {
  const main=document.querySelector('#main');
  if(!main)return;
  function updateFinishAction(){
    const button=main.querySelector('[data-action="finish-sources"]');
    if(button&&button.textContent!=='Finish setup')button.textContent='Finish setup';
    const lead=main.querySelector('.sources-page > h1 + p');
    const copy='Add another account or enter assets to personalise PULS. This step is optional.';
    if(button&&lead&&lead.textContent!==copy)lead.textContent=copy;
  }
  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-action="finish-sources"]'))return;
    event.preventDefault();event.stopImmediatePropagation();
    main.innerHTML=`<section class="cashier-complete" aria-labelledby="cashier-complete-title">
      <div class="cashier-complete-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <p class="cashier-complete-kicker">SETUP COMPLETE</p>
      <h1 id="cashier-complete-title" tabindex="-1">Your PULS widget<br>is unlocked.</h1>
      <p class="cashier-complete-description">You’ll find PULS in your banking app’s account overview.</p>
    </section>`;
    main.querySelector('h1').focus({preventScroll:true});
  },true);
  new MutationObserver(updateFinishAction).observe(main,{childList:true,subtree:true});
  updateFinishAction();
})();
