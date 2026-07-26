import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Domestic Real Estate',
  description: 'Get in touch with Domestic Real Estate. Visit our office, call us, or send a message. We are here to help.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
