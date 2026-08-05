"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface TemplateBlock {
  id: string;
  type: "header" | "text" | "image" | "button" | "divider" | "footer";
  content: string;
  styles?: Record<string, string>;
}

interface EmailTemplate {
  id: number;
  name: string;
  slug: string;
  type: string;
  subject: string;
  html_body: string;
  text_body?: string | null;
  variables?: { blocks?: TemplateBlock[] } | TemplateBlock[] | null;
  is_active: boolean;
}

const defaultBlocks: TemplateBlock[] = [
  { id: "1", type: "header", content: "Welcome to Domestic Real Estate" },
  { id: "2", type: "text", content: "Hi {{first_name}},\n\nThank you for your interest in finding your dream home. We have some amazing properties that match your criteria." },
  { id: "3", type: "button", content: "View Properties|https://domesticrealestate.us/buyers" },
  { id: "4", type: "divider", content: "" },
  { id: "5", type: "footer", content: "Domestic Real Estate | info@domesticrealestate.us\nYour Key to Home" },
];

const BLOCK_TYPES = [
  { type: "header", label: "Header", icon: "H" },
  { type: "text", label: "Text", icon: "T" },
  { type: "image", label: "Image", icon: "🖼" },
  { type: "button", label: "Button", icon: "🔘" },
  { type: "divider", label: "Divider", icon: "—" },
  { type: "footer", label: "Footer", icon: "F" },
] as const;

const VARIABLES = [
  "{{first_name}}", "{{last_name}}", "{{email}}", "{{phone}}",
  "{{property_title}}", "{{property_address}}", "{{property_price}}",
  "{{agent_name}}", "{{agent_email}}", "{{company_name}}", "{{current_date}}",
];

function blocksFromTemplate(template?: EmailTemplate | null): TemplateBlock[] | null {
  const variables = template?.variables;
  if (variables && !Array.isArray(variables) && Array.isArray(variables.blocks) && variables.blocks.length > 0) {
    return variables.blocks;
  }
  return null;
}

