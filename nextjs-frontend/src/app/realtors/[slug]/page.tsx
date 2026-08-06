import { redirect } from "next/navigation";

// "Realtor" and "Agent" address the same underlying AgentProfile.slug space —
// this route used to render hardcoded fake content for every slug. Redirect
// (rather than delete) so any existing bookmarks/backlinks still resolve.
export default async function PublicRealtorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/agents/${slug}`);
}
