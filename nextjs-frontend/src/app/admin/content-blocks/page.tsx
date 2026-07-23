"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPut, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface ContentBlock {
  key: string;
  name: string;
  type: "text" | "image" | "rich-text" | "json";
  last_edited: string;
  content: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  text: { label: "Text", color: "bg-blue-100 text-blue-800", icon: "📝" },
  image: { label: "Image", color: "bg-purple-100 text-purple-800", icon: "🖼️" },
  "rich-text": { label: "Rich Text", color: "bg-green-100 text-green-800", icon: "📄" },
  json: { label: "JSON", color: "bg-orange-100 text-orange-800", icon: "🔧" },
};

export default function ContentBlocksPage() {
  const { success, notifyError } = useToast();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBlocks();
  }, []);

  async function fetchBlocks() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<{ data: ContentBlock[] }>("/admin/content-blocks");
      setBlocks(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load content blocks. Please check the API connection and try again."
      );
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBlock() {
    if (!editingBlock) return;
    try {
      setSaving(true);
      // Route is the keyless bulk endpoint (PUT /admin/content-blocks); send the key in the body.
      await apiPut(`/admin/content-blocks`, { key: editingBlock.key, content: editContent });
      success("Content block saved.");
      setEditingBlock(null);
      await fetchBlocks();
    } catch (e) {
      // Do not fabricate a local save when the server call failed.
      notifyError(e, "Could not save content block. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function openEditor(block: ContentBlock) {
    setEditingBlock(block);
    setEditContent(block.content);
  }

  const filtered = blocks.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.key.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Content Blocks">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-sm text-gray-500">{blocks.length} content block{blocks.length !== 1 ? "s" : ""}</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks..."
            className="w-full sm:w-72 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
            <span className="ml-3 text-gray-500">Loading content blocks...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchBlocks}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">🧩</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content blocks found</h3>
            <p className="text-gray-500 text-sm">{search ? "Try a different search term." : "Content blocks will appear here."}</p>
          </div>
        )}

        {/* Blocks List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((block) => {
              const tc = typeConfig[block.type];
              return (
                <div key={block.key} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0A2647]/5 flex items-center justify-center text-lg">
                      {tc.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0A2647]">{block.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${tc.color}`}>{tc.label}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Last edited {new Date(block.last_edited).toLocaleDateString()}</span>
                      </div>
                      {block.content && (
                        <p className="text-xs text-gray-400 mt-1 max-w-lg truncate">{block.content}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openEditor(block)}
                    className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingBlock && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A2647]">Edit: {editingBlock.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Key: {editingBlock.key}</p>
                  </div>
                  <button onClick={() => setEditingBlock(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                {editingBlock.type === "image" ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-[#C9A227] transition-colors cursor-pointer">
                      <div className="text-3xl mb-3">📤</div>
                      <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 5MB</p>
                    </div>
                    {editingBlock.content && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-2">Current file:</p>
                        <p className="text-sm text-[#0A2647] font-medium">{editingBlock.content}</p>
                      </div>
                    )}
                  </div>
                ) : editingBlock.type === "json" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">JSON Content</label>
                    <textarea
                      rows={12}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#C9A227] outline-none resize-none"
                      spellCheck={false}
                    />
                    {(() => {
                      try {
                        JSON.parse(editContent);
                        return null;
                      } catch {
                        return <p className="text-xs text-red-500 mt-1">Invalid JSON format</p>;
                      }
                    })()}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingBlock.type === "rich-text" ? "Rich Text Content" : "Text Content"}
                    </label>
                    <textarea
                      rows={8}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none"
                    />
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setEditingBlock(null)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleSaveBlock}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Block"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
