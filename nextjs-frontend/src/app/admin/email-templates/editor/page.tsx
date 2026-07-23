"use client";

import dynamic from "next/dynamic";

const EmailEditorContent = dynamic(() => import("./EmailEditorContent"), { ssr: false });

export default function EmailTemplateEditorPage() {
  return <EmailEditorContent />;
}
