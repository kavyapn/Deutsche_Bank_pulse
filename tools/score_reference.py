#!/usr/bin/env python3
"""Reference implementation of the PULS score calculation (docs/PULS_Score_Calculation_Spec.md).

Reads data/synthetic and config/weights.config.json, writes data/synthetic/expected_scores.json.
The production engine must reproduce these numbers on the same input.

Usage: python3 tools/score_reference.py
"""
import json
import os
import statistics
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "synthetic")
DIMS = ["F", "B", "Z", "L", "K", "E"]
SHARES = {"F": {"F1": 40, "F2": 30, "F3": 30}, "B": {"B1": 30, "B2": 25, "B3": 20, "B4": 25},
          "Z": {"Z1": 40, "Z2": 35, "Z3": 25}, "L": {"L1": 100}, "K": {"K1": 60, "K2": 40}, "E": {"E1": 100}}
CURVES = {"F1": [(0, 0), (1, 35), (3, 70), (6, 100)],
          "F2": [(0, 0), (0.05, 40), (0.10, 70), (0.20, 100)],
          "F3": [(0, 100), (1, 85), (3, 60), (10, 0)]}
RISK_BANDS = [(35, "defensive", 0.30), (65, "balanced", 0.60), (101, "growth", 0.90)]
RISK_TOLERANCE_PP = 0.10
LEVELS = ["Fragile", "Building", "Stable", "Confident", "Wealth architect"]


def curve(name, x):
    pts = CURVES[name]
    if x <= pts[0][0]:
        return float(pts[0][1])
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return float(pts[-1][1])


def likert(v, reverse=False):
    return ((6 - v if reverse else v) - 1) / 4 * 100


def daily_balances(doc, account_id):
    acc = next(a for a in doc["accounts"] if a["id"] == account_id)
    start, end = date.fromisoformat(doc["window"]["start"]), date.fromisoformat(doc["window"]["end"])
    by_day = {}
    for t in doc["transactions"]:
        if t["account_id"] == account_id:
            by_day[t["date"]] = by_day.get(t["date"], 0) + t["amount"]
    out, bal, d = {}, acc["opening_balance"], start
    while d <= end:
        bal += by_day.get(d.isoformat(), 0)
        out[d.isoformat()] = round(bal, 2)
        d += timedelta(days=1)
    return out


def monthly_saving(doc, cat):
    """Net saving per month with the 30-day round-trip rule."""
    months = doc["window"]["months"]
    deposits, withdrawals = [], []
    for t in doc["transactions"]:
        if t["account_id"] != "current" or t["category"] != "transfer":
            continue
        if t["subcategory"] in cat["saving_out_subcategories"]:
            deposits.append([date.fromisoformat(t["date"]), -t["amount"]])
        elif t["subcategory"] in cat["saving_in_subcategories"]:
            withdrawals.append([date.fromisoformat(t["date"]), t["amount"]])
    for wd, wamt in sorted(withdrawals):
        rest = wamt
        for dep in sorted(deposits, reverse=True):  # latest deposit first
            if rest <= 0:
                break
            if dep[0] <= wd and (wd - dep[0]).days <= 30 and dep[1] > 0:
                m = min(dep[1], rest)
                dep[1] -= m
                rest -= m
        if rest > 0:
            deposits.append([wd, -rest])
    out = {m: 0.0 for m in months}
    for d, amt in deposits:
        out[d.isoformat()[:7]] += amt
    return out


def positions(doc, cat, upto_month=None):
    """Units per instrument, including trades before the given month (exclusive) or all trades."""
    sec = doc.get("securities")
    units = {}
    if not sec:
        return units
    for p in sec["opening_positions"]:
        units[p["instrument_id"]] = units.get(p["instrument_id"], 0) + p["units"]
    for t in sec["trades"]:
        if upto_month is None or t["date"][:7] < upto_month:
            units[t["instrument_id"]] = units.get(t["instrument_id"], 0) + (t["units"] if t["side"] == "buy" else -t["units"])
    return units


