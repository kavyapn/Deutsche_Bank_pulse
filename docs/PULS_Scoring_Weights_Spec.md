# PULS Scoring Weights – Specification for Development

| | |
| --- | --- |
| Status | Draft v0.1 – weights are expert priors, not empirically calibrated |
| Date | 11 November 2026 |
| Scope | How the PULS engine weights the six dimensions per tier, persona and life event |
| Out of scope | Indicator curves per persona, persona-specific targets, UI (see section 12) |

## 1. Purpose

The prototype (`PULS_V10_English_Interactive.html`) shows six sub-scores and a headline score of 58, but the headline is hard-coded and the code contains no weights. This document defines the weighting model so that the engine can compute the headline score deterministically.

Source documents:

- `PULS + Deutsche Bank Grow – the finance app that grows with you.pdf` – dimensions, indicators, tier weights, gate, levels, CFPB regression.
- LIFE//MODE idea transcript (not in the repo) – the seven personas and the rule that age alone must not determine financial health.
- `Next Gen I Challenge.docx` – the six data-source categories that became the six dimensions.

## 2. Assumptions to confirm

These two decisions are not yet confirmed by the product owner. The spec is written on the recommended option.

| # | Decision | Assumed here | Alternative |
| --- | --- | --- | --- |
| A1 | Headline architecture | Six PULS dimensions, one score | LIFE//MODE Version B: five health dimensions, literacy as a separate score |
| A2 | Persona model | Seven personas as tilts on top of the three Grow tiers | Three tiers only, or seven independent weight vectors |

If A1 changes, sections 3 to 6 must be rewritten. If A2 changes, only sections 5 and 6 are affected.

## 3. Score model

```
PULS = Σ_d  w_d · S_d            d ∈ {F, B, Z, L, K, E}
S_d  = Σ_i  v_i · f_i(x_i)       sub-score of dimension d, 0–100
```

- `w_d` – dimension weight, resolved per client by this spec. Σ w_d = 100.
- `v_i` – indicator share inside a dimension. Σ v_i = 100 per dimension.
- `f_i` – indicator curve, 0–100, monotonic. Identical for all personas.

Dimensions and the 14 core indicators (shares in brackets):

| ID | Dimension | Indicators |
| --- | --- | --- |
| F | Financial fitness | F1 emergency fund in months of spending (40), F2 savings rate (30), F3 consumer debt in months of net income (30) |
| B | Behaviour | B1 saving months out of 12 (30), B2 months within budget (25), B3 bills on time (20), B4 investment discipline (25) |
| Z | Future readiness | Z1 pension coverage vs 80% of net (40), Z2 basic risks liability/BU/health (35), Z3 power of attorney, will, emergency folder (25) |
| L | Life-event readiness | L1 checklist per confirmed event (100) |
| K | Financial competence | K1 OECD knowledge + digital (60), K2 self-efficacy (40) |
| E | Learning & community | E1 skill-tree levels, webinars, certificates, circles, mentoring (100); counts half without proof |

The spec v1.1 indicators (F4, B5, K3, Z4) are not part of this version.

## 4. Weight resolution pipeline

The engine resolves `w_d` in five steps. Every step is a pure function.

```
1. base      = TIER_WEIGHTS[client.tier]
2. tilted    = base + personaTilt(client.personas)        // section 6
3. projected = project(tilted)                            // floors, caps, sum = 100 (section 7)
4. blended   = blend(previousWeights, projected, t)       // only during a persona or tier change (section 9)
5. final     = applyEventOverlay(blended, activeEvents)   // section 8
```

Not-applicable indicators are handled inside the dimension (section 10) and do not change `w_d`.

## 5. Layer 1 – base weights per tier

Taken unchanged from the Grow concept.

| Tier | F | B | Z | L | K | E |
| --- | --- | --- | --- | --- | --- | --- |
| `start` | 25 | 30 | 10 | 10 | 15 | 10 |
| `pro` | 25 | 30 | 20 | 10 | 10 | 5 |
| `wealth` | 30 | 20 | 30 | 15 | 5 | 0 |

## 6. Layer 2 – persona tilt

