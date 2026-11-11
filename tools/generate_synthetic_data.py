#!/usr/bin/env python3
"""Generate deterministic synthetic data for the seven PULS personas.

All people, counterparties, amounts and prices are fictional. Output:
  data/synthetic/catalog.json            shared reference data
  data/synthetic/personas/<id>.json      one file per persona

Usage: python3 tools/generate_synthetic_data.py
"""
import json
import os
import random
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "synthetic")
MONTHS = [(2025, 11), (2025, 12)] + [(2026, m) for m in range(1, 11)]
MKEY = [f"{y}-{m:02d}" for y, m in MONTHS]
WINDOW = {"start": "2025-11-01", "end": "2026-10-31", "months": MKEY}

# Market: monthly return in % per month of the window. Index 5 (2026-04) is the drawdown month.
MARKET = [1.5, 0.8, 2.1, -1.2, 1.9, -12.0, 3.5, 2.2, 1.0, -0.6, 1.8, 1.2]
INSTRUMENTS = {
    "etf_world":      {"name": "Global Equity ETF (synthetic)",        "asset_class": "equity_fund",  "beta": 1.0, "noise": 0.0},
    "bond_fund":      {"name": "Euro Bond Fund (synthetic)",           "asset_class": "bond_fund",    "beta": 0.2, "noise": 0.3},
    "money_market":   {"name": "Money Market Fund (synthetic)",        "asset_class": "money_market", "beta": 0.0, "noise": 0.0, "drift": 0.2},
    "tech_stock":     {"name": "Example Tech AG (fictional)",          "asset_class": "single_stock", "beta": 1.5, "noise": 3.0},
    "family_holding": {"name": "Nordlicht Holding AG (fictional)",     "asset_class": "single_stock", "beta": 1.2, "noise": 2.0},
    "crypto":         {"name": "Crypto asset (synthetic)",             "asset_class": "crypto",       "beta": 2.5, "noise": 6.0},
}
RISK_ASSET_CLASSES = ["equity_fund", "single_stock", "crypto"]

CATEGORIES = {
    "income":       {"essential": False}, "housing":   {"essential": True},
    "groceries":    {"essential": True},  "transport": {"essential": True},
    "insurance":    {"essential": True},  "health":    {"essential": True},
    "telecom":      {"essential": True},  "education": {"essential": True},
    "tax":          {"essential": True},  "debt_payment": {"essential": True},
    "restaurants":  {"essential": False}, "leisure":   {"essential": False},
    "shopping":     {"essential": False}, "travel":    {"essential": False},
    "subscriptions": {"essential": False}, "fee":      {"essential": False},
    "transfer":     {"essential": False}, "inheritance": {"essential": False},
}
SAVING_OUT = ["to_savings", "investment_buy", "pension_contribution"]
SAVING_IN = ["from_savings", "investment_sell"]
LATE_SUBCATEGORIES = ["dunning_fee", "returned_direct_debit", "bnpl_late_fee"]

DOMAINS = {"money_fundamentals": 20, "credit_borrowing": 20, "investing_risk": 20,
           "tax_employment": 15, "digital_safety": 15, "applied_decisions": 10}
