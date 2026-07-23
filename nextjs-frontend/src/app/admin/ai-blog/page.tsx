"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function AiBlogPage() {
  const { success, notifyError } = useToast();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Buying Guide");
  const [tone, setTone] = useState("Professional");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedExcerpt, setGeneratedExcerpt] = useState("");
  const [history, setHistory] = useState<{id: number; topic: string; category: string; tone: string; status: string; date: string}[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setGenerating(true);
    setSaved(false);
    try {
      const data = await apiPost<{ response?: string }>("/ai/chat", {
        message: `Write a professional real estate blog post about "${topic}" in the ${category} category. Use a ${tone.toLowerCase()} tone. Include an engaging title, a comprehensive body (at least 500 words with HTML formatting using <p>, <h2>, <h3>, <ul>, <li> tags), and a meta description. Return the response in this exact JSON format: {"title": "...", "content": "...", "excerpt": "..."}. Never include phone numbers — contact only via info@domesticrealestate.us.`,
      });

      const responseText = data?.response || String(data || '');
      let parsed;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        parsed = null;
      }

      if (parsed && parsed.title && parsed.content) {
        setGeneratedTitle(parsed.title);
        setGeneratedContent(parsed.content);
        setGeneratedExcerpt(parsed.excerpt || topic);
      } else {
        setGeneratedTitle(topic);
        setGeneratedContent(`<p>${responseText.replace(/\n/g, "</p><p>")}</p>`);
        setGeneratedExcerpt(`A comprehensive guide to ${topic.toLowerCase()} for homeowners and buyers.`);
      }
      setGenerated(true);
      setHistory(prev => [{ id: Date.now(), topic, category, tone, status: "Draft", date: new Date().toLocaleDateString() }, ...prev]);
      success("AI draft ready to review.", "AI Blog");
    } catch (err) {
      notifyError(err, "AI Blog is not working because the AI provider is not connected or failed.");
      setGenerated(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToBlog = async () => {
    setSaving(true);
    try {
      await apiPost("/admin/blog/posts", {
        title: generatedTitle,
        content: generatedContent,
        excerpt: generatedExcerpt,
        status: "draft",
        seo_title: generatedTitle,
        meta_description: generatedExcerpt,
      });
      setSaved(true);
      success("Blog draft saved.", "AI Blog");
    } catch (err) {
      notifyError(err, "AI Blog is not working because the draft could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="AI Blog Generator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Generate Blog Post</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 10 Ways to Increase Your Home's Value"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option>Buying Guide</option>
                    <option>Selling Tips</option>
                    <option>Market Update</option>
                    <option>Investment</option>
                    <option>Finance</option>
                    <option>Location Guide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227]"
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Engaging</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!topic || generating}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0A2647] text-white rounded-lg font-semibold hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </button>
            </div>

            {/* Generated Content Preview */}
            {generated && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-md font-semibold text-[#0A2647] mb-3">Generated Content Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                  <h4 className="text-xl font-bold text-[#0A2647] mb-3">{generatedTitle}</h4>
                  <div className="prose prose-sm max-w-none text-gray-700 space-y-3" dangerouslySetInnerHTML={{ __html: generatedContent }} />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveToBlog}
                    disabled={saving || saved}
                    className="px-4 py-2 bg-[#C9A227] text-[#0A2647] rounded-lg font-semibold hover:bg-[#b8911f] disabled:opacity-50"
                  >
                    {saved ? "Saved to Blog" : saving ? "Saving..." : "Save to Blog"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Generation History</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.topic}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.category} · {item.tone}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      item.status === "Published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
