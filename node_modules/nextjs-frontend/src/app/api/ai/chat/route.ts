import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '@/lib/api';

const LARAVEL_API = API_BASE;

/** Keyword-based smart fallback (no AI key required) */
function getSmartFallback(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('[lead qualified via chatbot]')) {
    return 'Lead captured. Our team will follow up shortly.';
  }
  if (/\b(buy|buying|purchase|home|house|property|listing)\b/.test(lower)) {
    return "Great choice! We have hundreds of properties across the US and Canada. Could you tell me your budget range, preferred location, and how many bedrooms you need?";
  }
  if (/\b(sell|selling|list|listing agent)\b/.test(lower)) {
    return "Selling your property? We offer free market valuations, professional photography, and MLS listings. Would you like to start with a free home valuation?";
  }
  if (/\b(invest|investor|investment|roi|rental|rent)\b/.test(lower)) {
    return "Real estate is one of the best investment vehicles. Whether you're looking for rental income or long-term appreciation, share your budget and target market and I'll get started.";
  }
  if (/\b(mortgage|loan|finance|financing|pre.?approv)\b/.test(lower)) {
    return "We work with multiple lenders to find the best rates. Would you like to connect with a mortgage specialist?";
  }
  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(lower)) {
    return "Hello! 👋 Welcome to Domestic Real Estate. I'm here to help you buy, sell, or invest in properties across the US and Canada. What can I help you with today?";
  }
  if (/\b(thank|thanks|appreciate)\b/.test(lower)) {
    return "You're welcome! Reach out anytime — we're always here to help.";
  }

  return "Thanks for reaching out! Our Domestic Real Estate team is ready to help — whether buying, selling, or investing. Share what you need and we'll follow up shortly.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      message,
      name,
      email,
      type,
      property_type,
      bedrooms,
      bathrooms,
      location,
      budget_min,
      budget_max,
      financing,
      pre_approved,
      credit_score,
      timeline,
      realtor_status,
      contact_time,
      consent_given,
      history,
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // ── Forward to Laravel API ──────────────────────────────────────────────
    try {
      const laravelRes = await fetch(`${LARAVEL_API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          message,
          name,
          email,
          type,
          property_type,
          bedrooms,
          bathrooms,
          location,
          budget_min,
          budget_max,
          financing,
          pre_approved,
          credit_score,
          timeline,
          realtor_status,
          contact_time,
          consent_given,
          history: history ?? [],
        }),
        signal: AbortSignal.timeout(12_000),
      });

      if (laravelRes.ok) {
        const data = await laravelRes.json();
        return NextResponse.json({
          response: data.response ?? getSmartFallback(message),
          lead_captured: data.lead_captured ?? false,
          lead_id: data.lead_id ?? null,
          provider: data.provider ?? 'domestic_ai',
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // Laravel unreachable — fall through to in-process AI / fallback
    }

    // ── Try Gemini directly if Laravel is down ──────────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let response = '';

    if (geminiKey) {
      try {
        const conversationText =
          (history ?? [])
            .slice(-8)
            .map((m: { role: string; content: string }) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
            .join('\n') + `\nUser: ${message}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a professional AI real estate lead-qualification assistant for Domestic Real Estate (domesticrealestate.us). Your job is to guide users through a structured lead qualification conversation — ONE question at a time. Be warm, concise, and professional. Never ask multiple questions at once. Contact: info@domesticrealestate.us only.\n\nConversation so far:\n${conversationText}`,
                }],
              }],
              generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(10_000),
          }
        );
        const data = await res.json();
        response = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      } catch {
        // ignore
      }
    }

    if (!response && openaiKey) {
      try {
        const conversationMessages = [
          {
            role: 'system',
            content: 'You are a professional AI real estate lead-qualification assistant for Domestic Real Estate. Guide users ONE question at a time. Be warm and professional. Contact info@domesticrealestate.us only.',
          },
          ...(history ?? []).slice(-8).map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content: message },
        ];

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: conversationMessages, max_tokens: 400 }),
          signal: AbortSignal.timeout(10_000),
        });
        const data = await res.json();
        response = data?.choices?.[0]?.message?.content ?? '';
      } catch {
        // ignore
      }
    }

    if (!response) {
      response = getSmartFallback(message);
    }

    return NextResponse.json({
      response,
      lead_captured: false,
      provider: geminiKey || openaiKey ? 'ai' : 'fallback',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
