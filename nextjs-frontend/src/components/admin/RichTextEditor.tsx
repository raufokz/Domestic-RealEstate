"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import MediaPicker from "@/components/admin/MediaPicker";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Tiptap-based WYSIWYG editor for blog content. Only emits h2/h3 for
 * headings (matching `extractToc()` in src/lib/blog.ts, which anchors the
 * public post's table of contents off exactly those two levels) and links
 * its image-insert button to the shared MediaPicker instead of a bespoke
 * upload flow.
 */
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[300px] px-4 py-3 text-sm text-slate-800 focus:outline-none " +
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0A2647] [&_h2]:mt-6 [&_h2]:mb-2 " +
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0A2647] [&_h3]:mt-4 [&_h3]:mb-2 " +
          "[&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A227] [&_blockquote]:pl-3 [&_blockquote]:italic " +
          "[&_a]:text-[#C9A227] [&_a]:underline [&_img]:rounded-lg [&_img]:my-3 [&_img]:max-w-full",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep the editor in sync when `value` changes from outside (e.g. loading a post).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" />
        <Divider />
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="B" bold />
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" italic />
        <Divider />
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="• List" />
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1. List" />
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote" />
        <Divider />
        <ToolbarButton active={editor.isActive("link")} onClick={setLink} label="Link" />
        <ToolbarButton onClick={() => setPickerOpen(true)} label="Image" />
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo" />
      </div>

      <EditorContent editor={editor} placeholder={placeholder} />

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(file) => editor.chain().focus().setImage({ src: file.url, alt: file.name }).run()}
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  active,
  bold,
  italic,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
        active ? "bg-[#0A2647] text-white" : "text-slate-600 hover:bg-slate-200"
      } ${bold ? "font-black" : ""} ${italic ? "italic" : ""}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-4 bg-slate-300 mx-1" />;
}
