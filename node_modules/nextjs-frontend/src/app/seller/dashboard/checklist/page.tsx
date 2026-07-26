"use client";

import SellerLayout from "@/components/seller/SellerLayout";

const CHECKLIST_ITEMS = [
  { id: 1, category: "Preparation", task: "Complete home inspection", done: true },
  { id: 2, category: "Preparation", task: "Make minor repairs and touch-ups", done: true },
  { id: 3, category: "Preparation", task: "Declutter and deep clean the property", done: true },
  { id: 4, category: "Preparation", task: "Stage the home for showings", done: false },
  { id: 5, category: "Pricing", task: "Review comparative market analysis", done: true },
  { id: 6, category: "Pricing", task: "Set listing price with agent", done: true },
  { id: 7, category: "Marketing", task: "Professional photography completed", done: true },
  { id: 8, category: "Marketing", task: "Write property description", done: false },
  { id: 9, category: "Marketing", task: "Create virtual tour / video walkthrough", done: false },
  { id: 10, category: "Marketing", task: "List on MLS and major platforms", done: false },
  { id: 11, category: "Documents", task: "Gather property disclosure documents", done: true },
  { id: 12, category: "Documents", task: "Prepare title deed and HOA docs", done: false },
  { id: 13, category: "Documents", task: "Review and sign listing agreement", done: true },
  { id: 14, category: "Closing", task: "Review and negotiate offers", done: false },
  { id: 15, category: "Closing", task: "Accept an offer", done: false },
  { id: 16, category: "Closing", task: "Complete inspection contingency", done: false },
  { id: 17, category: "Closing", task: "Close the sale", done: false },
];

const CATEGORIES = ["Preparation", "Pricing", "Marketing", "Documents", "Closing"];

export default function SellerChecklistPage() {
  const completed = CHECKLIST_ITEMS.filter((i) => i.done).length;
  const total = CHECKLIST_ITEMS.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <SellerLayout title="Selling Checklist" subtitle="Track your progress through the home selling process.">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#0A2647]">Overall Progress</h3>
            <span className="text-sm font-semibold text-[#C9A227]">{completed}/{total} tasks completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-[#C9A227] to-[#b8911f] rounded-full h-3 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{progress}% complete</p>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const items = CHECKLIST_ITEMS.filter((i) => i.category === cat);
            const catDone = items.filter((i) => i.done).length;
            return (
              <div key={cat} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <h4 className="font-bold text-[#0A2647] text-sm">{cat}</h4>
                  <span className="text-xs text-slate-500">{catDone}/{items.length}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                        {item.done && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${item.done ? "text-slate-400 line-through" : "text-[#0A2647] font-medium"}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SellerLayout>
  );
}
