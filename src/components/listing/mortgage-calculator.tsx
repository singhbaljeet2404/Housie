"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { monthlyPayment } from "@/lib/mortgage";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export function MortgageCalculator({ price }: { price: number }) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(25);

  const down = Math.round((price * downPct) / 100);
  const payment = monthlyPayment(price - down, rate, years);

  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold">Mortgage estimate</h2>
      <p className="mt-1 text-3xl font-bold text-brand-700">
        {formatPrice(payment)}
        <span className="text-base font-medium text-slate-500"> / month</span>
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-700">
          Down payment ({formatPrice(down)})
          <select className={`${field} mt-1`} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))}>
            {[5, 10, 15, 20, 25, 30, 35].map((p) => <option key={p} value={p}>{p}%</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-700">
          Interest rate (%)
          <input className={`${field} mt-1`} type="number" min={0} max={20} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
        </label>
        <label className="text-xs font-medium text-slate-700">
          Amortization
          <select className={`${field} mt-1`} value={years} onChange={(e) => setYears(Number(e.target.value))}>
            {[15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} years</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Estimate only, using Canadian semi-annual compounding. Excludes taxes, insurance and CMHC premiums (required
        below 20% down).
      </p>
    </div>
  );
}
