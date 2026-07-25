"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/Toast";

interface Deal {
  id: number;
  deal_number: string;
  title: string;
  value: number;
  status: string;
  stage_id: number;
  assigned_to: number | null;
  lead_id: number | null;
  expected_close_date: string | null;
  stage?: { id: number; name: string; color: string };
  lead?: { id: number; first_name: string; last_name: string; email: string };
  assignee?: { id: number; first_name: string; last_name: string };
}

interface Stage {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
  deals: Deal[];
}

interface Pipeline {
  id: number;
  name: string;
  stages: Stage[];
}

export default function PipelinePage() {
  const { success, notifyError } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: "", value: "", stage_id: "", expected_close_date: "" });
  const [creating, setCreating] = useState(false);

  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Pipeline[] | { data: Pipeline[] }>("/pipelines");
      const list: Pipeline[] = Array.isArray(data) ? data : (data && typeof data === 'object' && 'data' in data ? data.data : []);
      setPipelines(list);
      if (list.length > 0 && !activePipeline) {
        setActivePipeline(list[0]);
      }
    } catch {
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPipelines(); }, [fetchPipelines]);

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: number) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedDeal || !activePipeline || draggedDeal.stage_id === targetStageId) {
      setDraggedDeal(null);
      return;
    }

    const movedDeal = { ...draggedDeal, stage_id: targetStageId };

    setActivePipeline(prev => {
      if (!prev) return prev;
      return { ...prev, stages: prev.stages.map(stage => {
        if (stage.id === draggedDeal.stage_id) {
          return { ...stage, deals: stage.deals.filter(d => d.id !== draggedDeal.id) };
        }
        if (stage.id === targetStageId) {
          return { ...stage, deals: [...stage.deals, movedDeal] };
        }
        return stage;
      })};
    });

    try {
      await apiPut(`/pipelines/${activePipeline.id}/deals/${draggedDeal.id}/move`, { stage_id: targetStageId });
    } catch (err) {
      notifyError(err, "CRM pipeline is not working because the deal could not be moved.");
      fetchPipelines();
    }
    setDraggedDeal(null);
  };

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.stage_id || !activePipeline) return;
    setCreating(true);
    try {
      await apiPost(`/pipelines/${activePipeline.id}/deals`, {
        title: newDeal.title,
        value: parseFloat(newDeal.value) || 0,
        stage_id: parseInt(newDeal.stage_id),
        expected_close_date: newDeal.expected_close_date || null,
      });
      setShowCreateModal(false);
      setNewDeal({ title: "", value: "", stage_id: "", expected_close_date: "" });
      fetchPipelines();
      success("Deal created in your pipeline.", "CRM");
    } catch (err) {
      notifyError(err, "CRM pipeline is not working because the deal could not be created.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!activePipeline || !confirm("Delete this deal?")) return;
    try {
      await apiDelete(`/pipelines/${activePipeline.id}/deals/${dealId}`);
      fetchPipelines();
      success("Deal deleted.", "CRM");
    } catch (err) {
      notifyError(err, "CRM pipeline is not working because the deal could not be deleted.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title="Sales Pipeline">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2].map(j => <div key={j} className="h-20 bg-gray-200 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sales Pipeline">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={activePipeline?.id || ""}
            onChange={(e) => {
              const p = pipelines.find(p => p.id === parseInt(e.target.value));
              if (p) setActivePipeline(p);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); if (activePipeline?.stages?.length) setNewDeal(prev => ({ ...prev, stage_id: String(activePipeline.stages[0].id) })); }}
          className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0c2f57] transition-colors"
        >
          + New Deal
        </button>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-[#0A2647] flex items-center gap-2">
            <span>💡</span> How to Use the Sales Pipeline
          </h3>
        </div>
        <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
          <li><strong>Drag & Drop:</strong> Move deal cards between columns to update stage and deal status in real time.</li>
          <li><strong>Track Pipeline Value:</strong> Each column displays real-time total property deal value.</li>
          <li><strong>Manage Deals:</strong> Click <strong>+ New Deal</strong> to log new transaction opportunities.</li>
        </ul>
      </div>

      {activePipeline && (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
          {activePipeline.stages.map(stage => (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 transition-colors ${
                dragOverStage === stage.id ? 'bg-blue-50 ring-2 ring-blue-300' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="font-semibold text-sm text-gray-900">{stage.name}</h3>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {stage.deals?.length || 0}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {formatCurrency(stage.deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0)}
              </div>

              <div className="space-y-2 min-h-[100px]">
                {(stage.deals || []).map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{deal.title}</p>
                        {deal.value > 0 && (
                          <p className="text-sm font-semibold mt-1" style={{ color: '#C9A227' }}>
                            {formatCurrency(deal.value)}
                          </p>
                        )}
                        {deal.lead && (
                          <p className="text-xs text-gray-500 mt-1">
                            {deal.lead.first_name} {deal.lead.last_name}
                          </p>
                        )}
                        {deal.assignee && (
                          <p className="text-xs text-gray-400 mt-1">
                            {deal.assignee.first_name} {deal.assignee.last_name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDeal(deal.id); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Deal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                  placeholder="e.g. Smith Family - Downtown Condo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value ($)</label>
                <input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={newDeal.stage_id}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, stage_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                >
                  <option value="">Select stage</option>
                  {activePipeline?.stages?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={newDeal.expected_close_date}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, expected_close_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={creating || !newDeal.title || !newDeal.stage_id}
                className="flex-1 px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0c2f57] transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Deal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
