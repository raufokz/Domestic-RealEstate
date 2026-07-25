'use client';

import { useEffect, useState } from 'react';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { apiGet, ApiError } from '@/lib/api';
import { formatPrice, type PublicProperty } from '@/lib/properties';

export default function ComparePropertiesPage() {
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{ data: PublicProperty[] } | PublicProperty[]>('/properties?per_page=60');
      const list = Array.isArray(data) ? data : data.data ?? [];
      setProperties(list);
      setSelected(list.slice(0, 2).map((p) => p.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load properties. Please check the API connection and try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleProperty = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const compared = properties.filter((p) => selected.includes(p.id));

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Compare" title="Compare Properties" subtitle="Select up to 4 properties to compare side by side and find the perfect match." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2647]" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16 border-2 border-dashed border-red-200 rounded-2xl">
            <p className="font-body text-red-600 mb-4">{error}</p>
            <button onClick={fetchData} className="px-5 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="font-body text-gray-500 text-lg">No listings are available to compare right now.</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-4">Select properties to compare (max 4)</h2>
              <div className="flex flex-wrap gap-3">
                {properties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleProperty(p.id)}
                    aria-pressed={selected.includes(p.id)}
                    className={`px-4 py-2 rounded-lg font-body text-sm font-medium border transition-colors ${
                      selected.includes(p.id)
                        ? 'bg-[#0A2647] text-white border-[#0A2647]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#0A2647]'
                    }`}
                  >
                    {p.title || p.address || `Property #${p.id}`}
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
                        <th key={p.id} className="text-left font-heading font-semibold text-[#0A2647] px-6 py-4 border-b border-gray-200">
                          {p.title || p.address || `Property #${p.id}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm">
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-500 font-medium">Price</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4 font-semibold text-[#0A2647]">{formatPrice(p.price)}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-500 font-medium">City</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.city || '—'}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-500 font-medium">Type</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.propertyType?.name || '—'}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-500 font-medium">Bedrooms</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.bedrooms ?? '—'}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-500 font-medium">Bathrooms</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.bathrooms ?? '—'}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-500 font-medium">Square Feet</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.sqft ?? '—'}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-500 font-medium">Year Built</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.year_built ?? '—'}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-500 font-medium">Parking</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.parking_spaces ?? '—'}</td>)}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-500 font-medium">Lot Size</td>
                      {compared.map((p) => <td key={p.id} className="px-6 py-4">{p.lot_size ?? '—'}</td>)}
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
          </>
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
