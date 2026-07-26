import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties | Domestic Real Estate',
  description: 'Browse properties with Domestic Real Estate - Your Key to Home.',
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
