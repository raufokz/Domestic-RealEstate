"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface PageOption {
  id: number;
  title: string;
  slug: string;
  status?: string;
}

interface PageSection {
  id: number;
  type: string;
  name: string;
  settings: SectionSettings;
}

interface SectionSettings {
  background_color: string;
  padding: number;
  text_align: string;
  animation: string;
  desktop_visible: boolean;
  tablet_visible: boolean;
  mobile_visible: boolean;
}

const SECTION_TYPES = [
  { type: "hero", name: "Hero", icon: "🏠", description: "Full-width hero banner with headline" },
  { type: "features-grid", name: "Features Grid", icon: "🔷", description: "Grid of feature cards with icons" },
  { type: "content", name: "Content", icon: "📝", description: "Rich text content block" },
  { type: "testimonial-carousel", name: "Testimonial Carousel", icon: "💬", description: "Rotating client testimonials" },
  { type: "property-showcase", name: "Property Showcase", icon: "🏡", description: "Featured property listings" },
  { type: "agent-directory", name: "Agent Directory", icon: "👥", description: "Team member profiles grid" },
  { type: "faq-accordion", name: "FAQ Accordion", icon: "❓", description: "Expandable FAQ items" },
  { type: "cta-banner", name: "CTA Banner", icon: "📢", description: "Call-to-action banner" },
  { type: "blog-feed", name: "Blog Feed", icon: "📰", description: "Latest blog posts" },
  { type: "stats-counter", name: "Stats Counter", icon: "📊", description: "Animated number counters" },
  { type: "map", name: "Map", icon: "🗺️", description: "Interactive property map" },
  { type: "contact-form", name: "Contact Form", icon: "✉️", description: "Contact form fields" },
  { type: "video", name: "Video", icon: "🎬", description: "Embedded video player" },
  { type: "pricing-table", name: "Pricing Table", icon: "💲", description: "Service pricing comparison" },
  { type: "gallery", name: "Gallery", icon: "🖼️", description: "Photo gallery grid" },
  { type: "tabs", name: "Tabs", icon: "🗂️", description: "Tabbed content sections" },
  { type: "accordion", name: "Accordion", icon: "📋", description: "Expandable content panels" },
  { type: "custom-html", name: "Custom HTML", icon: "⚙️", description: "Custom HTML/CSS/JS block" },
];

const DEFAULT_SETTINGS: SectionSettings = {
  background_color: "#ffffff",
  padding: 40,
  text_align: "left",
  animation: "none",
  desktop_visible: true,
  tablet_visible: true,
  mobile_visible: true,
};