Q = [  # id, domain, text, options, correct index
 ("q_mf1", "money_fundamentals", "Your savings earn 3% interest and inflation is 5%. After one year, what can you buy with the money?", ["More than today", "The same as today", "Less than today"], 2),
 ("q_mf2", "money_fundamentals", "You invest €100 at 2% per year and leave the interest in the account. After five years you have:", ["Exactly €110", "More than €110", "Less than €110"], 1),
 ("q_mf3", "money_fundamentals", "What is a budget mainly for?", ["Predicting the stock market", "Planning income against spending", "Reducing your tax rate"], 1),
 ("q_cb1", "credit_borrowing", "Which figure lets you compare the total yearly cost of two loans?", ["The nominal interest rate", "The effective annual rate (APR)", "The monthly instalment"], 1),
 ("q_cb2", "credit_borrowing", "You extend a loan from 12 to 36 months at the same rate. What happens?", ["Lower instalment, more total interest", "Lower instalment, less total interest", "Nothing changes"], 0),
 ("q_cb3", "credit_borrowing", "You miss a buy-now-pay-later instalment. What is the most likely result?", ["Nothing, it is interest-free", "Late fees and possibly a negative credit entry", "The purchase is cancelled and refunded"], 1),
 ("q_ir1", "investing_risk", "What does diversification do?", ["It guarantees a profit", "It reduces the impact of a single position", "It removes all market risk"], 1),
 ("q_ir2", "investing_risk", "An investment promises a much higher return than the market. What does that usually mean?", ["Higher risk", "Lower risk", "No relation to risk"], 0),
 ("q_ir3", "investing_risk", "Two funds hold the same assets. Fund A costs 0.2% per year, fund B 1.5%. Over 20 years:", ["B ends higher", "A ends clearly higher", "The difference is negligible"], 1),
 ("q_te1", "tax_employment", "What is the difference between gross and net salary?", ["Net is before tax", "Net is after tax and social contributions", "There is no difference"], 1),
 ("q_te2", "tax_employment", "What is a saver's allowance for capital income?", ["An amount of capital income that stays tax-free", "A bonus paid by the bank", "A fee for opening a securities account"], 0),
 ("q_te3", "tax_employment", "Why can filing a tax return be worth it for an employee?", ["Work-related expenses can lead to a refund", "It raises the gross salary", "It is never worth it"], 0),
 ("q_ds1", "digital_safety", "An email from 'your bank' asks you to confirm your password via a link. What do you do?", ["Click and confirm quickly", "Do not click; open the banking app yourself", "Reply with the password"], 1),
 ("q_ds2", "digital_safety", "An influencer promises a guaranteed 20% per month. This is:", ["A normal offer", "A red flag for fraud", "A regulated savings product"], 1),
 ("q_ds3", "digital_safety", "Who may you give a transaction approval code (TAN) to?", ["A caller from the bank's security team", "A friend who helps you", "Nobody"], 2),
 ("q_ad1", "applied_decisions", "Where does money for an unexpected repair fit best?", ["Instantly available and low risk", "In a single stock", "In a locked five-year product"], 0),
 ("q_ad2", "applied_decisions", "You have €1,000, a card debt at 14% and an investment with an expected 6%. What is usually the better first step?", ["Invest the €1,000", "Repay the card debt", "Split it evenly"], 1),
 ("q_ad3", "applied_decisions", "Contract A: €20 a month for 24 months. Contract B: €15 a month for 24 months plus €150 once. Which is cheaper in total?", ["A (€480)", "B (€510)", "Both cost the same"], 0),
]
LESSONS = [
 {"id": "l_budget",    "title": "Budget basics",            "domain": "money_fundamentals", "checkpoint": "cp_budget_3m"},
 {"id": "l_emergency", "title": "Emergency fund: 3 months", "domain": "money_fundamentals", "checkpoint": "cp_emergency_3m"},
 {"id": "l_debt",      "title": "Debt and buy-now-pay-later", "domain": "credit_borrowing", "checkpoint": "cp_bills_12m"},
 {"id": "l_invest",    "title": "Investing 101",            "domain": "investing_risk",     "checkpoint": "cp_plan_6m"},
 {"id": "l_diversify", "title": "Diversification",          "domain": "investing_risk",     "checkpoint": "cp_diversified"},
 {"id": "l_protect",   "title": "Risk and protection",      "domain": "applied_decisions",  "checkpoint": "cp_liability"},
 {"id": "l_tax",       "title": "Your first tax return",    "domain": "tax_employment",     "checkpoint": "cp_tax_refund"},
 {"id": "l_scam",      "title": "Scam safety",              "domain": "digital_safety",     "checkpoint": None},
]
CHECKPOINTS = {
 "cp_budget_3m":    "Last 3 months within budget (B2 rule)",
 "cp_emergency_3m": "Emergency fund of at least 3 months on the 60-day average (F1)",
 "cp_bills_12m":    "12 of 12 months without a late-payment event (B3)",
 "cp_plan_6m":      "Savings plan executed in each of the last 6 scheduled months",
 "cp_diversified":  "Portfolio exists and single stocks plus crypto are at most 20% of it",
 "cp_liability":    "Personal liability insurance in place",
 "cp_tax_refund":   "Tax refund credit received in the window",
}
RISK_ITEMS = [
 {"id": "rt1", "text": "I am willing to accept that my investments fall in value for a while in order to earn more in the long run.", "reverse": False},
 {"id": "rt2", "text": "If my portfolio lost 20% in a month, I would hold or buy more.", "reverse": False},
 {"id": "rt3", "text": "Safety of my money matters more to me than return.", "reverse": True},
 {"id": "rt4", "text": "I am comfortable with investments whose value changes from day to day.", "reverse": False},
 {"id": "rt5", "text": "Losses bother me for a long time.", "reverse": True},
]
SE_ITEMS = [
 {"id": "se1", "text": "I know how to get myself to follow through on my financial intentions."},
 {"id": "se2", "text": "I am confident that I can reach the financial goals I set."},
 {"id": "se3", "text": "I know where to find good advice when I make a financial decision."},
 {"id": "se4", "text": "When an unexpected expense comes up, I can usually find a solution."},
]
XP_RULES = {"lesson_completed": 50, "quiz_first_attempt_correct": 10, "checkpoint_verified": 150,
            "monthly_cap_lessons_and_quiz": 300, "level_thresholds": [0, 500, 1200, 2200, 3500]}


