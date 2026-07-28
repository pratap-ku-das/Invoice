export type PlanId = 'free' | 'basic' | 'pro';

export interface PlanLimits {
  /** -1 means unlimited */
  maxInvoicesPerMonth: number;
  maxUsers: number;
  maxCompanies: number;
}

export interface PlanDef {
  name: string;
  priceInr: number;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    name: 'Starter',
    priceInr: 299,
    limits: { maxInvoicesPerMonth: 50, maxUsers: 2, maxCompanies: 1 },
  },
  basic: {
    name: 'Basic',
    priceInr: 499,
    limits: { maxInvoicesPerMonth: 500, maxUsers: 5, maxCompanies: 3 },
  },
  pro: {
    name: 'Pro',
    priceInr: 1499,
    limits: { maxInvoicesPerMonth: -1, maxUsers: -1, maxCompanies: -1 },
  },
};

export const DEFAULT_PLAN: PlanId = 'free';

export function planLimits(plan: PlanId): PlanLimits {
  return (PLANS[plan] ?? PLANS[DEFAULT_PLAN]).limits;
}

/** true when the value is unlimited or usage is still under the cap */
export function withinLimit(current: number, limit: number): boolean {
  return limit < 0 || current < limit;
}
