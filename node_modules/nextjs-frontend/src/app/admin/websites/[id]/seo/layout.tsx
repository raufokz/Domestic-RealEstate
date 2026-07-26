export function generateStaticParams() {
  return [];
}

export const dynamicParams = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
