'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface Conversation {
  id: number;
  session_id: string;
  user: string;
  email: string | null;
  phone: string | null;
  agent_type: string;
  status: 'active' | 'completed' | 'archived' | 'waiting' | 'escalated';
  last_message: string;
  duration: string;
  unread: number;
  qualification_score: number;
  notes: string | null;
  assigned_agent_id: number | null;
  assigned_agent: string | null;
  lead_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  sender: 'user' | 'agent' | 'admin';
  sender_name: string;
  content: string;
  timestamp: string;
  avatar: string;
}

interface ConversationDetail {
  id: number;
  session_id: string;
  user: string;
  email: string | null;
  phone: string | null;
  ai_type: string;
  notes: string | null;
  status: 'active' | 'completed' | 'archived' | 'waiting' | 'escalated';
  qualification_score: number;
  assigned_agent_id: number | null;
  lead_id: number | null;
  user_context: { current_page: string; lead_status: string };
  messages: Message[];
}

interface ChatAnalytics {
  total_conversations: number;
  avg_response_time: string;
  lead_capture_rate: number;
  escalation_rate: number;
}

interface CannedResponse {
  id: number;
  trigger: string;
  response: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  source: string;
}

interface KBDocument {
  id: number;
  name: string;
  type: string;
  size: string;
  uploaded: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  waiting: { label: 'Waiting', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', dot: 'bg-amber-500' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
};

export default function AIChatPage() {
  const { notifyError, success } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analytics, setAnalytics] = useState<ChatAnalytics>({
    total_conversations: 0,
    avg_response_time: '12s',
    lead_capture_rate: 0,
    escalation_rate: 0
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'training' | 'knowledge'>('live');
  
  // Selected conversation state
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [detailNotes, setDetailNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Training & KB states (mock defaults)
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([
    { id: 1, trigger: '/greeting', response: 'Welcome to Domestic Real Estate! How can I help you find your dream home today?' },
    { id: 2, trigger: '/hours', response: 'Our digital support team is available 24/7. Contact us at info@domesticrealestate.us.' },
    { id: 3, trigger: '/viewing', response: "Let's organize a site visit. Can you please confirm which listings you'd like to see?" }
  ]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    { id: 1, question: "What is your support email?", answer: "Our official email address is info@domesticrealestate.us.", source: "Chat logs" }
  ]);
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([
    { id: 1, name: "Domestic_Properties_General_Guide.pdf", type: "pdf", size: "2.5 MB", uploaded: "2026-07-16" }
  ]);

  const [newCannedTrigger, setNewCannedTrigger] = useState('');
  const [newCannedResponse, setNewCannedResponse] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  async function fetchData() {
    try {
      setLoading(true);
      const [convRes, analyticsRes, usersRes] = await Promise.allSettled([
        apiGet<{ data: Conversation[] }>('/admin/ai-chat/conversations'),
        apiGet<ChatAnalytics>('/admin/ai-chat/analytics'),
        apiGet<any>('/admin/users')
      ]);

      if (convRes.status === 'fulfilled') {
        setConversations(convRes.value.data || []);
      }
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value || {
          total_conversations: 0,
          avg_response_time: '12s',
          lead_capture_rate: 0,
          escalation_rate: 0
        });
      }
      if (usersRes.status === 'fulfilled') {
        const usersArray = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.data || []);
        setAgents(usersArray.filter((u: any) => u.role === 'agent' || u.role === 'admin' || u.role === 'super_admin'));
      }
    } catch (e) {
      notifyError(e, 'Failed to fetch AI chat data.');
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(conv: Conversation) {
    try {
      const res = await apiGet<{ data: ConversationDetail }>(`/admin/ai-chat/conversations/${conv.id}`);
      const detail = res.data;
      setSelectedConversation(detail);
      setDetailNotes(detail.notes || '');
    } catch (e) {
      notifyError(e, 'Error opening conversation detail.');
    }
  }

  async function handleSendAdminMessage() {
    if (!selectedConversation || !adminMessage.trim()) return;
    try {
      setSendingMessage(true);
      const reply = await apiPost<any>(`/admin/ai-chat/conversations/${selectedConversation.id}/messages`, {
        content: adminMessage,
      });
      
      const newMsg: Message = reply.data || {
        id: Date.now(),
        sender: 'admin',
        sender_name: 'Admin',
        content: adminMessage,
        timestamp: new Date().toISOString(),
        avatar: '👨‍💼'
      };

      setSelectedConversation((c) => c ? { ...c, messages: [...c.messages, newMsg] } : c);
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, last_message: adminMessage } : c));
      setAdminMessage('');
    } catch (e) {
      notifyError(e, 'Failed to deliver message.');
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleTakeOver(convId: number) {
    try {
      await apiPut(`/admin/ai-chat/conversations/${convId}/status`, { status: 'active' });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, status: 'active' } : c));
      
      const res = await apiGet<{ data: ConversationDetail }>(`/admin/ai-chat/conversations/${convId}`);
      setSelectedConversation(res.data);
      setDetailNotes(res.data.notes || '');
      success('You have taken over this conversation!');
    } catch (e) {
      notifyError(e, 'Failed to register takeover status.');
    }
  }

  async function handleStatusChange(convId: number, status: 'active' | 'completed' | 'archived' | 'waiting' | 'escalated') {
    try {
      await apiPut(`/admin/ai-chat/conversations/${convId}/status`, { status });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, status } : c));
      if (selectedConversation && selectedConversation.id === convId) {
        setSelectedConversation(prev => prev ? { ...prev, status } : null);
      }
      success(`Status updated to ${status}.`);
    } catch (e) {
      notifyError(e, 'Failed to update conversation status.');
    }
  }

  async function handleAssignAgent(convId: number, agentId: string) {
    const val = agentId ? parseInt(agentId) : null;
    try {
      await apiPut(`/admin/ai-chat/conversations/${convId}/assign`, { assigned_agent_id: val });
      const matched = agents.find(a => a.id === val);
      setConversations(prev => prev.map(c => c.id === convId ? { 
        ...c, 
        assigned_agent_id: val, 
        assigned_agent: matched ? matched.name : null 
      } : c));
      if (selectedConversation && selectedConversation.id === convId) {
        setSelectedConversation(prev => prev ? { ...prev, assigned_agent_id: val } : null);
      }
      success('Assignee updated.');
    } catch (e) {
      notifyError(e, 'Failed to update assigned agent.');
    }
  }

  async function handleSaveNotes() {
    if (!selectedConversation) return;
    try {
      setSavingNotes(true);
      await apiPut(`/admin/ai-chat/conversations/${selectedConversation.id}/notes`, { notes: detailNotes });
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, notes: detailNotes } : c));
      setSelectedConversation(c => c ? { ...c, notes: detailNotes } : null);
      success('Conversation notes updated.');
    } catch (e) {
      notifyError(e, 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDeleteConversation(convId: number) {
    if (!confirm('Are you sure you want to permanently delete this AI conversation logs? This is irreversible.')) return;
    try {
      await apiDelete(`/admin/ai-chat/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConversation && selectedConversation.id === convId) {
        setSelectedConversation(null);
      }
      success('Conversation logs deleted.');
    } catch (e) {
      notifyError(e, 'Failed to delete conversation.');
    }
  }

  function handleAddCanned() {
    if (!newCannedTrigger || !newCannedResponse) return;
    setCannedResponses((prev) => [...prev, { id: Date.now(), trigger: newCannedTrigger, response: newCannedResponse }]);
    setNewCannedTrigger('');
    setNewCannedResponse('');
    success('Canned response added.');
  }

  function handleAddFAQ() {
    if (!newFaqQ || !newFaqA) return;
    setFaqItems((prev) => [...prev, { id: Date.now(), question: newFaqQ, answer: newFaqA, source: 'Manual' }]);
    setNewFaqQ('');
    setNewFaqA('');
    success('Training FAQ added.');
  }

  function handleUpload() {
    setUploading(true);
    setTimeout(() => {
      setKbDocs((prev) => [...prev, {
        id: Date.now(),
        name: 'Manual_FAQ_Addition.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploaded: new Date().toISOString().split('T')[0],
      }]);
      setUploading(false);
      success('Document added to Knowledge Base!');
    }, 1000);
  }

  // Filter conversations in state
  const filteredConversations = conversations.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      c.user.toLowerCase().includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower)) ||
      c.session_id.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout title="AI Chat Admin">
      <div className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Conversations', value: analytics.total_conversations.toString(), icon: '💬', bg: 'bg-[#0A2647]/5 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
            { label: 'Avg AI Response Time', value: analytics.avg_response_time, icon: '⚡', bg: 'bg-green-500/5', border: 'border-green-500/10' },
            { label: 'Lead Capture Rate', value: `${analytics.lead_capture_rate}%`, icon: '🎯', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10' },
            { label: 'Escalation Rate', value: `${analytics.escalation_rate}%`, icon: '🔺', bg: 'bg-red-500/5', border: 'border-red-500/10' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-3xl font-heading font-bold text-[#0A2647] dark:text-[#C9A227]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit border border-slate-200 dark:border-slate-700">
          {([
            { key: 'live' as const, label: 'Live Conversations', icon: '📡' },
            { key: 'training' as const, label: 'Training Playbooks', icon: '🎓' },
            { key: 'knowledge' as const, label: 'Knowledge Base', icon: '📚' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-[#0A2647] dark:text-gold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Conversations Tab */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'waiting', 'active', 'completed', 'escalated'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                      filterStatus === status
                        ? 'bg-[#0A2647] hover:bg-[#0A2647]/90 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all' ? 'All' : (statusConfig[status]?.label || status)}
                    {status !== 'all' && (
                      <span className="ml-1">({conversations.filter((c) => c.status === status).length})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, email, session..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-850 rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
                <span className="mt-3 text-xs font-semibold text-slate-500">Loading conversation database records...</span>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {filteredConversations.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-1">No Conversations Found</h3>
                    <p className="text-slate-500 text-sm">Either no clients have started AI chats, or search filters yield empty results.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#0A2647] text-white">
                        <tr>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Client Username</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">AI Assistant Type</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Qual. Score</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Assigned Specialist</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Duration</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredConversations.map((conv) => {
                          const sc = statusConfig[conv.status] || statusConfig.waiting;
                          return (
                            <tr key={conv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-heading font-bold text-[#0A2647] dark:text-[#C9A227]">{conv.user}</div>
                                <div className="text-slate-400 text-[10px] break-all">{conv.email || conv.session_id}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md bg-gold/10 text-gold border border-gold/20`}>
                                  {conv.agent_type}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${conv.qualification_score > 75 ? 'bg-green-500' : conv.qualification_score > 40 ? 'bg-amber-500' : 'bg-slate-400'}`} 
                                      style={{ width: `${conv.qualification_score}%` }} 
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{conv.qualification_score}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${sc.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                  {sc.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <select
                                  value={conv.assigned_agent_id || ''}
                                  onChange={(e) => handleAssignAgent(conv.id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                                >
                                  <option value="">Unassigned</option>
                                  {agents.map((ag) => (
                                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-5 py-4 text-xs font-semibold text-slate-500">{conv.duration}</td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-3 text-xs">
                                  <button
                                    onClick={() => openConversation(conv)}
                                    className="text-gold font-bold hover:underline"
                                  >
                                    View
                                  </button>
                                  {conv.status !== 'active' && conv.status !== 'completed' && (
                                    <button
                                      onClick={() => handleTakeOver(conv.id)}
                                      className="text-[#0A2647] dark:text-[#8B1E3F] font-bold hover:underline"
                                    >
                                      Take Over
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteConversation(conv.id)}
                                    className="text-red-500 hover:text-red-700 font-bold hover:underline"
                                    title="Delete chat log"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FAQ Training */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-[#0A2647] dark:text-white">Autoscraped FAQ Base</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    placeholder="Provide user question..."
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-gold outline-none"
                  />
                  <button
                    onClick={handleAddFAQ}
                    disabled={!newFaqQ || !newFaqA}
                    className="px-4 py-2 bg-gold hover:bg-gold-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    + Add Question
                  </button>
                </div>
                <textarea
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  placeholder="Provide ideal dynamic answer..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-gold outline-none resize-none"
                />
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {faqItems.map((faq) => (
                    <div key={faq.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-bold text-[#0A2647] dark:text-[#C9A227]">{faq.question}</p>
                      <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">{faq.answer}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        <span className="text-slate-400 font-medium">Source: {faq.source}</span>
                        <div className="ml-auto flex gap-2">
                          <button className="text-green-600 font-bold hover:underline">✓ Verify</button>
                          <button 
                            onClick={() => setFaqItems(prev => prev.filter(f => f.id !== faq.id))}
                            className="text-red-500 font-bold hover:underline"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Canned Responses */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-[#0A2647] dark:text-white">Admin Canned Responses</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCannedTrigger}
                    onChange={(e) => setNewCannedTrigger(e.target.value)}
                    placeholder="Macro trigger (e.g. /greeting)"
                    className="w-40 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 text-slate-855 focus:ring-2 focus:ring-gold outline-none"
                  />
                  <input
                    type="text"
                    value={newCannedResponse}
                    onChange={(e) => setNewCannedResponse(e.target.value)}
                    placeholder="Type shortcut text..."
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 focus:ring-2 focus:ring-gold outline-none"
                  />
                  <button
                    onClick={handleAddCanned}
                    disabled={!newCannedTrigger || !newCannedResponse}
                    className="px-4 py-2 bg-gold hover:bg-gold-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    + Add
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {cannedResponses.map((cr) => (
                    <div key={cr.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex justify-between gap-3">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 bg-[#0A2647]/10 dark:bg-slate-750 text-[#0A2647] dark:text-[#C9A227] text-[10px] font-mono font-bold rounded">
                          {cr.trigger}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{cr.response}</p>
                      </div>
                      <button
                        onClick={() => setCannedResponses((prev) => prev.filter((c) => c.id !== cr.id))}
                        className="text-red-400 hover:text-red-650 text-xs font-bold self-start mt-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KB Documents Tab */}
        {activeTab === 'knowledge' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-[#0A2647] dark:text-white">Knowledge Base Documents</h3>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-gold text-white rounded-lg text-xs font-semibold hover:shadow-gold transition disabled:opacity-50"
              >
                {uploading ? 'Processing doc...' : '+ Upload Document'}
              </button>
            </div>
            <div className="p-6">
              <div 
                onClick={handleUpload}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-gold dark:hover:border-gold rounded-xl p-10 text-center mb-6 transition-colors cursor-pointer"
              >
                <div className="text-4xl mb-3">📤</div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload doc files or drag assets</p>
                <p className="text-xs text-slate-400 mt-1">PDF, TXT, DOCX, or CSV datasets up to 10MB</p>
              </div>
              <div className="space-y-2">
                {kbDocs.map((doc) => {
                  return (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-2xl">📕</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0A2647] dark:text-white truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{doc.size} • Uploaded {doc.uploaded}</p>
                      </div>
                      <button 
                        onClick={() => setKbDocs((prev) => prev.filter(k => k.id !== doc.id))}
                        className="text-red-400 hover:text-red-650 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Window Drawer overlay */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
              
              {/* Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-heading font-bold text-[#0A2647] dark:text-white">{selectedConversation.user}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-850 dark:text-slate-300 font-semibold">{selectedConversation.session_id}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-xs text-slate-400 font-bold">Referer: <span className="text-slate-600 dark:text-slate-300">{selectedConversation.user_context?.current_page || '/'}</span></span>
                    <span className="text-slate-350">•</span>
                    <span className="text-xs text-slate-400 font-bold">CRM Status: <span className="text-slate-600 dark:text-slate-300">{selectedConversation.user_context?.lead_status || 'none'}</span></span>
                    {selectedConversation.lead_id && (
                      <>
                        <span className="text-slate-355">•</span>
                        <a 
                          href={`/admin/leads?id=${selectedConversation.lead_id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                        >
                          CRM Lead Profile ↗
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedConversation(null)} 
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Body split view */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Chat feed left */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/20 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedConversation.messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3.5 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-slate-700/50 flex items-center justify-center text-sm flex-shrink-0">
                          {msg.avatar}
                        </div>
                        <div className={`max-w-[75%] ${msg.sender === 'admin' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1 justify-start">
                            <span className="text-[10px] font-bold text-slate-500">{msg.sender_name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className={`px-4 py-2.5 rounded-xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-750 shadow-sm rounded-tl-none'
                              : msg.sender === 'admin'
                                ? 'bg-[#0A2647] text-white rounded-tr-none'
                                : 'bg-[#C9A227]/10 dark:bg-[#C9A227]/5 text-[#0A2647] dark:text-white border border-[#C9A227]/20 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message submission bar */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                      placeholder="Type agent takeover message..."
                      className="flex-1 px-4 py-2.5 border border-slate-350 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <button
                      onClick={handleSendAdminMessage}
                      disabled={!adminMessage.trim() || sendingMessage}
                      className="px-6 py-2.5 bg-gold hover:bg-gold-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                    >
                      {sendingMessage ? 'Delivering...' : 'Send'}
                    </button>
                  </div>
                </div>

                {/* Metadata Sidebar right */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-850">
                  {/* Qualification Block */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lead Qualification</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500 font-semibold">Completeness</span>
                        <span className="text-sm font-black text-[#0A2647] dark:text-[#C9A227]">{selectedConversation.qualification_score}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold" 
                          style={{ width: `${selectedConversation.qualification_score}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Form */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Participant Actions</h4>
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Update Status</label>
                        <select
                          value={selectedConversation.status}
                          onChange={(e) => handleStatusChange(selectedConversation.id, e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="waiting">Waiting</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                          <option value="escalated">Escalated</option>
                        </select>
                      </div>

                      {/* Assignment */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Assign Agent / Realtor</label>
                        <select
                          value={selectedConversation.assigned_agent_id || ''}
                          onChange={(e) => handleAssignAgent(selectedConversation.id, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>{ag.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Identity Contact</h4>
                    <div className="text-xs space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-450 block font-semibold">Email Address</span>
                        <span className="font-bold text-slate-800 dark:text-white break-all">{selectedConversation.email || 'Not captured yet'}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block font-semibold">Phone Number</span>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedConversation.phone || 'Not captured yet'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Notes</h4>
                    <div className="space-y-2">
                      <textarea
                        value={detailNotes}
                        onChange={(e) => setDetailNotes(e.target.value)}
                        placeholder="Write internal staff follow-up notes..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-350 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                      />
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="w-full bg-[#0A2647] hover:bg-[#0A2647]/90 text-white font-bold py-2 rounded-lg text-xs transition"
                      >
                        {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
