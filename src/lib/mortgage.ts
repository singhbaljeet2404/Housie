// Canadian fixed-rate mortgages compound semi-annually (Interest Act), so the
// effective monthly rate is derived from the semi-annual nominal rate.
export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  if (principal <= 0) return 0;
  const n = years * 12;
  if (annualRatePct <= 0) return principal / n;
  const monthly = Math.pow(1 + annualRatePct / 100 / 2, 2 / 12) - 1;
  return (principal * monthly) / (1 - Math.pow(1 + monthly, -n));
}
