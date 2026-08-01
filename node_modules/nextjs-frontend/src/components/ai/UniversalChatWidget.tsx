'use client';

import { useState, useRef, useEffect } from 'react';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  failed?: boolean;
  isStreaming?: boolean;
}

interface UniversalChatWidgetProps {
  context?: 'home' | 'realtor' | 'agent' | 'investor' | 'seller' | 'buyer' | 'contact' | 'property' | 'admin' | 'lender' | 'brokerage' | 'title-company' | 'property-manager' | 'wholesaler';
  leadType?: string;
  propertyId?: number;
  className?: string;
}

const prepareLeadData = (data: Record<string, any>) => {
  const cleaned = { ...data };
  if (cleaned.consent_given !== undefined) {
    cleaned.consent_given = cleaned.consent_given === 'Yes, I consent' || cleaned.consent_given === 'Yes';
  }
  return cleaned;
};

const CONTEXT_CONFIG = {
  home: {
    title: 'Domestic AI Assistant',
    subtitle: 'Your Key to Home',
    greeting: 'Hi, this is Domestic Real Estate! Are you looking to Buy, Sell, or Invest in property? Choose an assistant below to begin.',
  },
  realtor: {
    title: 'Realtor AI Recruiter',
    subtitle: 'Join Our Network',
    greeting: 'Welcome! I\'m here to help you apply for our realtor network. Let\'s get started with your application details.',
  },
  agent: {
    title: 'Agent AI Assistant',
    subtitle: 'Application Support',
    greeting: 'Welcome! I can help you with your agent application. Let\'s collect your details first.',
  },
  investor: {
    title: 'Investment AI Advisor',
    subtitle: 'Smart Investments',
    greeting: 'Welcome! I\'m your investment advisor. Let\'s qualify your investment criteria to find the best opportunities.',
  },
  seller: {
    title: 'Seller AI Assistant',
    subtitle: 'Property Valuation',
    greeting: 'Hello! Let\'s value your property and list your home. I\'ll ask you a few questions about your property.',
  },
  buyer: {
    title: 'Buyer AI Assistant',
    subtitle: 'Find Your Dream Home',
    greeting: 'Hi! Let\'s find your perfect home. I\'ll collect your budget and property preferences to get started.',
  },
  contact: {
    title: 'Support AI Assistant',
    subtitle: 'We\'re Here to Help',
    greeting: 'Hello! I\'m here to assist you. What can I help you with today?',
  },
  property: {
    title: 'Property AI Assistant',
    subtitle: 'Property Details',
    greeting: 'Hi! I can answer questions about this property. Let\'s get your preferences to recommend similar listings.',
  },
  admin: {
    title: 'Admin AI Assistant',
    subtitle: 'Internal Support',
    greeting: 'Hello! I\'m your admin assistant. How can I help you manage the platform today?',
  },
  lender: {
    title: 'Lender AI Assistant',
    subtitle: 'Lending Partnership',
    greeting: 'Welcome! I can help you join our lender network. Let\'s get your details set up.',
  },
  brokerage: {
    title: 'Brokerage AI Assistant',
    subtitle: 'Brokerage Solutions',
    greeting: 'Welcome! I\'m here to help you set up your brokerage on our platform. Let\'s get started.',
  },
  'title-company': {
    title: 'Title Company AI Assistant',
    subtitle: 'Title Partnership',
    greeting: 'Welcome! I can help you join our title company partner network. Let\'s collect your details.',
  },
  'property-manager': {
    title: 'Property Manager AI Assistant',
    subtitle: 'Management Solutions',
    greeting: 'Welcome! I\'m here to help you join our property management network. Let\'s get started.',
  },
  wholesaler: {
    title: 'Wholesaler AI Assistant',
    subtitle: 'Deal Flow',
    greeting: 'Welcome! I can help you submit deals and connect with buyers. Let\'s get started.',
  },
};

