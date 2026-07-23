"use client";

import { useState, useEffect, useCallback } from "react";
import AgentLayout from "@/components/agent/AgentLayout";
import { apiGet, apiPost } from "@/lib/api";

interface Contact {
  id: number;
  name: string;
  email: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
}

export default function ComposeEmailPage() {
  const [toEmail, setToEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sending, setSending] = useState(false);
  const [improving, setImproving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await apiGet<any>("/email-templates");
        setTemplates(res.data || res.templates || []);
      } catch {
        setTemplates([]);
      }
    };
    loadTemplates();
  }, []);

  const searchContacts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await 
apiGet<any>(`/admin/contacts/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data || res.contacts || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchContacts(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchContacts]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => String(t.id) === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleImproveEmail = async () => {
    if (!body.trim()) return;
    setImproving(true);
    try {
      const res = await apiPost<any>("/ai/improve-email", { body, subject });
      const improved = res.data || res;
      if (improved.body) setBody(improved.body);
      if (improved.subject) setSubject(improved.subject);
    } catch {
      setFeedback({ type: "error", message: "Failed to improve email" });
    } finally {
      setImproving(false);
    }
  };

  const handleSend = async () => {
    if (!toEmail || !subject || !body) {
      setFeedback({ type: "error", message: "Please fill in all fields" });
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      await apiPost("/agent/emails/send", {
        to_email: toEmail,
        subject,
        body,
      });
      setFeedback({ type: "success", message: "Email sent successfully!" });
      setToEmail("");
      setSearchQuery("");
      setSubject("");
      setBody("");
      setSelectedTemplate("");
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({ type: "error", message: "Failed to send email. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <AgentLayout title="Compose Email">
      <div className="max-w-3xl mx-auto space-y-6">
        {feedback && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {feedback.message}
            <button onClick={() => setFeedback(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="email"
              value={searchQuery || toEmail}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setToEmail(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
              placeholder="Search contacts or enter email..."
            />
            {searching && (
              <div className="absolute right-3 top-9">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A2647]" />
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setToEmail(contact.email);
                      setSearchQuery(`${contact.name} <${contact.email}>`);
                      setSearchResults([]);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium text-gray-900">{contact.name}</span>
                    <span className="text-gray-500 ml-2">{contact.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
              placeholder="Email subject"
            />
          </div>

          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent"
              >
                <option value="">No template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Body</label>
              <button
                onClick={handleImproveEmail}
                disabled={improving || !body.trim()}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[#C9A227] text-white hover:bg-[#b89220] disabled:opacity-50 transition-colors"
              >
                {improving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5" />
                    Improving...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Improve This Email
                  </>
                )}
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent resize-y"
              placeholder="Write your email..."
            />
          </div>

          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={handleSend}
              disabled={sending || !toEmail || !subject || !body}
              className="px-6 py-2.5 bg-[#0A2647] text-white rounded-lg font-medium hover:bg-[#0d3260] disabled:opacity-50 transition-colors inline-flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
