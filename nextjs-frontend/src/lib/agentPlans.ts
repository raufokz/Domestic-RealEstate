/** Preferred Agent pricing tiers — updated to support Annual plans, One-Time packages, and Custom tailored plan builder.
 * Monthly subscriptions have been removed per user requirements.
 */

export interface AgentPlanTier {
  name: string;
  icon: string;
  tagline: string;
  /** Annual total price in USD */
  annualTotalPrice: number;
  /** Monthly equivalent price when paid annually */
  annualPrice: number;
  /** Optional one-time package price */
  oneTimePrice?: number;
  /** Max number of services selectable. null = unlimited. */
  cap: number | null;
  /** Service-catalog category names this plan may pick from. null = any category. */
  categories: string[] | null;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface OneTimePackage {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  price: number;
  deliverables: string[];
  popular?: boolean;
  cta: string;
}

export const AGENT_PLAN_TIERS: AgentPlanTier[] = [
  {
    name: "Solo",
    icon: "🌱",
    tagline: "For individual agents starting out (Annual Commitment).",
    annualTotalPrice: 250,
    annualPrice: 21,
    oneTimePrice: 199,
    cap: 2,
    categories: null,
    features: [
      "Pick up to 2 services (any category)",
      "Standard Agent Directory Listing",
      "Annual Platform Pass & Priority Indexing",
      "Standard Email Support",
    ],
    cta: "Start Solo ($250/yr)",
  },
  {
    name: "Starter",
    icon: "★",
    tagline: "Most popular — small team support & lead generation.",
    annualTotalPrice: 450,
    annualPrice: 38,
    oneTimePrice: 399,
    cap: 5,
    categories: ["Core Services", "Web & Tech"],
    popular: true,
    features: [
      "Pick up to 5 services (Core + Web & Tech)",
      "★ Preferred Partner Badge & Directory Placement",
      "Annual Exclusive Zip Code Routing",
      "Priority Email & CRM Support",
    ],
    cta: "Select Starter ($450/yr)",
  },
  {
    name: "Professional",
    icon: "👑",
    tagline: "Dedicated VA & full transaction pipeline management.",
    annualTotalPrice: 750,
    annualPrice: 63,
    oneTimePrice: 599,
    cap: 10,
    categories: null,
    features: [
      "Pick up to 10 services (all categories)",
      "Dedicated Virtual Assistant Allocated",
      "Custom IDX Website & SEO Infrastructure",
      "Priority 4h Support SLA Guarantee",
    ],
    cta: "Go Professional ($750/yr)",
  },
  {
    name: "Elite",
    icon: "🏢",
    tagline: "Unlimited services, dedicated VA team & brokerage scale.",
    annualTotalPrice: 990,
    annualPrice: 83,
    oneTimePrice: 799,
    cap: null,
    categories: null,
    features: [
      "Unlimited services (all categories)",
      "Dedicated VA team + account manager",
      "Automated MLS feed sync API & CRM webhooks",
      "24/7 Priority Support SLA",
    ],
    cta: "Claim Elite ($990/yr)",
  },
];

export const ONE_TIME_PACKAGES: OneTimePackage[] = [
  {
    id: "kickstart",
    name: "Agent Launch Kickstart",
    icon: "🚀",
    tagline: "One-time setup for new or expanding real estate agents.",
    price: 199,
    deliverables: [
      "Custom Realtor Profile & SEO Indexing",
      "Social Media Brand Kit Setup",
      "Custom Lead Capture Form",
      "1-on-1 CRM Integration Onboarding",
    ],
    cta: "Get Kickstart Setup",
  },
  {
    id: "idx-growth",
    name: "IDX Website & Lead Accelerator",
    icon: "⚡",
    tagline: "Turnkey luxury agent website + 25 verified lead package.",
    price: 399,
    popular: true,
    deliverables: [
      "Custom Luxury Glass Agent Website",
      "IDX MLS Property Search Integration",
      "25 Exclusive Regional Lead Allocation",
      "Social Media Post Scheduler Setup",
    ],
    cta: "Get Growth Package",
  },
  {
    id: "full-va-suite",
    name: "Done-for-You VA & Automation Suite",
    icon: "💎",
    tagline: "Complete 1-year automation & VA workflow setup.",
    price: 699,
    deliverables: [
      "Dedicated Virtual Assistant Onboarding (1-Year System)",
      "Automated Email & SMS Follow-Up Drip Pipelines",
      "Custom Lead Form Builder & Dynamic CRM Sync",
      "Closing Referral Fee Tracking Portal Setup",
      "Dedicated Account Specialist & Priority Support",
    ],
    cta: "Get Full VA Suite",
  },
];

export const ENTERPRISE_PLAN = {
  name: "Enterprise Custom",
  icon: "🏛️",
  tagline: "Bespoke high-volume solutions tailored to your exact budget & team size.",
  features: [
    "Unlimited seats & services",
    "Automated MLS feed sync API",
    "Custom CRM trigger webhooks",
    "Pre-negotiated bulk rates",
    "Dedicated 24/7 support SLA",
  ],
  cta: "Build Custom Plan",
};

export const CUSTOM_PLAN_SERVICES = [
  { id: "va_exec", name: "Executive Virtual Assistant", priceEst: 200, category: "Core Services" },
  { id: "lead_gen", name: "Exclusive Lead Generation", priceEst: 300, category: "Core Services" },
  { id: "cold_call", name: "Cold Calling & Lead Qualification", priceEst: 250, category: "Core Services" },
  { id: "crm_mgmt", name: "CRM Setup & Pipeline Drips", priceEst: 150, category: "Core Services" },
  { id: "mls_list", name: "MLS & Property Listing Entry", priceEst: 150, category: "Core Services" },
  { id: "idx_web", name: "Custom IDX Agent Website", priceEst: 400, category: "Web & Tech" },
  { id: "social_mgr", name: "Social Media Post Manager", priceEst: 200, category: "Web & Tech" },
  { id: "form_builder", name: "Custom Lead Form Builder", priceEst: 150, category: "Web & Tech" },
  { id: "seo_opt", name: "Local Real Estate SEO Optimization", priceEst: 250, category: "Marketing" },
  { id: "ai_workflows", name: "AI Drip Automation & Chatbots", priceEst: 200, category: "AI & Automation" },
];

export function planByName(name?: string | null): AgentPlanTier | undefined {
  return AGENT_PLAN_TIERS.find((p) => p.name === name);
}

export function planPrice(plan: AgentPlanTier, billing: "annual" | "one-time" = "annual"): number {
  if (billing === "one-time") {
    return plan.oneTimePrice ?? plan.annualTotalPrice;
  }
  return plan.annualTotalPrice;
}