def value(units, cat, price_key):
    return {i: u * cat["instruments"][i]["prices"][price_key] for i, u in units.items()}


def project(w, na, cfg):
    w = {d: (0.0 if d in na else max(0.0, w[d])) for d in DIMS}
    cons = cfg["constraints"]
    for _ in range(5):
        fixed = set(na)
        cap = cons["capSum"]
        s = sum(w[d] for d in cap["dims"])
        if s > cap["max"] + 1e-9:
            for d in cap["dims"]:
                w[d] *= cap["max"] / s
        if s >= cap["max"] - 1e-9:
            fixed |= set(cap["dims"])
        for d, fl in cons["floor"].items():
            if d not in na and w[d] <= fl + 1e-9:
                w[d] = float(fl)
                fixed.add(d)
        free = [d for d in DIMS if d not in fixed]
        target = 100 - sum(w[d] for d in fixed)
        cur = sum(w[d] for d in free)
        if cur > 0:
            for d in free:
                w[d] *= target / cur
        ok = abs(sum(w.values()) - 100) < 1e-6 and all(w[d] >= fl - 1e-6 for d, fl in cons["floor"].items() if d not in na) \
            and sum(w[d] for d in cap["dims"]) <= cap["max"] + 1e-6
        if ok:
            return w
    raise ValueError("projection did not converge")


def resolve_weights(profile, na, overlay, cfg):
    base = cfg["tiers"][profile["tier"]]
    w = {d: float(base[d]) for d in DIMS}
    for p in profile["personas"]:
        for d in DIMS:
            w[d] += p["share"] * cfg["personas"][p["id"]]["tilt"][d]
    w = project(w, na, cfg)
    if overlay:
        ov = cfg["eventOverlay"]
        ld = ov["dimension"]
        new = w[ld] + ov["deltaPp"]
        factor = (100 - new) / (100 - w[ld])
        w = {d: (new if d == ld else w[d] * factor) for d in DIMS}
    return w


