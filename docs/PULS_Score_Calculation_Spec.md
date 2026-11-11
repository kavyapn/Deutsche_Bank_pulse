# PULS Score Calculation and Synthetic Persona Data – Specification for Development

| | |
| --- | --- |
| Status | Draft v0.1 – thresholds and parameters are proposals, not empirically calibrated |
| Date | 11 November 2026 |
| Scope | How indicator values are calculated from spending, saving, investing, the risk questionnaire and knowledge gamification; structure of the synthetic persona data |
| Related | [PULS Scoring Weights Spec](PULS_Scoring_Weights_Spec.md) – dimension weights per tier, persona and life event |

## 1. Deliverables in the repository

| Path | Content |
| --- | --- |
| `data/synthetic/personas/<persona_id>.json` | One synthetic client per persona, 12 months (2025-11-01 to 2026-10-31) |
| `data/synthetic/catalog.json` | Shared reference data: categories, market and instrument prices, question bank, lessons, checkpoints, XP rules, questionnaire items |
| `data/synthetic/expected_scores.json` | Output of the reference scorer for all seven personas; use as test fixture |
| `config/weights.config.json` | Weight configuration from the weights spec |
| `tools/generate_synthetic_data.py` | Deterministic generator (fixed seeds, Python standard library only) |
| `tools/score_reference.py` | Reference implementation of this spec |

Regenerate with:

```bash
python3 tools/generate_synthetic_data.py
```

```bash
python3 tools/score_reference.py
```

All names, counterparties, amounts and prices are fictional. The income and expense levels follow the prototype examples of the LIFE//MODE persona table; they are not population statistics.

## 2. Data flow

```
transactions, accounts ──► spending module ──► B2, B3 (+ diagnostics)
                       ──► saving module   ──► F1, F2, F3, B1
securities, market     ──► investing module ─► B4 (+ diagnostics)
risk questionnaire     ──► risk profile ─────► one criterion of B4, coaching
learning events        ──► knowledge module ─► K1, K2, E1 (+ XP, level; not scored)
protection, life events ─► Z1, Z2, Z3, L1
                                   │
indicator points ─► sub-scores S_d ─► weights (weights spec) ─► PULS score, level, gate
```

The risk questionnaire and XP never enter the headline score directly. The questionnaire acts only through the risk-consistency criterion of B4. XP and levels are motivation only.

## 3. Persona file structure

```jsonc
{
  "schema_version": "0.1",
  "synthetic": true,
  "window": { "start": "2025-11-01", "end": "2026-10-31", "months": ["2025-11", "..."] },
  "profile": { "persona_id", "name", "age", "tier", "personas": [{ "id", "share" }], "income_type": "stable|variable", "story" },
  "accounts": [{ "id": "current|savings|securities", "type", "opening_balance" }],
  "transactions": [{ "id", "date", "account_id", "amount", "category", "subcategory", "counterparty", "flags"?, "transfer_id"? }],
  "liabilities": [{ "id", "type": "bnpl|consumer_loan", "outstanding_end" }],
  "securities": { "opening_positions": [{ "instrument_id", "units" }], "plan": { "instrument_id", "amount", "scheduled_months" } | null,
                  "trades": [{ "date", "instrument_id", "side": "buy|sell", "amount", "units", "price", "source": "plan|manual" }] } | null,
  "protection": { "liability_insurance", "disability_insurance", "health_insurance", "pension": { "projected_monthly" },
                  "documents": { "power_of_attorney", "will", "emergency_folder" } },
  "life_events": [{ "id", "type", "status": "confirmed", "confirmed_on", "checklist": [{ "item", "done" }] }],
  "risk_questionnaire": { "answered_on", "answers": { "rt1": 1-5, "...": 0 }, "horizon_years" },
  "self_efficacy": { "answered_on", "answers": { "se1": 1-5, "...": 0 } },
  "learning_events": [{ "ts", "type": "quiz_answer|lesson_completed", "question_id"?, "domain"?, "attempt"?, "correct"?, "lesson_id"? }]
}
```

Conventions:

- `amount` is signed: positive is a credit to the account, negative a debit.
- An internal transfer between current and savings is two rows with the same `transfer_id` and category `transfer`.
- A securities buy or sell is one row on the current account (subcategory `investment_buy` or `investment_sell`) plus one entry in `securities.trades`.
- Flag `one_off` marks windfalls (tax refund, inheritance). Flag `late` marks late-payment events.
- Position value = units × price. `catalog.instruments[id].prices[month]` is the price at the start of the month; `prices.end` is the price at the end of the window.

## 4. The seven synthetic clients

| Persona | Client | Tier | What the data is designed to test |
| --- | --- | --- | --- |
| `student_explorer` | Mia, 20 | start | Low income from three sources, BNPL with one late fee, semester-fee months over budget, Z1 and B4 not applicable |
| `apprentice_builder` | Jonas, 21 | start | Standing-order saving 12 of 12 months, consumer loan, a 10-day round trip into savings that must not count, no life event (L not applicable) |
| `first_salary_professional` | Lena, 24 | pro | ETF plan with two skipped months, tax refund as one-off income, active event overlay |
| `freelance_creator` | Samira, 26 | pro | Variable income, quarterly tax prepayments, panic sale in the drawdown month, stated risk tolerance below actual portfolio risk |
| `startup_founder` | David, 28 | pro | Salary cut for three months, reserve drawn down, returned direct debit, crypto-only portfolio |
| `life_stage_planner` | Hannah, 29 | pro | Saving and investing every month, full protection, diversified portfolio, new parenthood event |
| `wealth_successor` | Felix, 27 | wealth | Inheritance of EUR 180,000 parked in savings, spending funded from savings afterwards, concentrated portfolio, missing estate documents |

## 5. Common definitions

All values are calculated on the 12-month window. `m` is a calendar month.

| Term | Definition |
| --- | --- |
| `income_m` | Credits on the current account with category `income`, without flag `one_off` |
| `spending_m` | Debits on the current account, category not `transfer` |
| `essential_m` | The part of `spending_m` in an essential category (`catalog.categories[c].essential`) |
| `income_ref_m` | `income_m` for `income_type = stable`; mean of `income_m` over the current and the two previous months for `variable` |
| `overdraft_days_m` | Days in the month on which the end-of-day balance of the current account is below zero |
| Curve | Piecewise linear between anchor points, constant outside |

Indicator curves (from the Grow concept):

| Indicator | Anchor points (value → points) |
| --- | --- |
| F1 emergency fund in months | 0 → 0, 1 → 35, 3 → 70, 6 → 100 |
| F2 savings rate | 0% → 0, 5% → 40, 10% → 70, 20% → 100 |
| F3 consumer debt in months of net income | 0 → 100, 1 → 85, 3 → 60, 10 → 0 |

## 6. Spending module

| Indicator | Calculation | Points |
| --- | --- | --- |
| B2 months within budget | Month counts if `spending_m ≤ income_ref_m` and `overdraft_days_m = 0` | count / 12 × 100 |
| B3 bills on time | Month counts if it has no transaction with subcategory `dunning_fee`, `returned_direct_debit` or `bnpl_late_fee` | count / 12 × 100 |

Diagnostics (shown in the app and used for coaching; not scored):

- Fixed-cost ratio = mean `essential_m` / mean `income_m`.
- Discretionary share = 1 − essential spending / total spending.
- Mean monthly spending per category, subscriptions per month.

Spending in a category is never scored as good or bad in itself. Only the relation to income, overdraft and late payments enter the score.

## 7. Saving module

**Saving flow.** A deposit is a current-account debit with subcategory `to_savings`, `investment_buy` or `pension_contribution`. A withdrawal is a current-account credit with subcategory `from_savings` or `investment_sell`.

Round-trip rule: each withdrawal is matched against deposits of the previous 30 days, latest first, and cancels them. An unmatched remainder is negative saving in the month of the withdrawal. `saving_m` is the sum of the remaining deposits and negative remainders in month `m`.

External credits that land directly on a savings account (for example the inheritance) are not saving.

| Indicator | Calculation | Points |
| --- | --- | --- |
| F1 emergency fund | Mean daily balance of instant-access savings accounts over the last 60 days / mean `essential_m` | Curve F1 |
| F2 savings rate | max(0, Σ `saving_m`) / Σ `income_m` | Curve F2 |
| F3 consumer debt | (Σ `liabilities.outstanding_end` + overdraft at window end) / mean `income_m` | Curve F3 |
| B1 saving months | Month counts if `saving_m > 0` and `saving_m ≥ 1%` of `income_m` | count / 12 × 100 |