A persona is a vector of deltas in percentage points. Each delta is within ±10 and the deltas sum to 0.

| Persona ID | Default tier | ΔF | ΔB | ΔZ | ΔL | ΔK | ΔE |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `student_explorer` | start | −5 | 0 | 0 | 0 | +5 | 0 |
| `apprentice_builder` | start | 0 | +5 | 0 | 0 | −5 | 0 |
| `first_salary_professional` | pro | 0 | 0 | −5 | 0 | 0 | +5 |
| `freelance_creator` | pro | +5 | −5 | 0 | 0 | 0 | 0 |
| `startup_founder` | pro | +5 | −10 | 0 | +5 | 0 | 0 |
| `life_stage_planner` | pro | 0 | −5 | +5 | +5 | −5 | 0 |
| `wealth_successor` | wealth | −5 | 0 | 0 | 0 | +5 | 0 |

Resolved weights when the client is in the default tier of the persona:

| Persona | F | B | Z | L | K | E | Rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Student Explorer | 20 | 30 | 10 | 10 | 20 | 10 | Low financial capacity; habits and competence carry the score |
| Apprentice Builder | 25 | 35 | 10 | 10 | 10 | 10 | Regular earned income; saving routine and responsible borrowing |
| First-Salary Professional | 25 | 30 | 15 | 10 | 10 | 10 | First protection and pension decisions become relevant |
| Freelance Creator | 30 | 25 | 20 | 10 | 10 | 5 | Variable income; liquidity and own protection |
| Startup Founder | 30 | 20 | 20 | 15 | 10 | 5 | Runway and the founding checklist |
| Life-Stage Planner | 25 | 25 | 25 | 15 | 5 | 5 | Dependents, housing, insurance |
| Wealth Successor | 25 | 20 | 30 | 15 | 10 | 0 | Protection, estate and succession; decision competence |

### 6.1 Persona assignment

- The persona is assigned from confirmed signals, not from age. Detected signals create a suggestion; the client confirms with one tap. Self-reported data alone is accepted at onboarding and replaced when a hard signal follows.
- A client has one primary persona and at most one secondary persona.
- With two personas the tilt is the convex combination `share · tilt_primary + (1 − share) · tilt_secondary`. Default `share = 0.5`.
- If the client's tier differs from the default tier of the persona, the tilt is applied to the client's actual tier.

| Persona | Typical confirming signals |
| --- | --- |
| Student Explorer | BAföG credit, semester fee to a university |
| Apprentice Builder | Trainee pay from the same employer |
| First-Salary Professional | Second salary credit from the same employer |
| Freelance Creator | Irregular invoice credits, no salary credit |
| Startup Founder | Business account, notary or commercial-register payments |
| Life-Stage Planner | Joint account, couple mode, child benefit, rent or mortgage change |
| Wealth Successor | Confirmed inheritance inflow, family-business holding |

## 7. Projection: floors, caps, sum

Constraints on the resolved weights after step 3:

| Constraint | Value | Reason |
| --- | --- | --- |
| F floor | ≥ 20 | Resilience is the strongest driver in the CFPB regression (+6.2) |
| B floor | ≥ 15 | Behaviour items have a positive conditional effect |
| K + E cap | ≤ 30 | Knowledge alone has no positive conditional effect (−1.0) |
| Every weight | ≥ 0 | |
| Sum | = 100 | |

`project(w)` algorithm:

1. Set negative weights to 0.
2. If `K + E > 30`, scale K and E by `30 / (K + E)` and mark both as fixed.
3. Raise F and B to their floors if they are below, and mark the raised ones as fixed.
4. Scale all non-fixed weights by one common factor so that the sum is 100.
5. Repeat 2 to 4 until no constraint is violated (maximum 5 iterations; throw if it does not converge).

Weights are kept as floating-point numbers internally and rounded to one decimal only for display.

## 8. Layer 3 – event overlay

