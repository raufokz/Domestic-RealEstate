"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";

const COMPARED_PROPERTIES = [
  {
    id: 1,
    title: "Oceanfront Retreat",
    address: "222 Coastal Hwy, Miami Beach",
    price: "$890,000",
    beds: 3,
    baths: 2,
    sqft: "2,100",
    yearBuilt: 2019,
    lotSize: "0.25 acres",
    garage: "2-car",
    hoa: "$350/mo",
    propertyType: "Single Family",
    status: "Active",
  },
  {
    id: 2,
    title: "Urban Loft Downtown",
    address: "55 Main Street, Austin",
    price: "$445,000",
    beds: 2,
    baths: 1,
    sqft: "1,400",
    yearBuilt: 2021,
    lotSize: "N/A",
    garage: "None",
    hoa: "$225/mo",
    propertyType: "Condo",
    status: "Active",
  },
  {
    id: 3,
    title: "Family Ranch Home",
    address: "890 Elm Circle, Dallas",
    price: "$375,000",
    beds: 4,
    baths: 3,
    sqft: "2,800",
    yearBuilt: 2015,
    lotSize: "0.5 acres",
    garage: "3-car",
    hoa: "None",
    propertyType: "Single Family",
    status: "Pending",
  },
];

const COMPARISON_ROWS = [
  { label: "Price", key: "price" },
  { label: "Bedrooms", key: "beds" },
  { label: "Bathrooms", key: "baths" },
  { label: "Square Feet", key: "sqft" },
  { label: "Year Built", key: "yearBuilt" },
  { label: "Lot Size", key: "lotSize" },
  { label: "Garage", key: "garage" },
  { label: "HOA", key: "hoa" },
  { label: "Property Type", key: "propertyType" },
  { label: "Status", key: "status" },
];

export default function BuyerComparePage() {
  return (
    <BuyerLayout title="Property Comparison" subtitle="Compare properties side by side to make informed decisions.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{COMPARED_PROPERTIES.length} properties selected</span>
          <button className="bg-[#C9A227] text-[#0A2647] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            + Add Property
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4 bg-slate-50 w-44">
                    Feature
                  </th>
                  {COMPARED_PROPERTIES.map((prop) => (
                    <th key={prop.id} className="text-left px-5 py-4 bg-slate-50 min-w-[200px]">
                      <p className="font-bold text-[#0A2647] text-sm">{prop.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{prop.address}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-600 bg-slate-50/50">{row.label}</td>
                    {COMPARED_PROPERTIES.map((prop) => {
                      const value = prop[row.key as keyof typeof prop];
                      return (
                        <td key={prop.id} className="px-5 py-3.5 text-sm text-[#0A2647] font-medium">
                          {String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMPARED_PROPERTIES.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
              <p className="font-bold text-[#0A2647]">{prop.title}</p>
              <p className="text-[#C9A227] font-bold text-lg mt-1">{prop.price}</p>
              <button className="mt-3 w-full bg-[#0A2647] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90 transition">
                Schedule Viewing
              </button>
            </div>
          ))}
        </div>
      </div>
    </BuyerLayout>
  );
}
