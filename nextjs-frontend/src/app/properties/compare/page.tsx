'use client';

import { useState } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

const allProperties = [
  { id: 1, address: '123 Oak Lane', city: 'Beverly Hills, CA', price: '$1,250,000', beds: 4, baths: 3, sqft: '2,800', type: 'Single Family', yearBuilt: 2018, garage: '2-car', lotSize: '8,500 sqft' },
  { id: 2, address: '456 Maple Dr', city: 'Pacific Palisades, CA', price: '$875,000', beds: 3, baths: 2, sqft: '1,950', type: 'Townhouse', yearBuilt: 2020, garage: '1-car', lotSize: '2,400 sqft' },
  { id: 3, address: '789 Pine St', city: 'Santa Monica, CA', price: '$2,100,000', beds: 5, baths: 4, sqft: '3,600', type: 'Single Family', yearBuilt: 2015, garage: '3-car', lotSize: '12,000 sqft' },
  { id: 4, address: '321 Cedar Ave', city: 'Malibu, CA', price: '$3,400,000', beds: 6, baths: 5, sqft: '4,200', type: 'Estate', yearBuilt: 2021, garage: '3-car', lotSize: '25,000 sqft' },
  { id: 5, address: '654 Birch Blvd', city: 'Venice, CA', price: '$720,000', beds: 2, baths: 2, sqft: '1,200', type: 'Condo', yearBuilt: 2022, garage: '1-car', lotSize: 'N/A' },
  { id: 6, address: '987 Elm Court', city: 'Pasadena, CA', price: '$950,000', beds: 3, baths: 2, sqft: '2,100', type: 'Single Family', yearBuilt: 2017, garage: '2-car', lotSize: '6,200 sqft' },
];

export default function ComparePropertiesPage() {
  const [selected, setSelected] = useState<number[]>([1, 2]);

  const toggleProperty = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const compared = allProperties.filter((p) => selected.includes(p.id));

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Compare" title="Compare Properties" subtitle="Select up to 4 properties to compare side by side and find the perfect match." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-4">Select properties to compare (max 4)</h2>
          <div className="flex flex-wrap gap-3">
            {allProperties.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleProperty(p.id)}
                className={`px-4 py-2 rounded-lg font-body text-sm font-medium border transition-colors ${
                  selected.includes(p.id)
                    ? 'bg-[#0A2647] text-white border-[#0A2647]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#0A2647]'
                }`}
              >
                {p.address}
              </button>
            ))}
          </div>
        </div>

        {compared.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left font-heading font-semibold text-[#0A2647] px-6 py-4 border-b border-gray-200">Feature</th>
                  {compared.map((p) => (
                    <th key={p.id} className="text-left font-heading font-semibold text-[#0A2647] px-6 py-4 border-b border-gray-200">{p.address}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-500 font-medium">Price</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4 font-semibold text-[#0A2647]">{p.price}</td>)}
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500 font-medium">City</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.city}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-500 font-medium">Type</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.type}</td>)}
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500 font-medium">Bedrooms</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.beds}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-500 font-medium">Bathrooms</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.baths}</td>)}
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500 font-medium">Square Feet</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.sqft}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 text-gray-500 font-medium">Year Built</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.yearBuilt}</td>)}
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500 font-medium">Garage</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.garage}</td>)}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-500 font-medium">Lot Size</td>
                  {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.lotSize}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {compared.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="font-body text-gray-500 text-lg">Select at least 2 properties above to compare.</p>
          </div>
        )}
      </div>

      <CTASection
        title="Need Help Choosing?"
        subtitle="Our agents can provide detailed insights and arrange viewings for any properties you're considering."
        primaryAction={{ label: 'Talk to an Agent', href: '/contact' }}
        secondaryAction={{ label: 'View All Properties', href: '/properties' }}
      />
    </main>
  );
}