- Trigger: a life event with status `confirmed`. Status `detected` or `self_reported` has no effect.
- Effect: L receives +5 pp. The other five weights are scaled by `(100 − L_new) / (100 − L_old)`.
- Duration: until the L1 checklist of the event is complete, at most 6 months (proposed default, parameter `EVENT_OVERLAY_MAX_MONTHS`).
- Several active events do not stack; the overlay is applied once.
- Floors and caps are checked before the overlay. The overlay may move a weight slightly below its floor for the duration.

## 9. Transition rule

A change of persona, persona share or tier changes the weights without any change in behaviour. To keep the score stable:

- The engine blends linearly from the old resolved weights to the new ones over 3 months: `w(t) = (1 − t/3) · w_old + (t/3) · w_new`, `t` in months, clamped to [0, 3].
- `explain()` reports the score change caused by the blend as its own line item (`reweighting`), separate from indicator contributions.
- The monotonicity guarantee ("no improvement lowers the score") applies to indicator changes at fixed weights. The property test must hold the weights constant.

## 10. Not applicable versus missing

| Case | Handling |
| --- | --- |
| Indicator not applicable for the persona | Remove the indicator and renormalise the remaining `v_i` in that dimension to 100. `w_d` is unchanged. |
| All indicators of a dimension not applicable | Set `w_d = 0` and run `project()` again. |
| Data missing (account not connected) | Do not renormalise. Use data coverage and the confidence band (±2 / ±5 / ±8) from the Grow concept. |

Initial applicability rules (defaults, to be reviewed in phase 2):

| Indicator | Not applicable when |
| --- | --- |
| Z1 pension coverage | Primary persona is `student_explorer` |
| B4 investment discipline | No securities account detected and tier is `start` |

## 11. Rules that do not depend on the persona

- Gate: emergency fund under 1 month or no personal liability insurance → level at most 2.
- Level bands: 0–20 Fragile, 20–40 Building, 40–60 Stable, 60–80 Confident, 80–100 Wealth architect.
- Not scored: purpose and impact, community size. A product purchase or referral never changes the score.
- Peer percentiles are computed only inside the same primary persona.
- Reference score: the engine also returns the score with fixed `pro` tier weights and no tilt. It is used for advisor and portfolio analytics, because persona scores are not comparable across personas.
- Purpose limitation: the weights and the score are never exported to credit, pricing or insurance systems.

## 12. Configuration and interface

Suggested configuration file `weights.config.json`:

```json
{
  "version": "0.1",
  "dimensions": ["F", "B", "Z", "L", "K", "E"],
  "tiers": {
    "start":  { "F": 25, "B": 30, "Z": 10, "L": 10, "K": 15, "E": 10 },
    "pro":    { "F": 25, "B": 30, "Z": 20, "L": 10, "K": 10, "E": 5 },
    "wealth": { "F": 30, "B": 20, "Z": 30, "L": 15, "K": 5,  "E": 0 }
  },
  "personas": {
    "student_explorer":          { "defaultTier": "start",  "tilt": { "F": -5, "B": 0,   "Z": 0,  "L": 0, "K": 5,  "E": 0 } },
    "apprentice_builder":        { "defaultTier": "start",  "tilt": { "F": 0,  "B": 5,   "Z": 0,  "L": 0, "K": -5, "E": 0 } },
    "first_salary_professional": { "defaultTier": "pro",    "tilt": { "F": 0,  "B": 0,   "Z": -5, "L": 0, "K": 0,  "E": 5 } },
    "freelance_creator":         { "defaultTier": "pro",    "tilt": { "F": 5,  "B": -5,  "Z": 0,  "L": 0, "K": 0,  "E": 0 } },
    "startup_founder":           { "defaultTier": "pro",    "tilt": { "F": 5,  "B": -10, "Z": 0,  "L": 5, "K": 0,  "E": 0 } },
    "life_stage_planner":        { "defaultTier": "pro",    "tilt": { "F": 0,  "B": -5,  "Z": 5,  "L": 5, "K": -5, "E": 0 } },
    "wealth_successor":          { "defaultTier": "wealth", "tilt": { "F": -5, "B": 0,   "Z": 0,  "L": 0, "K": 5,  "E": 0 } }
  },
  "constraints": { "floor": { "F": 20, "B": 15 }, "capSum": { "dims": ["K", "E"], "max": 30 }, "maxTiltAbs": 10 },
  "eventOverlay": { "dimension": "L", "deltaPp": 5, "maxMonths": 6 },
  "transition": { "blendMonths": 3 },
  "referenceTier": "pro"
}
```

