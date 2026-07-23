'use client';

import dynamic from 'next/dynamic';

const UniversalChatWidget = dynamic(() => import('./UniversalChatWidget'), { ssr: false });

type ValidChatContext = 'home' | 'realtor' | 'agent' | 'investor' | 'seller' | 'buyer' | 'contact' | 'property' | 'admin' | 'lender' | 'brokerage' | 'title-company' | 'property-manager' | 'wholesaler';

interface ChatWidgetWrapperProps {
  context?: string;
  leadType?: string;
}

export default function ChatWidgetWrapper({ context = 'home', leadType = 'general' }: ChatWidgetWrapperProps) {
  const safeContext: ValidChatContext = (() => {
    if (context === 'buyer-guide') return 'buyer';
    if (context === 'property-detail') return 'property';
    if (context === 'home-valuation') return 'seller';
    if (context === 'properties') return 'buyer';
    const valid: ValidChatContext[] = ['home', 'realtor', 'agent', 'investor', 'seller', 'buyer', 'contact', 'property', 'admin', 'lender', 'brokerage', 'title-company', 'property-manager', 'wholesaler'];
    if (valid.includes(context as ValidChatContext)) {
      return context as ValidChatContext;
    }
    return 'home';
  })();

  return <UniversalChatWidget context={safeContext} leadType={leadType} />;
}
