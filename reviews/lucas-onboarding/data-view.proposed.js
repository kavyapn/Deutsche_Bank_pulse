// REVIEW-05: Suggested replacement for dataView in dist/feature-ui.js. Imports remain as in the source.
export function dataView(assets, mode, preview, error, duringScan = false) {
  const totals = assetTotals(assets);
  const add = mode === "manual" ? `<form id="asset-manual" class="stack">
    <label class="field">Asset name<input name="name" maxlength="80" autocomplete="off" required placeholder="e.g. Savings account"></label>
    <label class="field">Asset type<select name="type">${Object.entries(ASSET_TYPES).map(([key,label])=>`<option value="${key}">${label}</option>`).join("")}</select></label>
    <label class="field">Value (€)<input name="value" type="number" inputmode="decimal" min="0" max="1000000000" step="0.01" required></label>
    <button class="button" type="submit">Add asset</button>
  </form>` : mode === "csv" ? `<form id="asset-csv" class="stack">
    <p class="subtle">Choose a CSV with columns Name, Type and Value. Use cash, investment or other for the type.</p>
    <label class="field">CSV report<input type="file" name="report" accept=".csv,text/csv" required></label>
    <button class="button" type="submit">Review import</button>
  </form>` : mode === "bank" ? `<p class="subtle">Connect a sample partner bank to preview its read-only balances.</p>${button("Preview bank balances","asset-bank")}` : "";
  return `<div class="stack narrow-page sources-page ${duringScan ? "sources-review" : ""}">
    <h1 id="data-sources-title">Add data sources</h1><p class="subtle">${duringScan
      ? "Optional. Connect another account, import a CSV or enter assets manually."
      : "Add assets for a fuller view. You can include accessible cash in your forecasts."}</p>
    <div class="source-choices" role="group" aria-label="Ways to add data">
      ${[["bank","Connect a bank"],["csv","Import a CSV"],["manual","Add manually"]].map(([id,label]) =>
      `<button type="button" data-action="asset-mode" data-id="${id}" aria-pressed="${mode===id}">${label}</button>`).join("")}
    </div>
    ${mode ? `<section class="card stack" aria-label="Add assets">${preview?.length ? `<h2>Review these assets</h2>
      <dl class="metric-list">${preview.map(item=>`<div><dt>${escapeHtml(item.name)}</dt><dd>${euro(item.value)}</dd></div>`).join("")}</dl>
      ${button("Confirm import","asset-confirm")}` : add}
      ${error ? `<p class="message" role="alert">${escapeHtml(error)}</p>` : ""}</section>` : ""}
    <!-- REVIEW-05: Omit the empty asset container during onboarding; keep real added assets visible. -->
    ${assets.length || !duringScan ? `<section class="${duringScan ? "sources-summary stack" : "card stack"}"><h2>Your added assets</h2>
      ${assets.length ? `<div class="forecast-results"><div><span>Accessible cash</span><strong>${euro(totals.cash)}</strong></div>
        <div><span>Investments and other</span><strong>${euro(totals.investment+totals.other)}</strong></div></div>
        <ul class="added-assets">${assets.map((item,i)=>`<li><span><strong>${escapeHtml(item.name)}</strong><small>${ASSET_TYPES[item.type]} · ${item.source}</small></span>
          <span><strong>${euro(item.value)}</strong><button class="back-button" type="button" data-action="asset-remove" data-index="${i}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button></span></li>`).join("")}</ul>`
        : '<p class="subtle">No additional assets yet.</p>'}
    ${!duringScan ? '<p class="subtle">The measured score uses your verified banking snapshot. Added assets are stored in this demo on this device.</p>' : ""}
    </section>` : ""}
    <!-- REVIEW-05: Keep disclosure and score action outside the optional asset summary. -->
    ${duringScan ? `<p class="sources-disclosure subtle">The measured score uses your verified banking snapshot. Added assets are stored in this demo on this device.</p>
    <div class="sources-score">${button("View my PULS score", "finish-sources")}</div>` : ""}
  </div>`;
}