Suggested functions in `packages/engine`:

```ts
type Dim = 'F' | 'B' | 'Z' | 'L' | 'K' | 'E';
type Weights = Record<Dim, number>;

interface WeightContext {
  tier: 'start' | 'pro' | 'wealth';
  personas: { id: string; share: number }[];   // 1 or 2 entries, shares sum to 1
  activeConfirmedEvents: number;                // overlay applies if > 0
  transition?: { from: Weights; monthsElapsed: number };
}

resolveWeights(ctx: WeightContext, config): Weights
project(w: Weights, constraints): Weights
score(subScores: Record<Dim, number>, w: Weights): number
referenceScore(subScores: Record<Dim, number>, config): number
```

The language model never computes or changes weights. It only verbalises the output of `explain()`.

## 13. Test vectors

Sub-scores of the prototype client Lena: F 44, B 65, Z 48, L 60, K 72, E 60.

| # | Case | Expected |
| --- | --- | --- |
| T1 | Every tier and every resolved persona vector | Sum = 100 ± 1e-9 |
| T2 | Every persona tilt | Sum of deltas = 0, each delta within ±10 |
| T3 | Lena, `student_explorer`, start | 59.5 |
| T4 | Lena, `apprentice_builder`, start | 57.75 |
| T5 | Lena, `first_salary_professional`, pro | 56.9 |
| T6 | Lena, `freelance_creator`, pro | 55.25 |
| T7 | Lena, `startup_founder`, pro | 55.0 |
| T8 | Lena, `life_stage_planner`, pro | 54.85 |
| T9 | Lena, `wealth_successor`, wealth | 54.6 |
| T10 | Projection: `startup_founder` tilt on tier `wealth` (raw 35/10/30/20/5/0) | F 33.06, B 15.00, Z 28.33, L 18.89, K 4.72, E 0 |
| T11 | Event overlay on T5 weights | F 23.61, B 28.33, Z 14.17, L 15.00, K 9.44, E 9.44; Lena = 57.07 |
| T12 | Transition student (start) → first-salary (pro), `monthsElapsed = 1.5` | Weights 22.5/30/12.5/10/15/10; Lena = 58.2 |
| T13 | Transition, `monthsElapsed ≥ 3` | Equal to the new resolved weights |
| T14 | Z1 not applicable (student) | Z2 and Z3 shares become 58.33 and 41.67; `w_Z` unchanged |
| T15 | Monotonicity, 1,000 random cases at fixed weights | No indicator improvement lowers the score |
| T16 | Persona-swap: same sub-scores under all seven vectors | Spread reported; for Lena 4.9 points |
| T17 | `explain()` | Sum of contributions = score ± 0.1; `reweighting` line present during a transition |

Tolerance for T3 to T12 is ±0.01.

## 14. Validation plan

| Test | Method | Target |
| --- | --- | --- |
| Weight sensitivity | Vary each weight by ±20% and renormalise | Ranking of clients stable |
| Persona-swap | Score synthetic clients under all seven vectors | Spread documented, no level change for more than a defined share |
| Construct validity | Correlation of PULS with the CFPB FWB scale in a pilot, per persona | r ≥ 0.5 |
| Fairness | Same behaviour, same score across gender and origin | No significant gap |
| Stability | Test-retest after 2 weeks | ≤ 3 points |

## 15. Open items

1. Confirm assumptions A1 and A2.
2. Phase 2: persona-specific indicator shares and targets (for example emergency-fund target for variable income) and the full applicability matrix.
3. Integrate the v1.1 indicators F4, B5, K3 and Z4 and renormalise the shares.
4. Replace the expert priors with calibrated weights once pilot data is available. The CFPB regression used as anchor is a US cross-section from 2016 and is not causal.
5. Confirm the proposed defaults: overlay duration 6 months, blend period 3 months, persona share 0.5.