export default function PageBuilderPage() {
  const { success, notifyError } = useToast();
  const [pages, setPages] = useState<PageOption[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [pagesError, setPagesError] = useState("");
  const [sectionsError, setSectionsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const selectedPage = pages.find((p) => p.id === selectedPageId) || null;

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPageId) fetchSections(selectedPageId);
    else setSections([]);
  }, [selectedPageId]);

  async function fetchPages() {
    try {
      setPagesError("");
      const data = await apiGet<{ data: PageOption[] }>("/admin/pages");
      setPages(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      // No silent fallback to fabricated data: surface the real error + retry.
      setPagesError(
        e instanceof ApiError ? e.message : "Could not load pages. Please check the API connection and try again."
      );
      setPages([]);
    }
  }

  async function fetchSections(pageId: number) {
    try {
      setLoading(true);
      setSectionsError("");
      const data = await apiGet<{ data: PageSection[] }>(`/admin/pages/${pageId}/sections`);
      setSections(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setSectionsError(
        e instanceof ApiError ? e.message : "Could not load sections for this page. Please try again."
      );
      setSections([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSection(type: string) {
    const sectionType = SECTION_TYPES.find((s) => s.type === type);
    if (!sectionType || !selectedPageId) return;

    try {
      const res = await apiPost<{ data: PageSection }>(`/admin/pages/${selectedPageId}/sections`, {
        type,
        name: sectionType.name,
        settings: { ...DEFAULT_SETTINGS },
      });
      // Use the server's persisted section (real id) rather than fabricating one.
      setSections((prev) => [...prev, res.data]);
      success("Section added.");
    } catch (e) {
      notifyError(e, "Could not add section. Please try again.");
    } finally {
      setShowSectionPicker(false);
    }
  }

  async function handleReorder(idx: number, direction: "up" | "down") {
    const prevSections = sections;
    const newSections = [...sections];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newSections.length) return;

    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections);

    try {
      await apiPut(`/admin/pages/${selectedPageId}/sections/reorder`, {
        order: newSections.map((s) => s.id),
      });
    } catch (e) {
      // Revert the optimistic swap when the server rejected it.
      setSections(prevSections);
      notifyError(e, "Could not reorder sections. Please try again.");
    }
  }

  async function handleDeleteSection(sectionId: number) {
    const prevSections = sections;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));

    try {
      await apiDelete(`/admin/pages/${selectedPageId}/sections/${sectionId}`);
      success("Section deleted.");
    } catch (e) {
      // Restore the row when the server delete failed.
      setSections(prevSections);
      notifyError(e, "Could not delete section. Please try again.");
    }
  }

  async function handleSaveSectionSettings() {
    if (!editingSection || !selectedPageId) return;
    try {
      setSaving(true);
      await apiPut(`/admin/pages/${selectedPageId}/sections/${editingSection.id}`, {
        name: editingSection.name,
        type: editingSection.type,
        settings: editingSection.settings,
      });
      setSections((prev) => prev.map((s) => (s.id === editingSection.id ? editingSection : s)));
      setEditingSection(null);
      success("Section settings saved.");
    } catch (e) {
      // Keep the panel open so the admin can retry; do not fake a local save.
      notifyError(e, "Could not save section settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAll() {
    if (!selectedPageId) return;
    try {
      setSaving(true);
      await apiPut(`/admin/pages/${selectedPageId}/sections/reorder`, {
        order: sections.map((s) => s.id),
      });
      success("Page layout saved.");
    } catch (e) {
      notifyError(e, "Could not save the page layout. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handlePreview() {
    if (selectedPage?.slug) {
      const path = selectedPage.slug.startsWith("/") ? selectedPage.slug : `/${selectedPage.slug}`;
      window.open(path, "_blank");
    }
  }

  async function handlePublish() {
    if (!selectedPageId) return;
    try {
      setSaving(true);
      await apiPost(`/admin/pages/${selectedPageId}/publish`, { status: "published" });
      setPages((prev) => prev.map((p) => (p.id === selectedPageId ? { ...p, status: "published" } : p)));
      success("Page published.");
    } catch (e) {
      notifyError(e, "Could not publish the page. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const sectionTypeMap = Object.fromEntries(SECTION_TYPES.map((s) => [s.type, s]));

  return (
    <AdminLayout title="Page Builder">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedPageId || ""}
              onChange={(e) => setSelectedPageId(Number(e.target.value) || null)}
              className="flex-1 sm:w-64 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
            >
              <option value="">Select a page...</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>{page.title} ({page.slug})</option>
              ))}
            </select>
          </div>
          {selectedPageId && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2.5 border border-[#0A2647] text-[#0A2647] rounded-lg text-sm font-medium hover:bg-[#0A2647]/5"
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2.5 bg-[#0A2647] text-white rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90 transition disabled:opacity-50"
              >
                {selectedPage?.status === "published" ? "Published ✓" : "Publish"}
              </button>
            </div>
          )}
        </div>

        {pagesError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{pagesError}</p>
            <button
              onClick={fetchPages}
              className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
            >
              Retry
            </button>
          </div>
        )}

        {!selectedPageId && !pagesError && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Builder</h3>
            <p className="text-gray-500 text-sm">
              {pages.length === 0 ? "No pages exist yet. Create a page under Content → Pages first." : "Select a page above to start building with sections."}
            </p>
          </div>
        )}

        {selectedPageId && (
          <div className="flex gap-6">
            {/* Sidebar - Section Types */}
            {showSidebar && (
              <div className="w-72 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
                  <h3 className="font-bold text-[#0A2647] mb-3 text-sm">Add Section</h3>
                  <div className="space-y-1 max-h-[60vh] overflow-auto">
                    {SECTION_TYPES.map((st) => (
                      <button
                        key={st.type}
                        onClick={() => handleAddSection(st.type)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#0A2647]/5 transition text-left"
                      >
                        <span className="text-lg flex-shrink-0">{st.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0A2647] truncate">{st.name}</p>
                          <p className="text-xs text-gray-500 truncate">{st.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
                  <span className="ml-3 text-gray-500">Loading sections...</span>
                </div>
              ) : sectionsError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-700">{sectionsError}</p>
                  <button
                    onClick={() => selectedPageId && fetchSections(selectedPageId)}
                    className="mt-3 px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f]"
                  >
                    Retry
                  </button>
                </div>
              ) : sections.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Click &ldquo;Show Sidebar&rdquo; to add sections to this page.</p>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition"
                  >
                    Add First Section
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, idx) => {
                    const st = sectionTypeMap[section.type];
                    return (
                      <div key={section.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleReorder(idx, "up")}
                            disabled={idx === 0}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-[#0A2647] disabled:opacity-30 text-xs"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleReorder(idx, "down")}
                            disabled={idx === sections.length - 1}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-[#0A2647] disabled:opacity-30 text-xs"
                          >
                            ▼
                          </button>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#0A2647]/5 flex items-center justify-center text-lg flex-shrink-0">
                          {st?.icon || "📦"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#0A2647] text-sm">{section.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{st?.description}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">Padding: {section.settings.padding}px</span>
                            {!section.settings.desktop_visible && (
                              <span className="text-xs text-yellow-600">Hidden on desktop</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => setEditingSection(section)}
                            className="text-[#C9A227] hover:text-[#0A2647] font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Section Button */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-[#C9A227] hover:text-[#C9A227] transition"
                  >
                    + Add Section
                  </button>
                </div>
              )}
            </div>

            {/* Settings Panel */}
            {editingSection && (
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#0A2647] text-sm">Section Settings</h3>
                    <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingSection.settings.background_color}
                          onChange={(e) => setEditingSection((s) => s ? { ...s, settings: { ...s.settings, background_color: e.target.value } } : s)}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingSection.settings.background_color}
                          onChange={(e) => setEditingSection((s) => s ? { ...s, settings: { ...s.settings, background_color: e.target.value } } : s)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#C9A227] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Padding: {editingSection.settings.padding}px</label>
                      <input
                        type="range"
                        min={0}
                        max={160}
                        step={10}
                        value={editingSection.settings.padding}
                        onChange={(e) => setEditingSection((s) => s ? { ...s, settings: { ...s.settings, padding: Number(e.target.value) } } : s)}
                        className="w-full accent-[#C9A227]"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0</span>
                        <span>160</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                      <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            onClick={() => setEditingSection((s) => s ? { ...s, settings: { ...s.settings, text_align: align } } : s)}
                            className={`flex-1 py-2 text-sm font-medium capitalize transition ${
                              editingSection.settings.text_align === align
                                ? "bg-[#0A2647] text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Animation</label>
                      <select
                        value={editingSection.settings.animation}
                        onChange={(e) => setEditingSection((s) => s ? { ...s, settings: { ...s.settings, animation: e.target.value } } : s)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] outline-none"
                      >
                        <option value="none">None</option>
                        <option value="fade-in">Fade In</option>
                        <option value="slide-up">Slide Up</option>
                        <option value="slide-left">Slide Left</option>
                        <option value="zoom-in">Zoom In</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Device Visibility</label>
                      <div className="space-y-2">
                        {([
                          { key: "desktop_visible", label: "Desktop" },
                          { key: "tablet_visible", label: "Tablet" },
                          { key: "mobile_visible", label: "Mobile" },
                        ] as const).map((device) => (
                          <label key={device.key} className="flex items-center gap-3 cursor-pointer">
                            <button
                              type="button"
                              onClick={() => setEditingSection((s) => s ? { ...s, settings: { ...s.settings, [device.key]: !s.settings[device.key] } } : s)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                editingSection.settings[device.key] ? "bg-[#C9A227]" : "bg-gray-300"
                              }`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                editingSection.settings[device.key] ? "translate-x-[18px]" : "translate-x-[3px]"
                              }`} />
                            </button>
                            <span className="text-sm text-gray-700">{device.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveSectionSettings}
                      disabled={saving}
                      className="px-4 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section Picker Modal (mobile/quick add) */}
        {showSectionPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0A2647]">Add Section</h3>
                  <button onClick={() => setShowSectionPicker(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-4 overflow-auto flex-1">
                <div className="grid grid-cols-2 gap-2">
                  {SECTION_TYPES.map((st) => (
                    <button
                      key={st.type}
                      onClick={() => handleAddSection(st.type)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#C9A227] hover:bg-[#C9A227]/5 transition text-left"
                    >
                      <span className="text-xl">{st.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[#0A2647]">{st.name}</p>
                        <p className="text-xs text-gray-500">{st.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