def score_persona(doc, cat, cfg):
    months = doc["window"]["months"]
    prof = doc["profile"]
    tx = [t for t in doc["transactions"] if t["account_id"] == "current"]
    ess = {c for c, v in cat["categories"].items() if v["essential"]}

    income = {m: 0.0 for m in months}
    spending = {m: 0.0 for m in months}
    essential = {m: 0.0 for m in months}
    by_cat, late_months = {}, set()
    for t in tx:
        m = t["date"][:7]
        if t["category"] == "income" and "one_off" not in t.get("flags", []):
            income[m] += t["amount"]
        elif t["amount"] < 0 and t["category"] != "transfer":
            spending[m] -= t["amount"]
            by_cat[t["category"]] = by_cat.get(t["category"], 0) - t["amount"]
            if t["category"] in ess:
                essential[m] -= t["amount"]
        if t["subcategory"] in cat["late_subcategories"]:
            late_months.add(m)
    inc_total, spend_total = sum(income.values()), sum(spending.values())
    inc_mean = inc_total / 12

    # --- spending module
    cur = daily_balances(doc, "current")
    overdraft_days = {m: sum(1 for d, b in cur.items() if d[:7] == m and b < 0) for m in months}
    income_ref = {}
    for i, m in enumerate(months):
        if prof["income_type"] == "variable":
            win = months[max(0, i - 2): i + 1]
            income_ref[m] = sum(income[x] for x in win) / len(win)
        else:
            income_ref[m] = income[m]
    within = {m: spending[m] <= income_ref[m] and overdraft_days[m] == 0 for m in months}
    b2 = sum(within.values()) / 12 * 100
    b3 = (12 - len(late_months)) / 12 * 100

    # --- saving module
    saving = monthly_saving(doc, cat)
    sav = daily_balances(doc, "savings")
    last60 = sorted(sav)[-60:]
    reserve = sum(sav[d] for d in last60) / 60
    ess_mean = sum(essential.values()) / 12
    f1_months = reserve / ess_mean
    f2_rate = max(0.0, sum(saving.values())) / inc_total
    debt = sum(l["outstanding_end"] for l in doc["liabilities"]) + max(0.0, -cur[doc["window"]["end"]])
    f3_months = debt / inc_mean
    b1 = sum(1 for m in months if saving[m] >= 0.01 * income[m] and saving[m] > 0) / 12 * 100

    # --- risk questionnaire
    rq = doc["risk_questionnaire"]
    rev = {i["id"]: i["reverse"] for i in cat["risk_questionnaire"]["items"]}
    tolerance = statistics.mean(likert(v, rev[k]) for k, v in rq["answers"].items())
    cv = statistics.pstdev(income.values()) / inc_mean
    h = rq["horizon_years"]
    horizon_pts = 20 if h < 3 else 40 if h < 5 else 70 if h < 10 else 100
    cap_parts = {"emergency_fund": curve("F1", f1_months), "income_stability": max(0.0, 100 - 200 * cv),
                 "debt": curve("F3", f3_months), "horizon": horizon_pts}
    capacity = statistics.mean(cap_parts.values())
    effective = min(tolerance, capacity)
    band, max_risk_share = next((n, s) for lim, n, s in RISK_BANDS if effective < lim)

    # --- investing module
    sec = doc.get("securities")
    b4, invest = None, {"has_securities_account": bool(sec)}
    if sec:
        end_val = value(positions(doc, cat), cat, "end")
        total = sum(end_val.values())
        risk_value = sum(v for i, v in end_val.items() if cat["instruments"][i]["asset_class"] in cat["risk_asset_classes"])
        risk_share = risk_value / (total + max(0.0, reserve))  # share of liquid financial assets
        conc = sum(v for i, v in end_val.items() if cat["instruments"][i]["asset_class"] in ("single_stock", "crypto")) / total
        crit = {}
        plan = sec["plan"]
        if plan:
            done = {t["date"][:7] for t in sec["trades"] if t["source"] == "plan"}
            crit["plan_kept"] = len(done & set(plan["scheduled_months"])) / len(plan["scheduled_months"])
        panic = False
        for i, m in enumerate(months):
            if cat["market"]["monthly_return_pct"][m] <= -10:
                look = months[i: i + 2]
                before = sum(value(positions(doc, cat, m), cat, m).values())
                sold = sum(t["amount"] for t in sec["trades"] if t["side"] == "sell" and t["date"][:7] in look)
                if before > 0 and sold / before >= 0.10:
                    panic = True
        crit["no_panic_sale"] = 0.0 if panic else 1.0
        crit["risk_consistent"] = 1.0 if risk_share <= max_risk_share + RISK_TOLERANCE_PP else 0.0
        b4 = statistics.mean(crit.values()) * 100
        invest.update({"portfolio_value_end": round(total, 2), "risk_asset_share": round(risk_share, 4),
                       "single_stock_and_crypto_share": round(conc, 4),
                       "largest_position_share": round(max(end_val.values()) / total, 4),
                       "asset_classes": len({cat["instruments"][i]["asset_class"] for i, v in end_val.items() if v > 0}),
                       "trades_manual": sum(1 for t in sec["trades"] if t["source"] == "manual"),
                       "criteria": {k: round(v, 4) for k, v in crit.items()}})
    elif prof["tier"] != "start":
        b4 = 0.0

    # --- knowledge and gamification
    kn = cat["knowledge"]
    first = {}
    for e in doc["learning_events"]:
        if e["type"] == "quiz_answer" and e["attempt"] == 1:
            first[e["question_id"]] = e
    dom_share = {}
    for dom in kn["domain_weights"]:
        qs = [q["id"] for q in kn["questions"] if q["domain"] == dom]
        dom_share[dom] = sum(1 for q in qs if first.get(q, {}).get("correct")) / len(qs)
    k1 = sum(kn["domain_weights"][d] * dom_share[d] for d in dom_share)
    k2 = statistics.mean(likert(v) for v in doc["self_efficacy"]["answers"].values())

    prot = doc["protection"]
    cp = {
        "cp_budget_3m": all(within[m] for m in months[-3:]),
        "cp_emergency_3m": f1_months >= 3,
        "cp_bills_12m": not late_months,
        "cp_plan_6m": bool(sec and sec["plan"] and set(months[-6:]) <= {t["date"][:7] for t in sec["trades"] if t["source"] == "plan"}),
        "cp_diversified": bool(sec and invest["single_stock_and_crypto_share"] <= 0.20),
        "cp_liability": prot["liability_insurance"],
        "cp_tax_refund": any(t["subcategory"] == "tax_refund" for t in tx),
    }
    done_lessons = {e["lesson_id"]: e["ts"][:7] for e in doc["learning_events"] if e["type"] == "lesson_completed"}
    credit, verified = 0.0, []
    for l in kn["lessons"]:
        if l["id"] in done_lessons:
            ok = bool(l["checkpoint"] and cp[l["checkpoint"]])
            credit += 1.0 if ok else 0.5
            if ok:
                verified.append(l["id"])
    e1 = credit / len(kn["lessons"]) * 100
    xr = kn["xp_rules"]
    xp_m = {m: 0 for m in months}
    for e in doc["learning_events"]:
        m = e["ts"][:7]
        if e["type"] == "lesson_completed":
            xp_m[m] += xr["lesson_completed"]
        elif e["attempt"] == 1 and e["correct"]:
            xp_m[m] += xr["quiz_first_attempt_correct"]
    xp = sum(min(v, xr["monthly_cap_lessons_and_quiz"]) for v in xp_m.values()) + xr["checkpoint_verified"] * len(verified)
    xp_level = sum(1 for t in xr["level_thresholds"] if xp >= t)

    # --- future readiness and life events
    z1 = None if prof["personas"][0]["id"] == "student_explorer" else min(100.0, prot["pension"]["projected_monthly"] / (0.8 * inc_mean) * 100)
    z2 = statistics.mean([prot["liability_insurance"], prot["disability_insurance"], prot["health_insurance"]]) * 100
    z3 = statistics.mean(prot["documents"].values()) * 100
    confirmed = [e for e in doc["life_events"] if e["status"] == "confirmed"]
    items = [i["done"] for e in confirmed for i in e["checklist"]]
    l1 = statistics.mean(items) * 100 if items else None
    as_of = date.fromisoformat(doc["window"]["end"])
    overlay = any((not all(i["done"] for i in e["checklist"]))
                  and (as_of - date.fromisoformat(e["confirmed_on"])).days <= cfg["eventOverlay"]["maxMonths"] * 30.5
                  for e in confirmed)

    points = {"F1": curve("F1", f1_months), "F2": curve("F2", f2_rate), "F3": curve("F3", f3_months),
              "B1": b1, "B2": b2, "B3": b3, "B4": b4, "Z1": z1, "Z2": z2, "Z3": z3, "L1": l1, "K1": k1, "K2": k2, "E1": e1}
    sub, na_dims, contributions = {}, set(), {}
    for d in DIMS:
        act = {i: s for i, s in SHARES[d].items() if points[i] is not None}
        if not act:
            sub[d] = None
            na_dims.add(d)
            continue
        tot = sum(act.values())
        sub[d] = sum(points[i] * s / tot for i, s in act.items())
    weights = resolve_weights(prof, na_dims, overlay, cfg)
    score = sum(weights[d] * sub[d] / 100 for d in DIMS if sub[d] is not None)
    for d in DIMS:
        if sub[d] is not None:
            tot = sum(s for i, s in SHARES[d].items() if points[i] is not None)
            for i, s in SHARES[d].items():
                if points[i] is not None:
                    contributions[i] = round(weights[d] / 100 * s / tot * points[i], 3)
    ref_w = project({d: float(cfg["tiers"][cfg["referenceTier"]][d]) for d in DIMS}, na_dims, cfg)
    ref = sum(ref_w[d] * sub[d] / 100 for d in DIMS if sub[d] is not None)
    gate = f1_months < 1 or not prot["liability_insurance"]
    level = min(5, int(score // 20) + 1)
    if gate:
        level = min(level, 2)
    r = lambda x, n=2: None if x is None else round(x, n)
    return {
        "persona_id": prof["persona_id"], "name": prof["name"], "tier": prof["tier"],
        "score": r(score, 1), "level": level, "level_label": LEVELS[level - 1], "gate_active": gate,
        "reference_score": r(ref, 1),
        "sub_scores": {d: r(sub[d], 1) for d in DIMS},
        "weights": {d: r(weights[d]) for d in DIMS}, "event_overlay_active": overlay,
        "indicator_points": {k: r(v, 1) for k, v in points.items()},
        "contributions": contributions,
        "raw": {"income_monthly_mean": r(inc_mean), "spending_monthly_mean": r(spend_total / 12),
                "essential_monthly_mean": r(ess_mean), "reserve_60d_average": r(reserve),
                "emergency_fund_months": r(f1_months), "savings_rate": r(f2_rate, 4),
                "consumer_debt": r(debt), "consumer_debt_months_of_income": r(f3_months),
                "saving_months": round(b1 / 100 * 12), "months_within_budget": sum(within.values()),
                "months_without_late_event": 12 - len(late_months),
                "overdraft_days_total": sum(overdraft_days.values())},
        "spending_diagnostics": {"fixed_cost_ratio": r(ess_mean / inc_mean, 4),
                                 "discretionary_share": r(1 - sum(essential.values()) / spend_total, 4),
                                 "subscriptions_monthly": r(by_cat.get("subscriptions", 0) / 12),
                                 "category_monthly_mean": {c: r(v / 12) for c, v in sorted(by_cat.items())}},
        "investing": invest,
        "risk_profile": {"tolerance": r(tolerance, 1), "capacity": r(capacity, 1),
                         "capacity_components": {k: r(v, 1) for k, v in cap_parts.items()},
                         "effective": r(effective, 1), "band": band, "max_risk_asset_share": max_risk_share,
                         "tolerance_minus_capacity": r(tolerance - capacity, 1),
                         "risk_knowledge_share": r(dom_share["investing_risk"], 4)},
        "knowledge": {"domain_share_correct": {k: r(v, 4) for k, v in dom_share.items()},
                      "checkpoints": cp, "lessons_completed": sorted(done_lessons), "lessons_verified": verified,
                      "xp": xp, "xp_level": xp_level},
    }


def main():
    cat = json.load(open(os.path.join(DATA, "catalog.json")))
    cfg = json.load(open(os.path.join(ROOT, "config", "weights.config.json")))
    out = {"schema_version": "0.1", "synthetic": True, "as_of": cat["window"]["end"], "personas": {}}
    print(f"{'persona':27s} score lvl  ref |   F     B     Z     L     K     E")
    for pid in cat["personas"]:
        doc = json.load(open(os.path.join(DATA, "personas", pid + ".json")))
        res = score_persona(doc, cat, cfg)
        assert abs(sum(res["contributions"].values()) - res["score"]) <= 0.1, pid
        assert abs(sum(res["weights"].values()) - 100) < 0.05, pid
        out["personas"][pid] = res
        s = res["sub_scores"]
        print(f"{pid:27s} {res['score']:5.1f}  {res['level']}  {res['reference_score']:5.1f} | "
              + " ".join(f"{s[d]:5.1f}" if s[d] is not None else "  n/a" for d in DIMS))
    with open(os.path.join(DATA, "expected_scores.json"), "w") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
