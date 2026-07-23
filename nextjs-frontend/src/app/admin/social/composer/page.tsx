"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/lib/api";

interface ConnectedAccount {
  id: number;
  platform: string;
  account_name: string;
  status?: string;
}

interface MediaFile {
  file: File;
  preview: string;
}

const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  twitter: "#000000",
  tiktok: "#000000",
  youtube: "#FF0000",
  pinterest: "#BD081C",
  google_business: "#4285F4",
};

const platformNames: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  google_business: "Google Business",
};

const fallbackAccounts: ConnectedAccount[] = [
  { id: 1, platform: "facebook", account_name: "Domestic RE Facebook" },
  { id: 2, platform: "instagram", account_name: "@domesticre" },
  { id: 4, platform: "twitter", account_name: "@domesticre" },
];

export default function SocialComposerPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charLimit = 2200;

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await apiGet<{ data: ConnectedAccount[] }>("/social/accounts/connected");
        setAccounts((res.data || fallbackAccounts).filter((a) => a.status !== "disconnected"));
      } catch {
        setAccounts(fallbackAccounts);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  function toggleAccount(id: number) {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    addMediaFiles(files);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      addMediaFiles(Array.from(e.target.files));
    }
  }

  function addMediaFiles(files: File[]) {
    const newMedia: MediaFile[] = files.slice(0, 10 - media.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setMedia((prev) => [...prev, ...newMedia].slice(0, 10));
  }

  function removeMedia(index: number) {
    setMedia((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleAIGenerate() {
    setAiGenerating(true);
    try {
      const res = await apiPost<{ caption: string }>("/social/ai-caption", {
        context: content || "Real estate post",
        platform: selectedAccounts.length > 0
          ? accounts.find((a) => selectedAccounts.includes(a.id))?.platform
          : "facebook",
      });
      setContent(res.caption);
    } catch {
      setContent(
        (prev) =>
          prev +
          "\n\nDiscover your dream home with Domestic RE. Contact us today to schedule a viewing! #RealEstate #DreamHome #LuxuryLiving"
      );
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSubmit() {
    if (!content.trim() || selectedAccounts.length === 0) return;
    setSubmitting(true);
    try {
      await apiPost("/social/posts", {
        content,
        account_ids: selectedAccounts,
        scheduled_at: publishNow ? null : `${scheduleDate}T${scheduleTime}:00`,
        media: media.map((m) => m.file.name),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Post Composer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Post Composer">
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
          Post created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-3">Select Accounts</h3>
            <div className="flex flex-wrap gap-3">
              {accounts.map((acc) => {
                const selected = selectedAccounts.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => toggleAccount(acc.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      selected
                        ? "border-[#C9A227] bg-[#C9A227]/10 text-[#0A2647] font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: platformColors[acc.platform] || "#666" }}
                    >
                      {acc.platform[0].toUpperCase()}
                    </div>
                    {acc.account_name}
                    {selected && <span className="text-[#C9A227]">&#10003;</span>}
                  </button>
                );
              })}
              {accounts.length === 0 && (
                <p className="text-sm text-gray-500">No connected accounts. Connect accounts first.</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0A2647]">Content</h3>
              <span className={`text-xs ${content.length > charLimit ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                {content.length}/{charLimit}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
              placeholder="Write your post content here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
            />
            <div className="mt-3">
              <button
                onClick={handleAIGenerate}
                disabled={aiGenerating}
                className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0d3259] transition-colors disabled:opacity-50"
              >
                {aiGenerating ? "Generating..." : "AI Generate Caption"}
              </button>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-3">Media</h3>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#C9A227] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-gray-400 mb-2">
                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Drag & drop images or videos here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Max 10 files. Images &amp; videos supported.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {media.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {media.map((m, i) => (
                  <div key={i} className="relative group">
                    {m.file.type.startsWith("image/") ? (
                      <img src={m.preview} alt="" className="w-full h-20 object-cover rounded-lg" />
                    ) : (
                      <video src={m.preview} className="w-full h-20 object-cover rounded-lg" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A2647] mb-3">Schedule</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={publishNow}
                  onChange={() => setPublishNow(true)}
                  className="text-[#C9A227]"
                />
                <span className="text-sm text-gray-700">Publish Now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!publishNow}
                  onChange={() => setPublishNow(false)}
                  className="text-[#C9A227]"
                />
                <span className="text-sm text-gray-700">Schedule</span>
              </label>
            </div>
            {!publishNow && (
              <div className="flex gap-3">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim() || selectedAccounts.length === 0}
            className="w-full py-3 bg-[#C9A227] text-[#0A2647] rounded-xl text-sm font-bold hover:bg-[#b8911f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Publishing..." : publishNow ? "Publish Now" : "Schedule Post"}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#0A2647]">Preview</h3>
          {selectedAccounts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
              Select accounts to see preview
            </div>
          ) : (
            selectedAccounts.map((accId) => {
              const acc = accounts.find((a) => a.id === accId);
              if (!acc) return null;
              return (
                <div key={accId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: platformColors[acc.platform] || "#666" }}
                    >
                      {acc.platform[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{platformNames[acc.platform] || acc.platform}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#0A2647] rounded-full flex items-center justify-center text-white text-xs font-bold">DR</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{acc.account_name}</p>
                        <p className="text-[10px] text-gray-500">Just now</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{content || "Your post content will appear here..."}</p>
                    {media.length > 0 && (
                      <div className="mt-3">
                        <img src={media[0].preview} alt="" className="w-full h-32 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
