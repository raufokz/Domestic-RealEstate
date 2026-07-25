"use client";

import InvestorLayout from "@/components/investor/InvestorLayout";

const PROPERTIES = [
  {
    id: 1,
    name: "Sunset Boulevard Condo",
    type: "Condo",
    purchasePrice: "$420,000",
    currentValue: "$485,000",
    roi: "+15.5%",
    status: "Occupied",
    cashFlow: "$2,800/mo",
    statusColor: "bg-emerald-100 text-emerald-700",
    roiColor: "text-emerald-600",
  },
  {
    id: 2,
    name: "Downtown Loft",
    type: "Loft",
    purchasePrice: "$540,000",
    currentValue: "$620,000",
    roi: "+14.8%",
    status: "Occupied",
    cashFlow: "$3,200/mo",
    statusColor: "bg-emerald-100 text-emerald-700",
    roiColor: "text-emerald-600",
  },
  {
    id: 3,
    name: "Beachfront Villa",
    type: "Single Family",
    purchasePrice: "$1,050,000",
    currentValue: "$1,250,000",
    roi: "+19.0%",
    status: "Vacant",
    cashFlow: "$0/mo",
    statusColor: "bg-amber-100 text-amber-700",
    roiColor: "text-emerald-600",
  },
  {
    id: 4,
    name: "Suburban Duplex",
    type: "Multi-Family",
    purchasePrice: "$310,000",
    currentValue: "$380,000",
    roi: "+22.6%",
    status: "Occupied",
    cashFlow: "$4,100/mo",
    statusColor: "bg-emerald-100 text-emerald-700",
    roiColor: "text-emerald-600",
  },
  {
    id: 5,
    name: "Midtown Townhouse",
    type: "Townhouse",
    purchasePrice: "$480,000",
    currentValue: "$540,000",
    roi: "+12.5%",
    status: "Under Maintenance",
    cashFlow: "$0/mo",
    statusColor: "bg-blue-100 text-blue-700",
    roiColor: "text-emerald-600",
  },
];

export default function PortfolioPage() {
  return (
    <InvestorLayout title="My Portfolio" subtitle="Track all your investment properties">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-sm text-slate-500">Total Invested</span>
            <p className="text-2xl font-bold text-[#0A2647] mt-1">$2,800,000</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-sm text-slate-500">Current Value</span>
            <p className="text-2xl font-bold text-[#0A2647] mt-1">$3,275,000</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-sm text-slate-500">Monthly Cash Flow</span>
            <p className="text-2xl font-bold text-[#C9A227] mt-1">$10,100</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#0A2647]">Properties</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Purchase Price</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Current Value</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ROI</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Cash Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PROPERTIES.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50 transition cursor-pointer">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-[#0A2647] text-sm">{prop.name}</p>
                        <p className="text-xs text-slate-400">{prop.type}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{prop.purchasePrice}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{prop.currentValue}</td>
                    <td className="px-5 py-4 text-sm font-semibold">{prop.roi}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prop.statusColor}`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0A2647]">{prop.cashFlow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
