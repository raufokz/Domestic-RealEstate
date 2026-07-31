/** Preferred Agent pricing tiers — the services-based ladder that replaced the
 * old zip-code-exclusivity plans (Free Partner / Zip Code Specialist / Elite
 * Exclusive Specialist / Brokerage Partner). Single source of truth shared by
 * the home page pricing section and the registration flow so the two never
 * drift. Mirrors `AgentProfile::PLAN_TIERS` on the backend, which enforces the
 * same cap/category rules server-side. */
export interface AgentPlanTier {
  name: string;
  icon: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  /** Max number of services selectable. null = unlimited. */
  cap: number | null;
  /** Service-catalog category names this plan may pick from. null = any category. */
  categories: string[] | null;
  features: string[];
  popular?: boolean;
  cta: string;
}

export const AGENT_PLAN_TIERS: AgentPlanTier[] = [
  {
    name: "Solo",
    icon: "🌱",
    tagline: "For individual agents testing the waters.",
    monthlyPrice: 149,
    annualPrice: 119,
    cap: 2,
    categories: null,
    features: ["Pick up to 2 services (any category)", "Standard Agent Directory Listing", "Email support"],
    cta: "Start Solo",
  },
  {
    name: "Starter",
    icon: "★",
    tagline: "Most popular — small team support.",
    monthlyPrice: 299,
    annualPrice: 239,
    cap: 5,
    categories: ["Core Services", "Web & Tech"],
    popular: true,
    features: ["Pick up to 5 services (Core + Web & Tech)", "★ Preferred Partner Badge", "Priority email support"],
    cta: "Select Starter",
  },
  {
    name: "Professional",
    icon: "👑",
    tagline: "Dedicated VA, priority turnaround.",
    monthlyPrice: 599,
    annualPrice: 479,
    cap: 10,
    categories: null,
    features: ["Pick up to 10 services (all categories)", "Dedicated Virtual Assistant", "Priority turnaround"],
    cta: "Go Professional",
  },
  {
    name: "Elite",
    icon: "🏢",
    tagline: "Unlimited services, all categories.",
    monthlyPrice: 999,
    annualPrice: 799,
    cap: null,
    categories: null,
    features: ["Unlimited services (all categories)", "Dedicated VA team + account manager", "24/7 priority support"],
    cta: "Claim Elite",
  },
];

/** Sales-assisted tier with no listed price — not self-serve, so it's kept
 * separate from AGENT_PLAN_TIERS rather than given a fake cap/price. */
export const ENTERPRISE_PLAN = {
  name: "Enterprise Custom",
  icon: "🏛️",
  tagline: "Bespoke high-volume solutions.",
  features: ["Unlimited seats & services", "Automated MLS feed sync API", "Custom CRM trigger webhooks", "Pre-negotiated bulk rates", "Dedicated 24/7 support SLA"],
  cta: "Talk to Us",
};

export function planByName(name?: string | null): AgentPlanTier | undefined {
  return AGENT_PLAN_TIERS.find((p) => p.name === name);
}

export function planPrice(plan: AgentPlanTier, billing: "monthly" | "annual"): number {
  return billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
}
