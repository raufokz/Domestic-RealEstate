"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useFetch } from "@/hooks/useFetch";
import { apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

interface MembershipPlan {
  id: number;
  name: string;
  description: string | null;
  role: string | null;
  lead_quota: number | null;
  listing_limit: number | null;
  territory_coverage: string | null;
  priority_level: number | null;
  price_monthly: string | number | null;
  price_yearly: string | number | null;
  features: string[] | null;
  is_popular: boolean;
  badge: string | null;
  status: string;
}

interface LeadPackage {
  id: number;
  name: string;
  lead_count: number;
  description: string | null;
  price: string | number;
  price_per_lead: string | number | null;
  is_popular: boolean;
  is_active: boolean;
}

function money(v: string | number | null): string {
  if (v === null || v === undefined) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const emptyPlan = {
  name: "", description: "", role: "", lead_quota: "", listing_limit: "",
  territory_coverage: "", priority_level: "", price_monthly: "", price_yearly: "",
  is_popular: false, badge: "", status: "active",
};

const emptyPackage = {
  name: "", lead_count: "", description: "", price: "", price_per_lead: "",
  is_popular: false, is_active: true,
};

export default function AdminPricingPage() {
  const { data: plans, error: plansError, loading: plansLoading, refetch: refetchPlans } = useFetch<{ data: MembershipPlan[] }>("/admin/pricing/plans");
  const { data: packages, error: packagesError, loading: packagesLoading, refetch: refetchPackages } = useFetch<{ data: LeadPackage[] }>("/admin/pricing/lead-packages");
  const { success, notifyError } = useToast();

  const [editingPlanId, setEditingPlanId] = useState<number | "new" | null>(null);
  const [planForm, setPlanForm] = useState<typeof emptyPlan>(emptyPlan);
  const [editingPackageId, setEditingPackageId] = useState<number | "new" | null>(null);
  const [packageForm, setPackageForm] = useState<typeof emptyPackage>(emptyPackage);
  const [saving, setSaving] = useState(false);

  const startEditPlan = (plan?: MembershipPlan) => {
    if (plan) {
      setPlanForm({
        name: plan.name, description: plan.description ?? "", role: plan.role ?? "",
        lead_quota: String(plan.lead_quota ?? ""), listing_limit: String(plan.listing_limit ?? ""),
        territory_coverage: plan.territory_coverage ?? "", priority_level: String(plan.priority_level ?? ""),
        price_monthly: String(plan.price_monthly ?? ""), price_yearly: String(plan.price_yearly ?? ""),
        is_popular: plan.is_popular, badge: plan.badge ?? "", status: plan.status,
      });
      setEditingPlanId(plan.id);
    } else {
      setPlanForm(emptyPlan);
      setEditingPlanId("new");
    }
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      const payload = {
        ...planForm,
        lead_quota: planForm.lead_quota ? Number(planForm.lead_quota) : undefined,
        listing_limit: planForm.listing_limit ? Number(planForm.listing_limit) : undefined,
        priority_level: planForm.priority_level ? Number(planForm.priority_level) : undefined,
        price_monthly: planForm.price_monthly ? Number(planForm.price_monthly) : undefined,
        price_yearly: planForm.price_yearly ? Number(planForm.price_yearly) : undefined,
      };
      if (editingPlanId === "new") {
        await apiPost("/admin/pricing/plans", payload);
        success("Plan created.");
      } else {
        await apiPut(`/admin/pricing/plans/${editingPlanId}`, payload);
        success("Plan updated.");
      }
      setEditingPlanId(null);
      refetchPlans();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: number) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await apiDelete(`/admin/pricing/plans/${id}`);
      success("Plan deleted.");
      refetchPlans();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Failed to delete plan.");
    }
  };

  const startEditPackage = (pkg?: LeadPackage) => {
    if (pkg) {
      setPackageForm({
        name: pkg.name, lead_count: String(pkg.lead_count), description: pkg.description ?? "",
        price: String(pkg.price), price_per_lead: String(pkg.price_per_lead ?? ""),
        is_popular: pkg.is_popular, is_active: pkg.is_active,
      });
      setEditingPackageId(pkg.id);
    } else {
      setPackageForm(emptyPackage);
      setEditingPackageId("new");
    }
  };

  const savePackage = async () => {
    setSaving(true);
    try {
      const payload = {
        ...packageForm,
        lead_count: Number(packageForm.lead_count),
        price: Number(packageForm.price),
        price_per_lead: packageForm.price_per_lead ? Number(packageForm.price_per_lead) : undefined,
      };
      if (editingPackageId === "new") {
        await apiPost("/admin/pricing/lead-packages", payload);
        success("Lead package created.");
      } else {
        await apiPut(`/admin/pricing/lead-packages/${editingPackageId}`, payload);
        success("Lead package updated.");
      }
      setEditingPackageId(null);
      refetchPackages();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id: number) => {
    if (!confirm("Delete this lead package?")) return;
    try {
      await apiDelete(`/admin/pricing/lead-packages/${id}`);
      success("Lead package deleted.");
      refetchPackages();
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : "Failed to delete package.");
    }
  };

  return (
    <AdminLayout title="Pricing">
      <div className="space-y-8">
        <p className="text-sm text-slate-500">Manage role-based membership plans and one-off lead packages.</p>
        <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          This manages the <strong>MembershipPlan</strong> / <strong>LeadPackage</strong> models — a separate role-quota
          system from the public <code>/pricing</code> page's agent plan tiers (Solo/Starter/Professional/Elite),
          which stay fixed as-is. Nothing here changes what visitors see on the public pricing page.
        </p>

        {/* ── Membership Plans ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-[#0A2647]">Membership Plans</h2>
            <button
              onClick={() => startEditPlan()}
              className="px-4 py-2 bg-[#0A2647] text-white text-sm font-semibold rounded-lg hover:bg-[#0d3366] transition-colors"
            >
              + Add Plan
            </button>
          </div>

          {plansLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : plansError ? (
            <ErrorState message={plansError} onRetry={refetchPlans} />
          ) : !plans?.data?.length ? (
            <EmptyState icon="💳" title="No membership plans yet" message="Add one to get started." action={{ label: "+ Add Plan", onClick: () => startEditPlan() }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.data.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-bold text-[#0A2647]">{plan.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{plan.description || "No description"}</p>
                  <p className="text-lg font-bold text-[#0A2647] mb-1">{money(plan.price_monthly)}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                  <p className="text-xs text-slate-400 mb-3">{money(plan.price_yearly)}/yr · {plan.lead_quota ?? "∞"} leads/mo</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPlan(plan)} className="text-xs font-semibold text-[#0A2647] hover:underline">Edit</button>
                    <button onClick={() => deletePlan(plan.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingPlanId !== null && (
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-heading font-bold text-[#0A2647] mb-4">{editingPlanId === "new" ? "New Plan" : "Edit Plan"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input placeholder="Name" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Role (agent, broker, ...)" value={planForm.role} onChange={(e) => setPlanForm({ ...planForm, role: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Monthly price" type="number" value={planForm.price_monthly} onChange={(e) => setPlanForm({ ...planForm, price_monthly: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Yearly price" type="number" value={planForm.price_yearly} onChange={(e) => setPlanForm({ ...planForm, price_yearly: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Lead quota / month" type="number" value={planForm.lead_quota} onChange={(e) => setPlanForm({ ...planForm, lead_quota: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Listing limit" type="number" value={planForm.listing_limit} onChange={(e) => setPlanForm({ ...planForm, listing_limit: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Territory coverage" value={planForm.territory_coverage} onChange={(e) => setPlanForm({ ...planForm, territory_coverage: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <select value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <textarea placeholder="Description" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} className="sm:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={savePlan} disabled={saving || !planForm.name} className="px-4 py-2 bg-[#0A2647] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditingPlanId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </section>

        {/* ── Lead Packages ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-[#0A2647]">One-Time Lead Packages</h2>
            <button
              onClick={() => startEditPackage()}
              className="px-4 py-2 bg-[#0A2647] text-white text-sm font-semibold rounded-lg hover:bg-[#0d3366] transition-colors"
            >
              + Add Package
            </button>
          </div>

          {packagesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : packagesError ? (
            <ErrorState message={packagesError} onRetry={refetchPackages} />
          ) : !packages?.data?.length ? (
            <EmptyState icon="📦" title="No lead packages yet" message="Add one to get started." action={{ label: "+ Add Package", onClick: () => startEditPackage() }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.data.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-bold text-[#0A2647]">{pkg.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {pkg.is_active ? "active" : "inactive"}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#0A2647] mb-1">{money(pkg.price)}</p>
                  <p className="text-xs text-slate-400 mb-3">{pkg.lead_count} leads · {money(pkg.price_per_lead)}/lead</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPackage(pkg)} className="text-xs font-semibold text-[#0A2647] hover:underline">Edit</button>
                    <button onClick={() => deletePackage(pkg.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingPackageId !== null && (
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-heading font-bold text-[#0A2647] mb-4">{editingPackageId === "new" ? "New Package" : "Edit Package"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input placeholder="Name" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Lead count" type="number" value={packageForm.lead_count} onChange={(e) => setPackageForm({ ...packageForm, lead_count: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Price" type="number" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Price per lead (optional)" type="number" value={packageForm.price_per_lead} onChange={(e) => setPackageForm({ ...packageForm, price_per_lead: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <textarea placeholder="Description" value={packageForm.description} onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })} className="sm:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={savePackage} disabled={saving || !packageForm.name || !packageForm.lead_count || !packageForm.price} className="px-4 py-2 bg-[#0A2647] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditingPackageId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