const FIELDS_BY_TYPE: Record<string, { key: string; question: string; placeholder: string; type?: string; options?: string[] }[]> = {
  buyer: [
    { key: 'name', question: "Let's find your perfect home! What is your full name?", placeholder: "Full Name" },
    { key: 'email', question: "Great! What is your email address so we can send you matching listings?", placeholder: "Email Address", type: 'email' },
    { key: 'phone', question: "What is your best contact phone number?", placeholder: "Phone Number", type: 'tel' },
    { key: 'budget_max', question: "What is your maximum budget for the property?", placeholder: "Maximum Budget (USD)", type: 'number', options: ['$250k - $400k', '$400k - $600k', '$600k - $800k', '$800k+'] },
    { key: 'property_type', question: "What property type are you looking for? (Single Family, Condo, Townhouse, Multi-family, etc.)", placeholder: "e.g. Single Family Home", options: ['Single Family', 'Condo', 'Townhouse', 'Multi-family'] },
    { key: 'bedrooms', question: "How many bedrooms do you need?", placeholder: "Minimum Bedrooms", type: 'number', options: ['1', '2', '3', '4', '5+'] },
    { key: 'bathrooms', question: "How many bathrooms do you require?", placeholder: "Minimum Bathrooms", type: 'number', options: ['1', '1.5', '2', '2.5', '3', '4+'] },
    { key: 'location', question: "What are your preferred cities or neighborhoods?", placeholder: "e.g. Fort Worth, Dallas", options: ['Fort Worth', 'Dallas', 'Arlington', 'Plano', 'Frisco'] },
    { key: 'financing', question: "Do you plan to purchase with Cash, or will you need Financing?", placeholder: "Cash or Financing", options: ['Cash', 'Conventional Financing', 'FHA Loan', 'VA Loan'] },
    { key: 'timeline', question: "What is your timeline to purchase? (Immediate, 1-3 months, 3-6 months, etc.)", placeholder: "e.g. 1-3 months", options: ['Immediate', '1-3 Months', '3-6 Months', 'Flexible'] },
    { key: 'realtor_status', question: "Are you currently represented by or working with another realtor?", placeholder: "No or Yes", options: ['No', 'Yes'] },
    { key: 'consent_given', question: "By providing your phone number, do you consent to receive calls or texts from us, even if your number is on the Do Not Call (DNC) registry?", placeholder: "Select Yes or No", options: ['Yes, I consent', 'No, I do not consent'] }
  ],
  seller: [
    { key: 'name', question: "Let's value your property! What is your full name?", placeholder: "Full Name" },
    { key: 'email', question: "What is your email address where we can send the valuation report?", placeholder: "Email Address", type: 'email' },
    { key: 'phone', question: "What is your phone number?", placeholder: "Phone Number", type: 'tel' },
    { key: 'location', question: "What is the street address of the property you want to sell?", placeholder: "Street Address" },
    { key: 'city', question: "Which city is the property located in?", placeholder: "City" },
    { key: 'state', question: "And which state?", placeholder: "State" },
    { key: 'zip', question: "What is the ZIP code of the property?", placeholder: "ZIP Code" },
    { key: 'bedrooms', question: "How many bedrooms does the property have?", placeholder: "Bedrooms", type: 'number', options: ['1', '2', '3', '4', '5+'] },
    { key: 'bathrooms', question: "How many bathrooms does it have?", placeholder: "Bathrooms", type: 'number', options: ['1', '1.5', '2', '2.5', '3', '4+'] },
    { key: 'property_condition', question: "What is the condition of the home? (Excellent, Good, Fair, Needs Work)", placeholder: "e.g. Excellent", options: ['Excellent', 'Good', 'Fair', 'Needs Work'] },
    { key: 'asking_price', question: "What is your target or estimated asking price?", placeholder: "Target Price (USD)", type: 'number', options: ['$200k - $350k', '$350k - $500k', '$500k - $750k', '$750k+'] },
    { key: 'timeline', question: "When are you planning to sell?", placeholder: "e.g. Immediate, 1-3 months", options: ['Immediate', '1-3 Months', '3-6 Months', 'Just Curious'] },
    { key: 'mortgage_status', question: "What is the mortgage status? (Fully paid off, Under mortgage, etc.)", placeholder: "Mortgage Status", options: ['Fully Paid Off', 'Under Mortgage', 'Refinancing'] },
    { key: 'consent_given', question: "By providing your phone number, do you consent to receive calls or texts from us, even if your number is on the Do Not Call (DNC) registry?", placeholder: "Select Yes or No", options: ['Yes, I consent', 'No, I do not consent'] }
  ],
  investor: [
    { key: 'name', question: "Ready to invest? Let's qualify your search. What is your full name?", placeholder: "Full Name" },
    { key: 'email', question: "What is your professional email address for deal alerts?", placeholder: "Email Address", type: 'email' },
    { key: 'phone', question: "What is your contact phone number?", placeholder: "Phone Number", type: 'tel' },
    { key: 'budget_max', question: "What is your investment budget limit?", placeholder: "Investment Budget (USD)", type: 'number', options: ['$100k - $250k', '$250k - $500k', '$500k - $1M', '$1M+'] },
    { key: 'financing', question: "Will you purchase with cash, or do you have financing ready?", placeholder: "e.g. Cash, Conventional, Hard Money", options: ['Cash Ready', 'Conventional Loan', 'Hard Money', 'Other'] },
    { key: 'property_type', question: "Are you looking for Residential, Commercial, Multi-family, or Land?", placeholder: "e.g. Residential Multi-family", options: ['Residential Multi-family', 'Residential Single', 'Commercial', 'Land'] },
    { key: 'location', question: "Which markets or regions are you interested in investing in?", placeholder: "Target Locations", options: ['Dallas-Fort Worth', 'Houston', 'Austin', 'San Antonio'] },
    { key: 'roi_goal', question: "What is your target ROI (Return on Investment) or Cap Rate percentage?", placeholder: "ROI Goal (e.g. 12% ROI, 8% Cap)", options: ['8% - 10%', '10% - 15%', '15%+', 'No specific target'] },
    { key: 'timeline', question: "What is your investment timeline to close a deal?", placeholder: "e.g. 30 Days, 1-3 months", options: ['Immediate / Under 30 Days', '1-3 Months', '3-6 Months', 'Flexible'] },
    { key: 'notes', question: "What is your primary investment strategy? (Fix & Flip, Buy & Hold, Wholesaling)", placeholder: "Target Strategy", options: ['Fix & Flip', 'Buy & Hold / Rental', 'Wholesaling', 'BRRRR'] }
  ],
  realtor: [
    { key: 'name', question: "Let's start your Realtor Network application! What is your full name?", placeholder: "Full Name" },
    { key: 'email', question: "What is your professional email address?", placeholder: "Email Address", type: 'email' },
    { key: 'phone', question: "What is your phone number?", placeholder: "Phone Number", type: 'tel' },
    { key: 'brokerage_name', question: "What is your current brokerage affiliation?", placeholder: "Current Brokerage" },
    { key: 'license_number', question: "What is your real estate license number?", placeholder: "License Number" },
    { key: 'state', question: "In which state are you primary licensed?", placeholder: "State", options: ['TX', 'FL', 'CA', 'NY', 'GA', 'CO'] },
    { key: 'city', question: "Which primary city do you cover?", placeholder: "Primary City", options: ['Dallas', 'Fort Worth', 'Houston', 'Austin', 'Miami', 'Atlanta'] },
    { key: 'zip', question: "What is your primary zip code of operations?", placeholder: "ZIP Code" },
    { key: 'years_experience', question: "How many years of experience do you have?", placeholder: "Years of Experience", type: 'number', options: ['0-2 Years', '3-5 Years', '5-10 Years', '10+ Years'] },
    { key: 'production', question: "What is your annual volume or recent transaction history?", placeholder: "e.g. $4M Annual, 12 properties", options: ['Under $1M', '$1M - $5M', '$5M - $10M', '$10M+'] },
    { key: 'referral_areas', question: "List any specific neighborhoods you specialize in. (referral areas)", placeholder: "e.g. North Fort Worth" },
    { key: 'languages', question: "What languages do you speak? (separate by comma)", placeholder: "e.g. English, Spanish", options: ['English Only', 'English & Spanish', 'Other'] },
    { key: 'resume_url', question: "Do you have a link to your resume or LinkedIn profile?", placeholder: "LinkedIn Profile URL", type: 'url' },
    { key: 'profile_photo_url', question: "Provide a link to a professional headshot photo (optional).", placeholder: "Photo URL", type: 'url' }
  ]
};

