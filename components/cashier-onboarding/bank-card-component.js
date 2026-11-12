// Reused from the approved HTML card component.
class DeutscheBankCard extends HTMLElement {
      static get observedAttributes() { return ['holder', 'last-four']; }
      constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = `
          <style>
            :host { display:block; width:100%; aspect-ratio:85.6 / 53.98; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
            * { box-sizing:border-box; }
            .card { position:relative; isolation:isolate; overflow:hidden; width:100%; height:100%; border:1px solid #ffffff21; border-radius:16px; color:#fff; background:linear-gradient(122deg,#153f77 0%,#092e61 48%,#061b3b 100%); box-shadow:0 22px 40px #09234828,0 4px 9px #09234818; }
            .card::before { content:""; position:absolute; z-index:-1; inset:-45% -8% -45% 56%; transform:rotate(33deg); background:linear-gradient(90deg,#ffffff00,#ffffff09 45%,#ffffff02 46%,#ffffff00); }
            .card::after { content:""; position:absolute; inset:0; border-radius:inherit; box-shadow:inset 0 1px 0 #ffffff1c; pointer-events:none; }
            .wordmark { position:absolute; top:12%; left:8%; font-size:clamp(12px,3.7cqw,16px); font-weight:650; letter-spacing:-.025em; }
            .logo { position:absolute; top:11%; right:8%; width:10%; height:auto; }
            .chip { position:absolute; top:37%; left:8%; width:13%; height:auto; }
            .contactless { position:absolute; top:40%; left:24%; width:6%; height:auto; color:#e7eef7; opacity:.85; }
            .number { position:absolute; left:8%; top:64%; display:flex; align-items:center; gap:.8em; margin:0; font-size:clamp(13px,4.3cqw,17px); font-weight:450; letter-spacing:.11em; font-variant-numeric:tabular-nums; }
            .masked { letter-spacing:.18em; opacity:.77; }
            .holder { position:absolute; left:8%; bottom:11%; margin:0; max-width:65%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-size:clamp(9px,2.8cqw,11px); font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:#dce6f4; }
            .demo { position:absolute; right:8%; bottom:11%; font-size:9px; font-weight:550; letter-spacing:.12em; color:#a3b9d5; }
            :host { container-type:inline-size; }
          </style>
          <div class="card" aria-hidden="true">
            <span class="wordmark">Deutsche Bank</span>
            <svg class="logo" viewBox="0 0 64 64" focusable="false"><path d="M0 0H64V64H0V0ZM9.02564 9.00256V54.9974H55.1385V9.00256H9.02564ZM38.4 15.3862L14.1128 48.6138H25.6L49.8871 15.3862H38.4Z" fill="currentColor"/></svg>
            <svg class="chip" viewBox="0 0 54 42" fill="none" focusable="false">
              <defs><linearGradient id="chip-metal" x1="0" y1="0" x2="54" y2="42" gradientUnits="userSpaceOnUse"><stop stop-color="#e8d9af"/><stop offset=".48" stop-color="#c4ae7a"/><stop offset="1" stop-color="#e4d4a7"/></linearGradient></defs>
              <rect x=".7" y=".7" width="52.6" height="40.6" rx="7" fill="url(#chip-metal)" stroke="#ac9867" stroke-width="1.4"/>
              <path d="M18 1v10l-4 4v12l4 4v10M36 1v10l4 4v12l-4 4v10M1 14h13m26 0h13M1 28h13m26 0h13M18 11h18M18 31h18M18 21h18" stroke="#9b875c" stroke-width="1"/>
            </svg>
            <svg class="contactless" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" focusable="false"><path d="M5 11a6 6 0 0 1 0 6M10 7a12 12 0 0 1 0 14M15 3a18 18 0 0 1 0 22"/></svg>
            <p class="number"><span class="masked">••••</span><span class="masked">••••</span><span class="masked">••••</span><span data-last-four></span></p>
            <p class="holder" data-holder></p>
          </div>`;
      }
      connectedCallback() { this.update(); }
      attributeChangedCallback() { if(this.shadowRoot) this.update(); }
      update() {
        const holder=this.getAttribute('holder')||'PULS';
        const digits=(this.getAttribute('last-four')||'0428').replace(/\D/g,'').slice(-4).padStart(4,'0');
        this.shadowRoot.querySelector('[data-holder]').textContent=holder;
        this.shadowRoot.querySelector('[data-last-four]').textContent=digits;
        this.setAttribute('role','img');
        this.setAttribute('aria-label',`Deutsche Bank Karte für ${holder}, Endziffern ${digits}`);
      }
    }
    if(!customElements.get('deutsche-bank-card')) customElements.define('deutsche-bank-card',DeutscheBankCard);
