"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface HeaderMenuItem {
  id: number;
  label: string;
  url: string;
  openInNew: boolean;
}

interface FooterLink {
  id: number;
  label: string;
  url: string;
}

interface FooterColumn {
  id: number;
  title: string;
  links: FooterLink[];
}

const initialHeaderItems: HeaderMenuItem[] = [
  { id: 1, label: "Buy", url: "/buy", openInNew: false },
  { id: 2, label: "Rent", url: "/rent", openInNew: false },
  { id: 3, label: "Sell", url: "/sell", openInNew: false },
  { id: 4, label: "Agents", url: "/agents", openInNew: false },
  { id: 5, label: "Blog", url: "/blog", openInNew: false },
  { id: 6, label: "Contact", url: "/contact", openInNew: false },
];

const initialFooterColumns: FooterColumn[] = [
  {
    id: 1,
    title: "Company",
    links: [
      { id: 101, label: "About Us", url: "/about-us" },
      { id: 102, label: "Careers", url: "/careers" },
      { id: 103, label: "Press", url: "/press" },
      { id: 104, label: "Contact", url: "/contact" },
    ],
  },
  {
    id: 2,
    title: "Resources",
    links: [
      { id: 201, label: "Blog", url: "/blog" },
      { id: 202, label: "Buying Guide", url: "/buying-guide" },
      { id: 203, label: "Selling Guide", url: "/selling-guide" },
      { id: 204, label: "Market Reports", url: "/market-reports" },
    ],
  },
  {
    id: 3,
    title: "Legal",
    links: [
      { id: 301, label: "Terms of Service", url: "/terms-of-service" },
      { id: 302, label: "Privacy Policy", url: "/privacy-policy" },
      { id: 303, label: "Cookie Policy", url: "/cookie-policy" },
    ],
  },
  {
    id: 4,
    title: "Connect",
    links: [
      { id: 401, label: "Facebook", url: "https://facebook.com" },
      { id: 402, label: "Instagram", url: "https://instagram.com" },
      { id: 403, label: "Twitter", url: "https://twitter.com" },
      { id: 404, label: "LinkedIn", url: "https://linkedin.com" },
    ],
  },
];

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [headerItems, setHeaderItems] = useState<HeaderMenuItem[]>(initialHeaderItems);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(initialFooterColumns);

  const updateHeaderItem = (id: number, field: keyof HeaderMenuItem, value: string | boolean) => {
    setHeaderItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeHeaderItem = (id: number) => {
    setHeaderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addHeaderItem = () => {
    const newId = Math.max(...headerItems.map((i) => i.id), 0) + 1;
    setHeaderItems((prev) => [...prev, { id: newId, label: "New Item", url: "/", openInNew: false }]);
  };

  const updateFooterLink = (colId: number, linkId: number, field: keyof FooterLink, value: string) => {
    setFooterColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, links: col.links.map((link) => (link.id === linkId ? { ...link, [field]: value } : link)) }
          : col
      )
    );
  };

  const updateFooterColumnTitle = (colId: number, title: string) => {
    setFooterColumns((prev) => prev.map((col) => (col.id === colId ? { ...col, title } : col)));
  };

  const removeFooterLink = (colId: number, linkId: number) => {
    setFooterColumns((prev) =>
      prev.map((col) => (col.id === colId ? { ...col, links: col.links.filter((link) => link.id !== linkId) } : col))
    );
  };

  const addFooterLink = (colId: number) => {
    setFooterColumns((prev) =>
      prev.map((col) => {
        if (col.id !== colId) return col;
        const newId = Math.max(...col.links.map((l) => l.id), 0) + 1;
        return { ...col, links: [...col.links, { id: newId, label: "New Link", url: "/" }] };
      })
    );
  };

  return (
    <AdminLayout title="Navigation Manager">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("header")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "header"
              ? "bg-[#0A2647] text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Header Menu
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "footer"
              ? "bg-[#0A2647] text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Footer Menu
        </button>
      </div>

      {/* Header Menu Tab */}
      {activeTab === "header" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-[#0A2647]">Header Navigation Items</h3>
            <button
              onClick={addHeaderItem}
              className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              + Add Item
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {headerItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Drag Handle */}
                <div className="text-gray-400 cursor-grab">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Order */}
                <span className="text-xs text-gray-400 w-6 text-center">{index + 1}</span>

                {/* Label */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateHeaderItem(item.id, "label", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  />
                </div>

                {/* URL */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => updateHeaderItem(item.id, "url", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                  />
                </div>

                {/* Open in New Tab */}
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.openInNew}
                    onChange={(e) => updateHeaderItem(item.id, "openInNew", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227]"
                  />
                  <span className="hidden sm:inline">New Tab</span>
                </label>

                {/* Delete */}
                <button
                  onClick={() => removeHeaderItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Menu Tab */}
      {activeTab === "footer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {footerColumns.map((column) => (
            <div key={column.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  value={column.title}
                  onChange={(e) => updateFooterColumnTitle(column.id, e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                />
              </div>
              <div className="divide-y divide-gray-100">
                {column.links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateFooterLink(column.id, link.id, "label", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateFooterLink(column.id, link.id, "url", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
                        placeholder="URL"
                      />
                    </div>
                    <button
                      onClick={() => removeFooterLink(column.id, link.id)}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => addFooterLink(column.id)}
                  className="w-full px-3 py-1.5 text-sm text-[#C9A227] hover:text-[#0A2647] font-medium border border-dashed border-[#C9A227] rounded-lg hover:bg-[#C9A227]/10 transition-colors"
                >
                  + Add Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]">
          Save Navigation
        </button>
      </div>
    </AdminLayout>
  );
}