## 8. Investing module

B4 investment discipline is the mean of the applicable criteria × 100.

| Criterion | Value | Applicable |
| --- | --- | --- |
| `plan_kept` | Scheduled plan months with an executed plan trade / scheduled months | Only if a savings plan exists |
| `no_panic_sale` | 0 if, for any month with a market return of −10% or lower, the sells in that month and the following month are at least 10% of the portfolio value at the start of that month; otherwise 1 | Always |
| `risk_consistent` | 1 if the risk-asset share is at most the maximum of the risk band plus 10 percentage points; otherwise 0 | Always |

- Risk-asset share = value of `equity_fund`, `single_stock` and `crypto` positions / (portfolio value + 60-day average reserve), at the end of the window.
- No securities account: B4 is not applicable in tier `start` and 0 in the other tiers (weights spec, section 10).
- Trading frequency is never rewarded.

Diagnostics (not scored in v0.1; candidates for indicator B5): largest position share, share of single stocks plus crypto, number of asset classes, number of manual trades.

## 9. Risk questionnaire

Five items on a 1–5 scale (`catalog.risk_questionnaire.items`); `rt3` and `rt5` are reverse-coded. Item score = (value − 1) / 4 × 100 after reversal.

| Output | Calculation |
| --- | --- |
| Tolerance (0–100) | Mean of the five item scores |
| Capacity (0–100) | Mean of four components: F1 points; income stability = max(0, 100 − 200 × CV of `income_m`); F3 points; horizon points (under 3 years 20, under 5 years 40, under 10 years 70, otherwise 100) |
| Effective risk level | min(tolerance, capacity) |
| Band | below 35 defensive, below 65 balanced, otherwise growth |
| Maximum risk-asset share | defensive 30%, balanced 60%, growth 90% |
| Risk knowledge | Share of correct first attempts in the quiz domain `investing_risk` |

Rules:

- Tolerance, capacity and knowledge are reported separately and are never averaged into one risk score.
- The risk profile changes the headline score only through `risk_consistent` in B4.
- Tolerance minus capacity above +20 or below −20 is a coaching trigger, not a score effect.
- This is not a suitability assessment under MiFID II. The band limits are illustrative and must be replaced by the bank's own model.

## 10. Knowledge and gamification

| Indicator | Calculation |
| --- | --- |
| K1 knowledge | Σ over domains of domain weight × share of questions answered correctly on the first attempt. Weights: money fundamentals 20, credit and borrowing 20, investing and risk 20, tax and employment 15, digital safety 15, applied decisions 10 |
| K2 self-efficacy | Mean of four items (1–5 scale), each (value − 1) / 4 × 100 |
| E1 learning | Σ lesson credit / number of lessons in the catalog × 100 |

Lesson credit (Apply to Unlock):

- 1.0 if the lesson is completed and its behaviour checkpoint is verified from the data.
- 0.5 if the lesson is completed and the checkpoint is not verified, or the lesson has no checkpoint.
- 0 if the lesson is not completed.

Checkpoints are evaluated by the engine, never self-reported:

| Checkpoint | Rule |
| --- | --- |
| `cp_budget_3m` | Last 3 months within budget (B2 rule) |
| `cp_emergency_3m` | F1 at least 3 months |
| `cp_bills_12m` | 12 of 12 months without a late event |
| `cp_plan_6m` | Plan trade executed in each of the last 6 months |
| `cp_diversified` | Portfolio exists and single stocks plus crypto are at most 20% of it |
| `cp_liability` | Personal liability insurance in place |
| `cp_tax_refund` | Tax refund credit received in the window |

Gamification layer (never part of the score):

- XP: 50 per completed lesson, 10 per correct first attempt, 150 per verified checkpoint.
- Lesson and quiz XP are capped at 300 per calendar month. Checkpoint XP is not capped.
- A second attempt at a question earns no XP and does not change K1.
- XP level thresholds: 0, 500, 1,200, 2,200, 3,500.
- No XP for buying a product, for trading or for taking risk.

## 11. Remaining indicators