const FALLBACK =
  'Thanks for reaching out! Our Domestic Real Estate team can help at info@domesticrealestate.us — share what you need and we\'ll follow up shortly.';

const TOOLTIP_PHRASES = [
  "Looking for a home in the US or Canada? Let me find top matches!",
  "Want an instant property valuation report? Ask me here.",
  "Hi! Can I help you calculate your investment ROI right now?"
];

function parseMarkdown(text: string): string {
  if (!text) return "";
  
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-gold'>$1</code>");

  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      let prefix = '';
      if (!inList) {
        inList = true;
        prefix = '<ul class="list-disc pl-5 my-2 space-y-1">';
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = '';
      if (inList) {
        inList = false;
        suffix = '</ul>';
      }
      return `${suffix}${line}`;
    }
  });

  if (inList) {
    processedLines.push('</ul>');
  }

  html = processedLines.join('\n');
  html = html.replace(/\n/g, "<br />");
  
  return html;
}

export default function UniversalChatWidget({ 
  context = 'home', 
  leadType, 
  propertyId,
  className = '' 
}: UniversalChatWidgetProps) {
  const { notifyError, success, warning } = useToast();
  const config = CONTEXT_CONFIG[context] || CONTEXT_CONFIG.home;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Animation & Attention Grabbers
  const [isVisible, setIsVisible] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // Core chat sessions
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedLeadType, setSelectedLeadType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [currentFieldIdx, setCurrentFieldIdx] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [leadSaved, setLeadSaved] = useState<boolean>(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [cooldown, setCooldown] = useState(0);

  const currentType = selectedLeadType;
  const fields = currentType ? FIELDS_BY_TYPE[currentType] : [];
  const isQuestionnaire = !!(currentType && !completed && currentFieldIdx < fields.length);
  const currentField = isQuestionnaire ? fields[currentFieldIdx] : null;

  // 1. Set random tooltip text on load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TOOLTIP_PHRASES.length);
    setTooltipText(TOOLTIP_PHRASES[randomIndex]);
  }, []);

  // 2. Initial delay of 2.5 seconds to show the button
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // 3. Slide out tooltip 4 seconds after button appears, auto collapse after 7 seconds
  useEffect(() => {
    if (!isVisible || isOpen) return;

    const tooltipShowTimer = setTimeout(() => {
      setShowTooltip(true);

      const tooltipHideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 7000);

      return () => clearTimeout(tooltipHideTimer);
    }, 4000);

    return () => clearTimeout(tooltipShowTimer);
  }, [isVisible, isOpen]);

  // 4. Track user inactivity and trigger bounce animation every 8 seconds of inactivity
  useEffect(() => {
    if (!isVisible || isOpen) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setInterval(() => {
        setShouldBounce(true);
      }, 8000);
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    // Initialize timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isVisible, isOpen]);

  // 5. Accessibility Focus Trapping & Escape Key close
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (!widgetRef.current) return;
        const focusableElements = Array.from(
          widgetRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => {
          if (
            el instanceof HTMLButtonElement ||
            el instanceof HTMLInputElement ||
            el instanceof HTMLSelectElement ||
            el instanceof HTMLTextAreaElement
          ) {
            return !el.disabled;
          }
          return true;
        });
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const isFocusInside = widgetRef.current.contains(document.activeElement);
        if (!isFocusInside) {
          if (e.shiftKey) {
            lastElement.focus();
          } else {
            firstElement.focus();
          }
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Autofocus inside the widget when opened to support keyboard navigators
    if (widgetRef.current) {
      const focusable = widgetRef.current.querySelectorAll<HTMLElement>(
        'button, input, select'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isMinimized]);

  // Read saved session from localStorage on mount (Client-side only)
  useEffect(() => {
    const getNormalizedType = (t: string | undefined): string | null => {
      if (!t) return null;
      if (t === 'agent') return 'realtor';
      return FIELDS_BY_TYPE[t] ? t : null;
    };

    const initialLeadType = getNormalizedType(leadType);
    const key = `re_ai_session_${context}_${leadType || 'any'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.session_id) {
          setSessionId(parsed.session_id);
          setMessages(parsed.messages || []);
          setCollectedData(parsed.collectedData || {});
          setCurrentFieldIdx(parsed.currentFieldIdx ?? 0);
          setCompleted(parsed.completed ?? false);
          const savedType = getNormalizedType(parsed.selectedLeadType);
          setSelectedLeadType(savedType || initialLeadType);
          setLeadSaved(parsed.leadSaved ?? false);
          return;
        }
      } catch (e) {
        console.error("Failed to restore AI chat session", e);
      }
    }

    // Default initializer
    const newSid = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    setSessionId(newSid);
    setSelectedLeadType(initialLeadType);
    
    // Set greeting
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: config.greeting,
      },
    ]);
  }, [context, leadType]);

  // Listen for custom trigger to open chat in specific mode
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const type = customEvent.detail?.type;
      
      setIsOpen(true);
      setIsMinimized(false);
      
      const getNormalizedType = (t: string | undefined): string | null => {
        if (!t) return null;
        if (t === 'agent') return 'realtor';
        return FIELDS_BY_TYPE[t] ? t : null;
      };

      const normalizedType = getNormalizedType(type);
      
      if (normalizedType) {
        setSelectedLeadType(normalizedType);
        setCurrentFieldIdx(0);
        setCompleted(false);
        setLeadSaved(false);
        setCollectedData({});
        
        const fields = FIELDS_BY_TYPE[normalizedType];
        const greetingMsg = CONTEXT_CONFIG[normalizedType as keyof typeof CONTEXT_CONFIG]?.greeting || 'Hi! Let\'s get started.';
        
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: greetingMsg,
          },
          {
            id: `q-0`,
            role: 'assistant',
            content: fields[0].question,
          }
        ]);
      }
    };
    
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  // Sync state to localStorage on update
  useEffect(() => {
    if (!sessionId) return;
    const key = `re_ai_session_${context}_${leadType || 'any'}`;
    localStorage.setItem(key, JSON.stringify({
      session_id: sessionId,
      messages,
      collectedData,
      currentFieldIdx,
      completed,
      selectedLeadType,
      leadSaved
    }));
  }, [sessionId, messages, collectedData, currentFieldIdx, completed, selectedLeadType, leadSaved]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const streamText = (messageId: string, fullText: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: '', isStreaming: true } : msg
      )
    );

    let currentIndex = 0;
    const interval = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const nextContent = fullText.slice(0, currentIndex + 1);
            const isDone = currentIndex + 1 >= fullText.length;
            return {
              ...msg,
              content: nextContent,
              isStreaming: !isDone,
            };
          }
          return msg;
        })
      );

      currentIndex += 3;
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
      }
    }, 15);
  };

  const checkRateLimit = (): boolean => {
    return true;
  };

  // Triggers selection when a homepage category button is clicked
  const selectCategory = (type: string) => {
    setSelectedLeadType(type);
    const text = type === 'buyer' 
      ? 'I want to Buy Property' 
      : type === 'seller' 
        ? 'I want to Sell My Home' 
        : 'I want to Invest';

    const firstMsg: Message = { id: `sel-${Date.now()}`, role: 'user', content: text };
    
    const fields = FIELDS_BY_TYPE[type];
    const initialQuestionMsg: Message = {
      id: `qn-${Date.now()}`,
      role: 'assistant',
      content: fields[0].question
    };

    const nextMessages = [...messages, firstMsg, initialQuestionMsg];
    setMessages(nextMessages);
    setCurrentFieldIdx(0);
    setCollectedData({});

    // Save initial progress to the backend
    apiPost('/ai/save-progress', {
      session_id: sessionId,
      ai_type: type,
      messages: nextMessages,
      lead_data: {},
      completed: false
    }).catch(err => console.error("Initial sync issue", err));
  };

  const handleReset = () => {
    const key = `re_ai_session_${context}_${leadType || 'any'}`;
    localStorage.removeItem(key);
    const newSid = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    setSessionId(newSid);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: CONTEXT_CONFIG[context]?.greeting || CONTEXT_CONFIG.home.greeting,
      },
    ]);
    setCollectedData({});
    setCurrentFieldIdx(0);
    setCompleted(false);

    const getNormalizedType = (t: string | undefined): string | null => {
      if (!t) return null;
      if (t === 'agent') return 'realtor';
      return FIELDS_BY_TYPE[t] ? t : null;
    };
    setSelectedLeadType(getNormalizedType(leadType));
    setLeadSaved(false);
  };

  const handleSend = async (textToSend: string, isRetryId?: string) => {
    if (!textToSend.trim() || loading) return;

    if (!isRetryId && !checkRateLimit()) {
      setMessages((prev) => [
        ...prev,
        {
          id: `rate-limit-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ **Rate Limit Exceeded**: You are sending messages too quickly. Please wait 30 seconds.',
        },
      ]);
      return;
    }

    setLoading(true);

    let messageId = isRetryId;
    if (!messageId) {
      messageId = `msg-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: messageId!, role: 'user', content: textToSend },
      ]);
      setInput('');
    } else {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, failed: false } : msg))
      );
    }

    const currentType = selectedLeadType;
    const fields = currentType ? FIELDS_BY_TYPE[currentType] : null;

    // Check if we are currently collecting structured form questions
    if (fields && currentFieldIdx < fields.length && !completed) {
      const currentField = fields[currentFieldIdx];
      const nextData = { ...collectedData, [currentField.key]: textToSend };
      setCollectedData(nextData);

      const nextFieldIdx = currentFieldIdx + 1;
      const isFinished = nextFieldIdx >= fields.length;

      let nextMessages = [...messages];
      if (!isRetryId) {
        nextMessages.push({ id: messageId!, role: 'user', content: textToSend });
      }

      if (!isFinished) {
        // Queue next question
        const nextField = fields[nextFieldIdx];
        const nextQnId = `qn-${Date.now()}`;
        nextMessages.push({ id: nextQnId, role: 'assistant', content: nextField.question });
        setMessages(nextMessages);
        setCurrentFieldIdx(nextFieldIdx);
        setLoading(false);

        // Save progress to the DB
        try {
          await apiPost('/ai/save-progress', {
            session_id: sessionId,
            ai_type: currentType,
            messages: nextMessages,
            lead_data: prepareLeadData(nextData),
            completed: false
          });
        } catch (err) {
          console.error("Progress save failed", err);
        }
      } else {
        // Complete the questionnaire flow
        setCompleted(true);
        const doneMsgId = `done-${Date.now()}`;
        const doneText = `Thank you! I have registered your information successfully. A local Domestic Real Estate specialist will be in touch with you shortly. You may now continue to chat with me normally!`;
        nextMessages.push({ id: doneMsgId, role: 'assistant', content: doneText });
        setMessages(nextMessages);
        setLeadSaved(true);
        setLoading(false);
        success('Information saved! A specialist will contact you.');

        try {
          await apiPost('/ai/save-progress', {
            session_id: sessionId,
            ai_type: currentType,
            messages: nextMessages,
            lead_data: prepareLeadData(nextData),
            completed: true
          });
        } catch (err) {
          console.error("Progress completion save failed", err);
        }
      }
      return;
    }

    // REGULAR GENERAL/fallback chat flow: triggers after questionnaire completes
    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const payload: any = {
        message: textToSend,
        type: currentType || 'buyer',
        context: context,
        history,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof document !== 'undefined' ? document.title : '',
      };

      if (propertyId) {
        payload.property_id = propertyId;
      }

      // Check if user inputs their name/email in normal chat to register lead
      if (collectedData.email) {
        payload.email = collectedData.email;
        payload.name = collectedData.name;
        payload.phone = collectedData.phone;
      }

      const data = await apiPost<{
        response?: string;
        lead_captured?: boolean;
        provider?: string;
      }>('/ai/chat', payload);

      if (data.provider === 'fallback') {
        warning('AI is temporarily unavailable', {
          fix: 'Please contact the administrator or check the integrations settings.'
        });
      }

      const reply = data.response || FALLBACK;
      const assistantMsgId = `assistant-${Date.now()}`;

      const nextMessages = [...messages];
      if (!isRetryId) {
        nextMessages.push({ id: messageId!, role: 'user', content: textToSend });
      }
      nextMessages.push({ id: assistantMsgId, role: 'assistant', content: '' });
      setMessages(nextMessages);

      streamText(assistantMsgId, reply);

      // Sync general chat history to db too
      if (currentType) {
        apiPost('/ai/save-progress', {
          session_id: sessionId,
          ai_type: currentType,
          messages: [...nextMessages.slice(0, -1), { id: assistantMsgId, role: 'assistant', content: reply }],
          lead_data: prepareLeadData(collectedData),
          completed: true
        }).catch(e => console.error("sync err", e));
      }

    } catch (err) {
      const errMsg = 'AI is temporarily unavailable. Please try again later.';
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, failed: true } : msg))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `❌ ${errMsg}`,
        },
      ]);
      notifyError(err, 'AI Chat is not responding.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = (): string => {
    if (cooldown > 0) return "Blocked by cooldown...";
    const currentType = selectedLeadType;
    if (currentType && !completed) {
      const fields = FIELDS_BY_TYPE[currentType];
      if (fields && currentFieldIdx < fields.length) {
        return fields[currentFieldIdx].placeholder;
      }
    }
    return "Type your message...";
  };

  const getInputType = (): string => {
    const currentType = selectedLeadType;
    if (currentType && !completed) {
      const fields = FIELDS_BY_TYPE[currentType];
      if (fields && currentFieldIdx < fields.length) {
        const field = fields[currentFieldIdx];
        if (field.options) {
          return 'text';
        }
        return field.type || 'text';
      }
    }
    return 'text';
  };

  // 1. Set random tooltip text on load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TOOLTIP_PHRASES.length);
    setTooltipText(TOOLTIP_PHRASES[randomIndex]);
  }, []);

  // 2. Make button immediately visible on load & show proactive tooltip after 1s
  useEffect(() => {
    setIsVisible(true);
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 1200);
    return () => clearTimeout(tooltipTimer);
  }, []);

  const buttonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 20 }
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 flex-row-reverse ${className}`}>
        {/* Bouncy Floating Toggle Button */}
        <div className="relative font-body">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -8, 0]
            }}
            transition={{
              scale: { duration: 0.3 },
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setShowTooltip(false);
            }}
            className="w-16 h-16 bg-gradient-to-r from-amber-400 via-[#C9A227] to-amber-500 text-[#0A2647] rounded-full shadow-[0_0_30px_rgba(201,162,39,0.85)] border-2 border-white ring-4 ring-[#C9A227]/50 flex items-center justify-center cursor-pointer transition-shadow"
            aria-label="Open AI Chat Assistant"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-controls="ai-chat-dialog"
          >
            <svg className="w-8 h-8 text-[#0A2647] drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.button>
          
          {/* Active Pulsing Green Online Indicator Dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow"></span>
          </span>
        </div>

        {/* Proactive Tooltip Pill Badge */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#0A2647] border-2 border-[#C9A227] text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-extrabold text-white tracking-wide">
                  💬 Chat with AI Assistant <span className="text-[#C9A227]">(Online)</span>
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="!text-slate-300 hover:!text-white transition-colors text-xs font-extrabold w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
                aria-label="Close tooltip"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-6 right-6 z-50 w-80 bg-navy hover:bg-navy-600 cursor-pointer shadow-2xl border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between text-white ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="font-heading font-semibold text-xs">{config.title} (Minimized)</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
            className="!text-white/70 hover:!text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={widgetRef}
      id="ai-chat-dialog"
      role="dialog"
      aria-label="AI Lead Assistant Chat"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-800 rounded-card shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden ${className}`}
    >
      <div className="bg-navy p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-heading font-semibold text-sm">
              {selectedLeadType ? `${selectedLeadType.toUpperCase()} assistant` : config.title}
            </h3>
            <p className="text-slate-300 text-xs">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="!text-white/70 hover:!text-white transition-colors"
            title="Reset Chat"
            aria-label="Reset Conversation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.21M17 17l4-4m0 0l-4-4m4 4H1" />
            </svg>
          </button>
          <button 
            onClick={() => setIsMinimized(true)} 
            className="!text-white/70 hover:!text-white transition-colors" 
            aria-label="Minimize chat"
            title="Minimize"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="!text-white/70 hover:!text-white transition-colors" 
            aria-label="Close chat"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-end gap-2 max-w-[85%]">
              <div
                className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-gold text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-bl-sm shadow-sm'
                }`}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
              />
              
              {msg.failed && (
                <button
                  onClick={() => handleSend(msg.content, msg.id)}
                  className="p-1.5 bg-red-100 !text-red-600 rounded-full hover:bg-red-200 transition-all cursor-pointer"
                  title="Retry sending message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.21M17 17l4-4m0 0l-4-4m4 4H1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {selectedLeadType === null && (
          <div className="mt-4 grid grid-cols-1 gap-2 pt-2">
            <button
              onClick={() => selectCategory('buyer')}
              className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 !text-[#0A2647] dark:!text-[#C9A227] font-semibold text-xs rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Buyer AI Assistance
              </span>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => selectCategory('seller')}
              className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 !text-[#0A2647] dark:!text-[#C9A227] font-semibold text-xs rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-3.418-4.418A3 3 0 1112.582 7H13a2 2 0 012 2v3.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 01-1.414 0L3.293 16.12a1 1 0 010-1.414l6.414-6.414A1 1 0 0110.414 8h3.172v.005z" />
                </svg>
                Seller AI Assistance
              </span>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => selectCategory('investor')}
              className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 !text-[#0A2647] dark:!text-[#C9A227] font-semibold text-xs rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Investor AI Assistance
              </span>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-600">
              <div className="flex gap-1 items-center h-4">
                <span className="text-xs text-slate-400 mr-1">Thinking</span>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {isQuestionnaire && currentField?.options && (
          <div className="flex flex-wrap gap-1.5 mb-3 max-h-24 overflow-y-auto pb-1">
            {currentField.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setInput('');
                  handleSend(opt);
                }}
                className="px-3 py-1.5 bg-[#C9A227]/10 dark:bg-slate-700 hover:bg-[#C9A227]/20 dark:hover:bg-slate-600 !text-[#0A2647] dark:!text-[#C9A227] hover:!text-gold text-xs font-extrabold rounded-full border border-[#C9A227]/30 dark:border-slate-600 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {cooldown > 0 && (
          <div className="text-center text-xs text-red-500 font-semibold mb-2">
            ⚠️ Cooldown Active: Wait {cooldown}s before sending another message.
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type={getInputType()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-button text-sm text-slate-800 dark:text-slate-200 placeholder-[#6B7280] dark:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-gold"
            disabled={loading || cooldown > 0 || (selectedLeadType === null && context === 'home')}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || cooldown > 0 || (selectedLeadType === null && context === 'home')}
            className="w-10 h-10 bg-gradient-gold rounded-button flex items-center justify-center !text-white disabled:opacity-50 hover:shadow-lg transition-all"
            aria-label="Send message"
          >
            <svg className="w-5 h-5 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