export default function EmailEditorContent() {
  const { success, notifyError } = useToast();
  const [templateName, setTemplateName] = useState("New Template");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<TemplateBlock[]>(defaultBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const blockIdRef = useRef(100);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await apiGet<EmailTemplate[]>("/email-templates");
      setSavedTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      notifyError(err, "Email templates could not be loaded.");
      setSavedTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, [notifyError]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const addBlock = (type: TemplateBlock["type"]) => {
    const newBlock: TemplateBlock = {
      id: String(blockIdRef.current++),
      type,
      content: type === "header" ? "New Header" : type === "text" ? "Enter your text here..." : type === "button" ? "Click Here|https://example.com" : type === "footer" ? "Company Name | info@company.com" : "",
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const insertVariable = (variable: string) => {
    if (selectedBlock) {
      const block = blocks.find(b => b.id === selectedBlock);
      if (block) {
        updateBlock(selectedBlock, block.content + " " + variable);
      }
    }
  };

  const resetEditor = () => {
    setEditingId(null);
    setTemplateName("New Template");
    setSubject("");
    setBlocks(defaultBlocks);
    setSelectedBlock(null);
  };

  const loadTemplate = (template: EmailTemplate) => {
    const stored = blocksFromTemplate(template);
    setEditingId(template.id);
    setTemplateName(template.name);
    setSubject(template.subject);
    setBlocks(stored && stored.length > 0 ? stored : defaultBlocks);
    setSelectedBlock(null);
  };

  const generateHtml = (): string => {
    let html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
.header { background: #0A2647; color: white; padding: 30px; text-align: center; font-size: 24px; font-weight: bold; }
.text { padding: 20px 30px; color: #333; line-height: 1.6; white-space: pre-wrap; }
.image { padding: 0; text-align: center; }
.image img { max-width: 100%; height: auto; }
.button { padding: 20px 30px; text-align: center; }
.button a { display: inline-block; background: #C9A227; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
.divider { padding: 10px 30px; }
.divider hr { border: none; border-top: 1px solid #eee; }
.footer { padding: 20px 30px; background: #f9f9f9; text-align: center; color: #888; font-size: 12px; white-space: pre-wrap; }
</style></head><body><div class="container">`;

    blocks.forEach(block => {
      switch (block.type) {
        case "header":
          html += `<div class="header">${block.content}</div>`;
          break;
        case "text":
          html += `<div class="text">${block.content.replace(/\n/g, "<br>")}</div>`;
          break;
        case "image":
          html += `<div class="image"><img src="${block.content || "https://via.placeholder.com/540x200"}" alt="Email image"></div>`;
          break;
        case "button": {
          const [label, url] = block.content.split("|");
          html += `<div class="button"><a href="${url || "#"}">${label || "Click Here"}</a></div>`;
          break;
        }
        case "divider":
          html += `<div class="divider"><hr></div>`;
          break;
        case "footer":
          html += `<div class="footer">${block.content.replace(/\n/g, "<br>")}</div>`;
          break;
      }
    });

    html += `</div></body></html>`;
    return html;
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      notifyError(new Error("Template name is required."));
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: templateName.trim(),
        type: "marketing",
        subject,
        html_body: generateHtml(),
        text_body: "",
        is_active: true,
        variables: { blocks },
      };
      if (editingId) {
        await apiPut(`/email-templates/${editingId}`, payload);
        success("Email template updated.", "Email Builder");
      } else {
        const created = await apiPost<{ data?: EmailTemplate }>("/email-templates", payload);
        if (created?.data?.id) setEditingId(created.data.id);
        success("Email template saved.", "Email Builder");
      }
      await fetchTemplates();
    } catch (err) {
      notifyError(err, "Email template could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const selectedBlockData = blocks.find(b => b.id === selectedBlock);

  return (
    <AdminLayout title="Email Template Editor">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full text-lg font-semibold text-gray-900 border-none focus:ring-0 p-0 mb-2"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line..."
              className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Block</h3>
            <div className="grid grid-cols-3 gap-2">
              {BLOCK_TYPES.map(bt => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-[#C9A227] hover:bg-[#C9A227]/5 transition-colors text-xs"
                >
                  <span className="text-lg">{bt.icon}</span>
                  <span>{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Variables</h3>
            <div className="flex flex-wrap gap-1">
              {VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-[#C9A227] hover:text-white transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Click a block first, then click a variable to insert</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Blocks ({blocks.length})</h3>
            <div className="space-y-2">
              {blocks.map((block, i) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlock(block.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                    selectedBlock === block.id ? "border-[#C9A227] bg-[#C9A227]/5" : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                    {block.type}: {block.content.substring(0, 30) || "Empty"}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); moveBlock(i, "up"); }} className="text-gray-400 hover:text-gray-600 text-xs">↑</button>
                  <button onClick={(e) => { e.stopPropagation(); moveBlock(i, "down"); }} className="text-gray-400 hover:text-gray-600 text-xs">↓</button>
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${previewMode === "desktop" ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-600"}`}
                >Desktop</button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${previewMode === "mobile" ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-600"}`}
                >Mobile</button>
              </div>
            </div>
            <div className={`mx-auto bg-gray-100 rounded-lg p-2 ${previewMode === "mobile" ? "max-w-[375px]" : "max-w-full"}`}>
              <div
                ref={previewRef}
                className="bg-white rounded overflow-hidden"
                dangerouslySetInnerHTML={{ __html: generateHtml() }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {selectedBlockData && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Edit Block: {selectedBlockData.type}</h3>
              <textarea
                value={selectedBlockData.content}
                onChange={(e) => updateBlock(selectedBlockData.id, e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] resize-none"
                placeholder="Block content..."
              />
              {selectedBlockData.type === "button" && (
                <p className="text-xs text-gray-400 mt-1">Format: Label|URL (e.g., Click Here|https://example.com)</p>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => void saveTemplate()}
                disabled={saving}
                className="w-full px-4 py-2 bg-[#0A2647] text-white rounded-lg text-sm font-medium hover:bg-[#0c2f57] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update Template" : "Save Template"}
              </button>
              <button
                onClick={resetEditor}
                className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                New Template
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateHtml());
                }}
                className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Copy HTML
              </button>
              <button
                onClick={() => {
                  const html = generateHtml();
                  const blob = new Blob([html], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${templateName.replace(/\s+/g, "_")}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full px-4 py-2 border border-[#C9A227] text-[#C9A227] rounded-lg text-sm hover:bg-[#C9A227]/5 transition-colors"
              >
                Export HTML
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Templates</h3>
            {loadingTemplates ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : savedTemplates.length === 0 ? (
              <p className="text-sm text-gray-400">No templates saved yet.</p>
            ) : (
              <div className="space-y-2">
                {savedTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => loadTemplate(t)}
                    className="flex items-center justify-between p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.subject || "No subject"}</p>
                    </div>
                    <button className="text-xs text-[#C9A227] hover:underline">Load</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">HTML Output</h3>
            <pre className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {generateHtml().substring(0, 500)}...
            </pre>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