def build_prices(rng):
    prices = {}
    for iid, spec in INSTRUMENTS.items():
        p, series = 100.0, {}
        for i, key in enumerate(MKEY):
            series[key] = round(p, 4)
            r = spec["beta"] * MARKET[i] + spec.get("drift", 0.0) + (rng.gauss(0, spec["noise"]) if spec["noise"] else 0.0)
            p *= 1 + r / 100
        series["end"] = round(p, 4)
        prices[iid] = series
    return prices


class Builder:
    def __init__(self, cfg, prices):
        self.c, self.prices = cfg, prices
        self.rng = random.Random(cfg["seed"])
        self.tx, self.trades, self.n = [], [], 0
        self.income_by_month = [0.0] * 12

    def d(self, mi, day):
        y, m = MONTHS[mi]
        return date(y, m, min(day, 28)).isoformat()

    def add(self, mi, day, account, amount, category, sub, cp, flags=(), transfer_id=None):
        self.n += 1
        row = {"id": f"{self.c['id'][:3]}-{self.n:05d}", "date": self.d(mi, day), "account_id": account,
               "amount": round(amount, 2), "category": category, "subcategory": sub, "counterparty": cp}
        if flags:
            row["flags"] = list(flags)
        if transfer_id:
            row["transfer_id"] = transfer_id
        self.tx.append(row)

    def transfer(self, mi, day, amount, to_savings=True):
        tid = f"tr-{self.c['id'][:3]}-{len(self.tx)}"
        if to_savings:
            self.add(mi, day, "current", -amount, "transfer", "to_savings", "Own savings account", transfer_id=tid)
            self.add(mi, day, "savings", amount, "transfer", "to_savings", "Own current account", transfer_id=tid)
        else:
            self.add(mi, day, "savings", -amount, "transfer", "from_savings", "Own current account", transfer_id=tid)
            self.add(mi, day, "current", amount, "transfer", "from_savings", "Own savings account", transfer_id=tid)

    def trade(self, mi, day, iid, side, amount, source):
        price = self.prices[iid][MKEY[mi]]
        self.trades.append({"date": self.d(mi, day), "instrument_id": iid, "side": side, "amount": round(amount, 2),
                            "units": round(amount / price, 6), "price": price, "source": source})
        if side == "buy":
            self.add(mi, day, "current", -amount, "transfer", "investment_buy", "Securities account")
        else:
            self.add(mi, day, "current", amount, "transfer", "investment_sell", "Securities account")

    def build(self):
        c, rng = self.c, self.rng
        for mi in range(12):
            for sub, cp, day, amt, sd, months in c["income"]:
                if months is None or mi in months:
                    a = max(0.0, rng.gauss(amt, sd)) if sd else amt
                    a = c.get("income_override", {}).get((sub, mi), a)
                    if a > 0:
                        self.add(mi, day, "current", round(a), "income", sub, cp)
                        self.income_by_month[mi] += round(a)
            for cat, sub, cp, day, amt, months in c["fixed"]:
                if months is None or mi in months:
                    self.add(mi, day, "current", -amt, cat, sub, cp)
            for cat, sub, cps, n, total, sd in c["variable"]:
                t = max(total * 0.5, rng.gauss(total, sd))
                cuts = sorted(rng.random() for _ in range(n - 1))
                parts = [b - a for a, b in zip([0] + cuts, cuts + [1])]
                for part in parts:
                    self.add(mi, rng.randint(1, 28), "current", -max(1.0, t * part), cat, sub, rng.choice(cps))
            for day, amt, months in c.get("save", []):
                if months is None or mi in months:
                    self.transfer(mi, day, amt, True)
            plan = c.get("plan")
            if plan and mi not in plan.get("skip", []):
                self.trade(mi, plan["day"], plan["instrument_id"], "buy", plan["amount"], "plan")
        if "save_rule" in c:  # income-dependent saving for variable income
            for mi in range(12):
                inc = self.income_by_month[mi]
                for threshold, amt in c["save_rule"]["tiers"]:
                    if inc >= threshold:
                        self.transfer(mi, 27, amt, True)
                        break
                else:
                    if inc < c["save_rule"]["withdraw_below"]:
                        self.transfer(mi, 20, c["save_rule"]["withdraw_amount"], False)
        for mi, day, amt in c.get("deposits", []):
            self.transfer(mi, day, amt, True)
        for mi, day, amt in c.get("withdrawals", []):
            self.transfer(mi, day, amt, False)
        for mi, day, account, amt, cat, sub, cp, flags in c.get("specials", []):
            self.add(mi, day, account, amt, cat, sub, cp, flags)
        for mi, day, iid, side, amt in c.get("manual_trades", []):
            self.trade(mi, day, iid, side, amt, "manual")
        self.tx.sort(key=lambda r: (r["date"], r["id"]))

    def learning(self):
        ev, c = [], self.c
        for qi, (qid, dom, _t, _o, _c) in enumerate(Q):
            ok = c["quiz"][dom][qi % 3]
            mi = c["quiz_month"] + (qi // 6)
            ev.append({"ts": self.d(mi, 3 + qi) + "T18:30:00", "type": "quiz_answer", "question_id": qid,
                       "domain": dom, "attempt": 1, "correct": ok})
            if not ok and qi % 2 == 0:  # a retry earns XP nothing and does not count for K1
                ev.append({"ts": self.d(mi, 4 + qi) + "T18:35:00", "type": "quiz_answer", "question_id": qid,
                           "domain": dom, "attempt": 2, "correct": True})
        for lid, mi in c["lessons"]:
            ev.append({"ts": self.d(mi, 12) + "T19:00:00", "type": "lesson_completed", "lesson_id": lid})
        return sorted(ev, key=lambda e: e["ts"])

    def document(self):
        c = self.c
        used = sorted(set(list(c.get("positions", {})) + [t["instrument_id"] for t in self.trades]))
        accounts = [{"id": "current", "type": "current", "opening_balance": c["opening"]["current"]},
                    {"id": "savings", "type": "savings", "access": "instant", "opening_balance": c["opening"]["savings"]}]
        if used:
            accounts.append({"id": "securities", "type": "securities"})
        return {
            "schema_version": "0.1", "synthetic": True, "window": WINDOW,
            "profile": {"persona_id": c["id"], "name": c["name"], "age": c["age"], "tier": c["tier"],
                        "personas": [{"id": c["id"], "share": 1.0}], "income_type": c["income_type"],
                        "story": c["story"]},
            "accounts": accounts,
            "transactions": self.tx,
            "liabilities": c.get("liabilities", []),
            "securities": {
                "opening_positions": [{"instrument_id": i, "units": round(v / self.prices[i][MKEY[0]], 6)}
                                      for i, v in c.get("positions", {}).items()],
                "plan": ({"instrument_id": c["plan"]["instrument_id"], "amount": c["plan"]["amount"],
                          "scheduled_months": MKEY} if c.get("plan") else None),
                "trades": sorted(self.trades, key=lambda t: t["date"]),
            } if used else None,
            "protection": c["protection"],
            "life_events": c["life_events"],
            "risk_questionnaire": {"answered_on": "2026-10-05", "scale": "1-5",
                                   "answers": dict(zip(["rt1", "rt2", "rt3", "rt4", "rt5"], c["risk"])),
                                   "horizon_years": c["horizon_years"]},
            "self_efficacy": {"answered_on": "2026-10-05", "scale": "1-5",
                              "answers": dict(zip(["se1", "se2", "se3", "se4"], c["se"]))},
            "learning_events": self.learning(),
        }


def ev(eid, etype, status, confirmed_on, items):
    return {"id": eid, "type": etype, "status": status, "confirmed_on": confirmed_on,
            "checklist": [{"item": t, "done": d} for t, d in items]}


SHOPS = ["Online shop", "Clothing store", "Electronics store"]
FOOD = ["Supermarket", "Discounter", "Organic market"]
EAT = ["Restaurant", "Cafe", "Food delivery"]
FUN = ["Cinema", "Concert tickets", "Sports club", "Bar"]
T, F_ = True, False

PERSONAS = [
 {"id": "student_explorer", "seed": 101, "name": "Mia", "age": 20, "tier": "start", "income_type": "stable", "horizon_years": 4,
  "story": "Second-year student in a shared flat. Lives on BAfoeG, a parental transfer and a mini-job. Saves small amounts, used buy-now-pay-later twice and paid one instalment late.",
  "opening": {"current": 180, "savings": 900},
  "income": [("student_grant", "BAfoeG office", 1, 450, 0, None), ("parental_transfer", "Parents", 3, 250, 0, None),
             ("mini_job", "Cafe Morgenrot", 26, 150, 40, None)],
  "fixed": [("housing", "rent", "Shared flat landlord", 2, 380, None), ("telecom", "mobile", "Mobile provider", 5, 15, None),
            ("subscriptions", "streaming", "Streaming service", 7, 12, None), ("subscriptions", "gym", "University gym", 10, 20, None),
            ("education", "semester_fee", "University", 14, 320, [3, 9]),
            ("debt_payment", "bnpl_instalment", "PayLater GmbH", 15, 60, [3, 4, 5, 10, 11])],
  "variable": [("groceries", "food", FOOD, 6, 150, 15), ("restaurants", "eating_out", EAT, 3, 45, 10),
               ("leisure", "going_out", FUN, 2, 40, 10), ("shopping", "general", SHOPS, 1, 35, 12),
               ("transport", "local", ["Bike repair", "Regional train"], 2, 20, 5)],
  "save": [(4, 40, [0, 1, 2, 5, 6, 7, 8, 11])],
  "specials": [(4, 22, "current", -5, "fee", "bnpl_late_fee", "PayLater GmbH", ("late",))],
  "liabilities": [{"id": "bnpl", "type": "bnpl", "outstanding_end": 120}],
  "protection": {"liability_insurance": T, "disability_insurance": F_, "health_insurance": T,
                 "pension": {"projected_monthly": 0}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": F_}},
  "life_events": [ev("ev1", "university", "confirmed", "2025-10-01",
                     [("Semester costs planned", T), ("Grant application renewed", T), ("Liability cover checked", T), ("Buffer for semester fee", F_)])],
  "risk": [3, 2, 4, 2, 4], "se": [3, 3, 4, 3],
  "quiz": {"money_fundamentals": [T, T, T], "credit_borrowing": [T, F_, F_], "investing_risk": [T, T, F_],
           "tax_employment": [T, F_, T], "digital_safety": [T, T, T], "applied_decisions": [T, T, F_]},
  "quiz_month": 1, "lessons": [("l_budget", 1), ("l_emergency", 2), ("l_debt", 6), ("l_scam", 7), ("l_protect", 8)]},

 {"id": "apprentice_builder", "seed": 102, "name": "Jonas", "age": 21, "tier": "start", "income_type": "stable", "horizon_years": 6,
  "story": "Apprentice with regular trainee pay. Repays a small consumer loan for a scooter and saves by standing order every month. One short round trip into savings must not count as saving.",
  "opening": {"current": 1250, "savings": 1500},
  "income": [("trainee_pay", "Werkbau GmbH", 27, 1150, 0, None)],
  "fixed": [("housing", "rent", "Shared flat landlord", 1, 420, None), ("telecom", "mobile", "Mobile provider", 5, 20, None),
            ("subscriptions", "streaming", "Streaming service", 7, 25, None), ("debt_payment", "consumer_loan", "Kreditbank AG", 5, 90, None),
            ("insurance", "liability", "Insurance company", 12, 6, None), ("transport", "transit_pass", "Transit operator", 3, 60, None)],
  "variable": [("groceries", "food", FOOD, 6, 170, 15), ("restaurants", "eating_out", EAT, 3, 50, 10),
               ("leisure", "going_out", FUN, 2, 50, 12), ("shopping", "general", SHOPS, 2, 40, 12)],
  "save": [(28, 100, None)],
  "deposits": [(6, 2, 300)], "withdrawals": [(6, 12, 300)],
  "liabilities": [{"id": "loan", "type": "consumer_loan", "outstanding_start": 1800, "outstanding_end": 840}],
  "protection": {"liability_insurance": T, "disability_insurance": F_, "health_insurance": T,
                 "pension": {"projected_monthly": 310}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": F_}},
  "life_events": [],
  "risk": [2, 2, 4, 2, 4], "se": [4, 4, 3, 3],
  "quiz": {"money_fundamentals": [T, F_, T], "credit_borrowing": [T, T, F_], "investing_risk": [F_, T, F_],
           "tax_employment": [T, F_, F_], "digital_safety": [T, T, F_], "applied_decisions": [T, F_, T]},
  "quiz_month": 2, "lessons": [("l_budget", 2), ("l_debt", 3), ("l_protect", 5)]},

 {"id": "first_salary_professional", "seed": 103, "name": "Lena", "age": 24, "tier": "pro", "income_type": "stable", "horizon_years": 10,
  "story": "First full-time job. Builds an emergency fund, runs an ETF savings plan with two skipped months, received a tax refund and is preparing to move out.",
  "opening": {"current": 2400, "savings": 2400},
  "income": [("salary", "Rheinlogik GmbH", 27, 2500, 0, None)],
  "fixed": [("housing", "rent", "Landlord", 1, 850, None), ("housing", "utilities", "Utility company", 3, 90, None),
            ("telecom", "mobile", "Mobile provider", 5, 25, None), ("subscriptions", "streaming", "Streaming service", 7, 35, None),
            ("subscriptions", "gym", "Fitness studio", 10, 35, None), ("insurance", "liability", "Insurance company", 12, 6, None),
            ("transport", "transit_pass", "Transit operator", 3, 60, None)],
  "variable": [("groceries", "food", FOOD, 7, 280, 20), ("restaurants", "eating_out", EAT, 5, 150, 25),
               ("leisure", "going_out", FUN, 3, 110, 20), ("shopping", "general", SHOPS, 3, 130, 30),
               ("health", "pharmacy", ["Pharmacy"], 1, 20, 5)],
  "save": [(28, 150, [0, 1, 2, 4, 5, 7, 10, 11])],
  "plan": {"instrument_id": "etf_world", "day": 5, "amount": 100, "skip": [3, 8]},
  "positions": {"etf_world": 2300},
  "specials": [(3, 18, "current", -450, "travel", "trip", "Travel portal", ()), (8, 9, "current", -480, "travel", "trip", "Airline", ()),
               (7, 16, "current", 310, "income", "tax_refund", "Tax office", ("one_off",))],
  "protection": {"liability_insurance": T, "disability_insurance": F_, "health_insurance": T,
                 "pension": {"projected_monthly": 820}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": T}},
  "life_events": [ev("ev1", "move_out", "confirmed", "2026-08-15",
                     [("Deposit saved", T), ("New fixed costs calculated", T), ("Furniture budget set", F_), ("Contents insurance checked", F_)])],
  "risk": [4, 3, 3, 3, 3], "se": [4, 3, 4, 4],
  "quiz": {"money_fundamentals": [T, T, T], "credit_borrowing": [T, T, F_], "investing_risk": [T, T, F_],
           "tax_employment": [T, T, T], "digital_safety": [T, T, T], "applied_decisions": [T, F_, T]},
  "quiz_month": 0, "lessons": [("l_budget", 0), ("l_emergency", 1), ("l_invest", 2), ("l_tax", 5), ("l_scam", 6), ("l_protect", 9)]},

 {"id": "freelance_creator", "seed": 104, "name": "Samira", "age": 26, "tier": "pro", "income_type": "variable", "horizon_years": 8,
  "story": "Freelance designer with irregular invoices and quarterly tax prepayments. Saves in strong months. States a low risk tolerance but holds a concentrated equity portfolio and sold part of it during the market drawdown.",
  "opening": {"current": 1400, "savings": 6000},
  "income": [("freelance_invoice", "Client A", 8, 1500, 650, None), ("freelance_invoice", "Client B", 19, 1200, 600, None)],
  "fixed": [("housing", "rent", "Landlord", 1, 780, None), ("housing", "utilities", "Utility company", 3, 80, None),
            ("telecom", "mobile", "Mobile provider", 5, 30, None), ("subscriptions", "software", "Design software", 7, 60, None),
            ("health", "health_insurance", "Health insurer", 1, 380, None), ("insurance", "liability", "Insurance company", 12, 7, None),
            ("tax", "income_tax_prepayment", "Tax office", 10, 450, [1, 4, 7, 10])],
  "variable": [("groceries", "food", FOOD, 7, 260, 20), ("restaurants", "eating_out", EAT, 5, 140, 25),
               ("leisure", "going_out", FUN, 3, 90, 20), ("shopping", "general", SHOPS, 3, 110, 30),
               ("transport", "local", ["Transit operator", "Car sharing"], 3, 60, 10)],
  "save_rule": {"tiers": [(3200, 600), (2500, 200)], "withdraw_below": 1700, "withdraw_amount": 500},
  "positions": {"etf_world": 5000, "tech_stock": 4000},
  "manual_trades": [(1, 14, "tech_stock", "buy", 300), (3, 9, "etf_world", "buy", 300), (5, 21, "etf_world", "sell", 1200)],
  "protection": {"liability_insurance": T, "disability_insurance": F_, "health_insurance": T,
                 "pension": {"projected_monthly": 240}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": F_}},
  "life_events": [ev("ev1", "self_employment", "confirmed", "2025-06-01",
                     [("Business and private accounts separated", T), ("Tax reserve set up", T), ("Health insurance arranged", T)])],
  "risk": [3, 2, 4, 2, 4], "se": [3, 4, 3, 4],
  "quiz": {"money_fundamentals": [T, T, T], "credit_borrowing": [T, F_, T], "investing_risk": [T, F_, F_],
           "tax_employment": [T, T, T], "digital_safety": [T, T, T], "applied_decisions": [T, T, F_]},
  "quiz_month": 3, "lessons": [("l_budget", 3), ("l_tax", 4), ("l_invest", 6), ("l_diversify", 8)]},

 {"id": "startup_founder", "seed": 105, "name": "David", "age": 28, "tier": "pro", "income_type": "variable", "horizon_years": 5,
  "story": "Founder paying himself a modest salary from his own company. The salary was cut for three months, he drew on his reserve, missed one direct debit and holds only crypto as an investment.",
  "opening": {"current": 900, "savings": 9000},
  "income": [("founder_salary", "Lumenpfad UG", 1, 2200, 0, None)],
  "income_override": {("founder_salary", 7): 1400, ("founder_salary", 8): 1400, ("founder_salary", 9): 1400},
  "fixed": [("housing", "rent", "Landlord", 2, 700, None), ("housing", "utilities", "Utility company", 3, 75, None),
            ("telecom", "mobile", "Mobile provider", 5, 30, None), ("subscriptions", "streaming", "Streaming service", 7, 30, None),
            ("insurance", "liability", "Insurance company", 12, 7, None), ("transport", "transit_pass", "Transit operator", 3, 60, None)],
  "variable": [("groceries", "food", FOOD, 7, 280, 20), ("restaurants", "eating_out", EAT, 6, 220, 30),
               ("leisure", "going_out", FUN, 3, 110, 20), ("shopping", "general", SHOPS, 3, 120, 30)],
  "save": [(4, 150, [0, 1, 2, 3, 4, 5, 6])],
  "withdrawals": [(7, 6, 500), (8, 6, 500), (9, 6, 500)],
  "positions": {"crypto": 1500},
  "manual_trades": [(2, 11, "crypto", "buy", 200)],
  "specials": [(2, 20, "current", -450, "travel", "trip", "Airline", ()), (8, 15, "current", -15, "fee", "returned_direct_debit", "Bank", ("late",)),
               (8, 24, "current", -10, "fee", "dunning_fee", "Utility company", ("late",))],
  "protection": {"liability_insurance": T, "disability_insurance": F_, "health_insurance": T,
                 "pension": {"projected_monthly": 430}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": F_}},
  "life_events": [ev("ev1", "founding", "confirmed", "2026-06-20",
                     [("Business account opened", T), ("Private and business money separated", T), ("Personal runway of 6 months", T),
                      ("Disability cover checked", F_), ("Founder salary plan documented", F_)])],
  "risk": [5, 4, 1, 5, 2], "se": [4, 5, 4, 4],
  "quiz": {"money_fundamentals": [T, T, T], "credit_borrowing": [T, T, T], "investing_risk": [T, T, F_],
           "tax_employment": [T, F_, T], "digital_safety": [T, T, T], "applied_decisions": [T, T, T]},
  "quiz_month": 1, "lessons": [("l_budget", 1), ("l_emergency", 2), ("l_diversify", 5)]},

 {"id": "life_stage_planner", "seed": 106, "name": "Hannah", "age": 29, "tier": "pro", "income_type": "stable", "horizon_years": 15,
  "story": "Shared household, first child born in September 2026. Saves and invests every month, is well insured and holds a diversified portfolio. Estate documents are still open.",
  "opening": {"current": 3100, "savings": 11500},
  "income": [("salary", "Mainwerk AG", 27, 3200, 0, None), ("child_benefit", "Family benefits office", 5, 259, 0, [10, 11])],
  "fixed": [("housing", "rent", "Landlord", 1, 950, None), ("housing", "utilities", "Utility company", 3, 110, None),
            ("telecom", "mobile", "Mobile provider", 5, 30, None), ("subscriptions", "streaming", "Streaming service", 7, 40, None),
            ("insurance", "liability", "Insurance company", 12, 7, None), ("insurance", "disability", "Insurance company", 12, 65, None),
            ("insurance", "term_life", "Insurance company", 12, 18, None), ("transport", "transit_pass", "Transit operator", 3, 60, None),
            ("transfer", "pension_contribution", "Pension provider", 2, 100, None)],
  "variable": [("groceries", "food", FOOD, 8, 380, 25), ("restaurants", "eating_out", EAT, 4, 140, 25),
               ("leisure", "going_out", FUN, 3, 100, 20), ("shopping", "general", SHOPS, 3, 160, 30),
               ("health", "pharmacy", ["Pharmacy"], 2, 40, 8)],
  "save": [(28, 250, None)],
  "plan": {"instrument_id": "etf_world", "day": 5, "amount": 300, "skip": []},
  "positions": {"etf_world": 12600, "bond_fund": 3600, "money_market": 1800},
  "specials": [(9, 8, "current", -340, "shopping", "baby_equipment", "Baby store", ()), (10, 11, "current", -290, "shopping", "baby_equipment", "Baby store", ()),
               (11, 6, "current", -260, "shopping", "baby_equipment", "Online shop", ())],
  "protection": {"liability_insurance": T, "disability_insurance": T, "health_insurance": T,
                 "pension": {"projected_monthly": 1650}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": T}},
  "life_events": [ev("ev1", "parenthood", "confirmed", "2026-09-10",
                     [("Child benefit applied for", T), ("Term life cover in place", T), ("Parental-leave budget planned", F_),
                      ("Guardianship and will prepared", F_), ("Savings plan for the child", F_)])],
  "risk": [4, 4, 3, 3, 3], "se": [5, 4, 4, 4],
  "quiz": {"money_fundamentals": [T, T, T], "credit_borrowing": [T, T, T], "investing_risk": [T, T, T],
           "tax_employment": [T, T, F_], "digital_safety": [T, T, T], "applied_decisions": [T, T, T]},
  "quiz_month": 0, "lessons": [("l_budget", 0), ("l_emergency", 0), ("l_debt", 1), ("l_invest", 2), ("l_diversify", 3), ("l_protect", 4), ("l_scam", 5)]},

 {"id": "wealth_successor", "seed": 107, "name": "Felix", "age": 27, "tier": "wealth", "income_type": "stable", "horizon_years": 20,
  "story": "Employee who received an inheritance of EUR 180,000 in April 2026. The money is parked, but spending rose afterwards and is funded from savings. The portfolio is concentrated in the family holding and estate documents are missing.",
  "opening": {"current": 3900, "savings": 8000},
  "income": [("salary", "Brueckner & Partner", 27, 3500, 0, None)],
  "fixed": [("housing", "rent", "Landlord", 1, 1100, None), ("housing", "utilities", "Utility company", 3, 100, None),
            ("telecom", "mobile", "Mobile provider", 5, 40, None), ("subscriptions", "streaming", "Streaming service", 7, 60, None),
            ("insurance", "liability", "Insurance company", 12, 8, None), ("transport", "transit_pass", "Transit operator", 3, 60, None)],
  "variable": [("groceries", "food", FOOD, 7, 300, 25), ("restaurants", "eating_out", EAT, 6, 260, 40),
               ("leisure", "going_out", FUN, 4, 160, 30), ("shopping", "general", SHOPS, 4, 200, 40)],
  "save": [(28, 200, [0, 1, 2, 3, 4])],
  "withdrawals": [(6, 3, 4000), (7, 3, 3000), (9, 3, 3000), (10, 3, 1500)],
  "positions": {"family_holding": 38000, "etf_world": 22000},
  "specials": [(5, 14, "savings", 180000, "inheritance", "estate_payout", "Notary escrow account", ("one_off",)),
               (6, 9, "current", -4200, "shopping", "luxury", "Watch boutique", ()), (7, 12, "current", -3100, "travel", "trip", "Travel agency", ()),
               (9, 17, "current", -2800, "shopping", "furniture", "Furniture store", ()), (10, 20, "current", -1900, "travel", "trip", "Airline", ())],
  "protection": {"liability_insurance": T, "disability_insurance": F_, "health_insurance": T,
                 "pension": {"projected_monthly": 1100}, "documents": {"power_of_attorney": F_, "will": F_, "emergency_folder": F_}},
  "life_events": [ev("ev1", "inheritance", "confirmed", "2026-05-02",
                     [("Inflow parked for 90 days", T), ("Inheritance tax clarified", F_), ("Concentration review with an advisor", F_),
                      ("Own will and power of attorney", F_), ("Family session held", F_)])],
  "risk": [4, 3, 2, 4, 3], "se": [3, 3, 3, 4],
  "quiz": {"money_fundamentals": [T, T, T], "credit_borrowing": [T, T, F_], "investing_risk": [T, T, F_],
           "tax_employment": [T, F_, T], "digital_safety": [T, T, T], "applied_decisions": [T, F_, T]},
  "quiz_month": 4, "lessons": [("l_invest", 5), ("l_diversify", 6)]},
]


def main():
    prices = build_prices(random.Random(7))
    os.makedirs(os.path.join(OUT, "personas"), exist_ok=True)
    catalog = {
        "schema_version": "0.1", "synthetic": True, "window": WINDOW,
        "categories": CATEGORIES, "saving_out_subcategories": SAVING_OUT, "saving_in_subcategories": SAVING_IN,
        "late_subcategories": LATE_SUBCATEGORIES,
        "market": {"monthly_return_pct": dict(zip(MKEY, MARKET))},
        "instruments": {i: {"name": s["name"], "asset_class": s["asset_class"], "prices": prices[i]} for i, s in INSTRUMENTS.items()},
        "risk_asset_classes": RISK_ASSET_CLASSES,
        "knowledge": {"domain_weights": DOMAINS,
                      "questions": [{"id": q[0], "domain": q[1], "text": q[2], "options": q[3], "correct": q[4]} for q in Q],
                      "lessons": LESSONS, "checkpoints": CHECKPOINTS, "xp_rules": XP_RULES},
        "risk_questionnaire": {"items": RISK_ITEMS}, "self_efficacy": {"items": SE_ITEMS},
        "personas": [p["id"] for p in PERSONAS],
    }
    with open(os.path.join(OUT, "catalog.json"), "w") as f:
        json.dump(catalog, f, indent=1, ensure_ascii=False)
    for cfg in PERSONAS:
        b = Builder(cfg, prices)
        b.build()
        with open(os.path.join(OUT, "personas", cfg["id"] + ".json"), "w") as f:
            json.dump(b.document(), f, indent=1, ensure_ascii=False)
        print(f"{cfg['id']:28s} {len(b.tx):4d} transactions")


if __name__ == "__main__":
    main()
