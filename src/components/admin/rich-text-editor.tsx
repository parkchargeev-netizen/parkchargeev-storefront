"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Icerigi yazmaya baslayin..."
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
      }
    },
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", {
        emitUpdate: false
      });
    }
  }, [editor, value]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: "B",
            action: () => editor?.chain().focus().toggleBold().run(),
            active: editor?.isActive("bold")
          },
          {
            label: "H2",
            action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
            active: editor?.isActive("heading", { level: 2 })
          },
          {
            label: "Liste",
            action: () => editor?.chain().focus().toggleBulletList().run(),
            active: editor?.isActive("bulletList")
          }
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              item.active
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