| Indicator | Calculation |
| --- | --- |
| Z1 pension coverage | min(100, projected monthly pension / (0.8 × mean `income_m`) × 100); not applicable for `student_explorer` |
| Z2 basic risks | Share of liability, disability and health insurance in place × 100 |
| Z3 documents | Share of power of attorney, will and emergency folder in place × 100 |
| L1 life-event readiness | Checklist items done / all items over confirmed events × 100; not applicable without a confirmed event |

## 12. From indicators to the score

1. Sub-score `S_d` = Σ share × points over the applicable indicators, with the shares renormalised to 100.
2. A dimension without any applicable indicator gets weight 0 before the projection.
3. Weights are resolved as in the weights spec: tier base + persona tilt, projection, event overlay.
4. The overlay is active if a confirmed event has an open checklist item and was confirmed at most 6 months before the end of the window.
5. PULS = Σ `w_d` × `S_d` / 100. The reference score uses the `pro` tier weights without tilt and overlay.
6. Level = floor(score / 20) + 1, at most 5. Gate: emergency fund under 1 month or no liability insurance limits the level to 2.

## 13. Expected results

Output of `tools/score_reference.py` on the committed data. `n/a` means not applicable.

| Persona | Score | Level | Reference score | F | B | Z | L | K | E |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `student_explorer` | 63.3 | 4 | 61.6 | 56.9 | 78.9 | 38.9 | 75.0 | 65.5 | 37.5 |
| `apprentice_builder` | 74.3 | 4 | 70.8 | 74.7 | 100.0 | 36.8 | n/a | 58.0 | 37.5 |
| `first_salary_professional` | 70.2 | 4 | 71.0 | 70.9 | 93.6 | 48.1 | 50.0 | 77.5 | 56.2 |
| `freelance_creator` | 58.3 | 3 | 57.2 | 72.1 | 50.8 | 27.8 | 100.0 | 71.0 | 25.0 |
| `startup_founder` | 63.2 | 4 | 65.2 | 70.0 | 83.8 | 34.1 | 60.0 | 85.5 | 25.0 |
| `life_stage_planner` | 79.3 | 4 | 85.8 | 100.0 | 100.0 | 68.8 | 40.0 | 89.5 | 81.2 |
| `wealth_successor` | 52.0 | 3 | 57.1 | 70.0 | 74.2 | 39.0 | 20.0 | 69.5 | 12.5 |

`expected_scores.json` also contains, per persona: resolved weights, points and score contribution per indicator, raw values, spending diagnostics, investing criteria, risk profile, checkpoints, XP and XP level.

Acceptance tests for the production engine:

| # | Test | Expected |
| --- | --- | --- |
| C1 | Score, sub-scores and indicator points for all seven personas | Equal to `expected_scores.json` within ±0.1 |
| C2 | Sum of `contributions` | Equal to the score within ±0.1 |
| C3 | Jonas: deposit of EUR 300 on 2026-05-02 and withdrawal on 2026-05-12 | No effect on `saving_m`, B1 or F2 |
| C4 | Felix: inheritance credit | Not in `income_m`, not in `saving_m` |
| C5 | Lena: tax refund | Not in `income_m`; `cp_tax_refund` verified |
| C6 | Samira: sell in 2026-04 | `no_panic_sale = 0` |
| C7 | Samira: defensive band with a risk-asset share of about 50% | `risk_consistent = 0` |
| C8 | Mia: no securities account in tier `start` | B4 not applicable, B shares renormalised |
| C9 | Jonas: no confirmed event | `w_L = 0`, other weights rescaled to 100 |
| C10 | Second quiz attempts | No change in K1 and no XP |

## 14. Limitations and open items

1. All thresholds in sections 6 to 10 are proposals. The curves for F1 to F3 come from the Grow concept; the rest has no empirical calibration yet.
2. The reserve for F1 counts only instant-access savings accounts. Money kept on the current account is ignored.
3. Windfalls that pass through the current account and are then moved to savings would count as saving. The data avoids this case; the rule (exclude deposits funded by a `one_off` credit) is not implemented.
4. Concentration is a diagnostic only. Felix holds more than half of his portfolio in one company and still reaches B4 = 100. Indicator B5 from the Grow spec v1.1 would close this gap.
5. Data coverage and the confidence band are not modelled; every persona has 100% coverage.
6. Protection, pension projection and liabilities at the end of the window are given as profile facts, not derived from transactions.
7. The standalone HTML prototypes do not read these files yet.
