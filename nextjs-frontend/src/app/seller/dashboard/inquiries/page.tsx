"use client";

import SellerLayout from "@/components/seller/SellerLayout";

const INQUIRIES = [
  { id: 1, buyer: "Michael Chen", email: "m.chen@email.com", phone: "(555) 234-5678", message: "Is the pool area fenced? I have young children.", time: "2h ago", property: "Sunset Villa with Pool", status: "New" },
  { id: 2, buyer: "Lisa Rodriguez", email: "lisa.r@email.com", phone: "(555) 345-6789", message: "Would you consider a lower offer? We are first-time buyers with financing pre-approved.", time: "5h ago", property: "Sunset Villa with Pool", status: "Replied" },
  { id: 3, buyer: "David Park", email: "d.park@email.com", phone: "(555) 456-7890", message: "What are the monthly HOA fees and what do they include?", time: "1d ago", property: "Sunset Villa with Pool", status: "Replied" },
  { id: 4, buyer: "Emma Wilson", email: "emma.w@email.com", phone: "(555) 567-8901", message: "Can I schedule a second showing this weekend? I would like to bring my contractor.", time: "2d ago", property: "Sunset Villa with Pool", status: "Closed" },
  { id: 5, buyer: "James Thompson", email: "j.thompson@email.com", phone: "(555) 678-9012", message: "How long has the property been on the market? I noticed a price reduction.", time: "3d ago", property: "Sunset Villa with Pool", status: "New" },
];

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Replied: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-500",
};

export default function SellerInquiriesPage() {
  return (
    <SellerLayout title="Listing Inquiries" subtitle="View and respond to buyer inquiries about your property.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{INQUIRIES.length} inquiries · {INQUIRIES.filter((i) => i.status === "New").length} new</span>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white">
              <option>All Status</option>
              <option>New</option>
              <option>Replied</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {INQUIRIES.map((inquiry) => (
              <div key={inquiry.id} className="px-5 py-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#0A2647] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {inquiry.buyer.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#0A2647] text-sm">{inquiry.buyer}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[inquiry.status]}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{inquiry.email} · {inquiry.phone}</p>
                      <p className="text-slate-600 text-sm mt-2 bg-slate-50 rounded-lg p-3">{inquiry.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0 ml-4">{inquiry.time}</span>
                </div>
                <div className="flex gap-2 mt-3 ml-13">
                  <button className="bg-[#0A2647] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0A2647]/90 transition">
                    Reply
                  </button>
                  <button className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
