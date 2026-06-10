"use client";

import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Undo2,
  Unlink,
  type LucideIcon
} from "lucide-react";
import { useEffect } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type ToolbarAction = {
  label: string;
  title: string;
  icon: LucideIcon;
  action: (editor: Editor) => void;
  active?: (editor: Editor) => boolean;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Icerigi yazmaya baslayin..."
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        autolink: true,
        openOnClick: false
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "managed-richtext-editor min-h-[260px] rounded-b-2xl border border-t-0 border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none"
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

  const setLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Baglanti URL'si", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const toolbarGroups: ToolbarAction[][] = [
    [
      {
        label: "P",
        title: "Normal paragraf",
        icon: Pilcrow,
        action: (currentEditor) => currentEditor.chain().focus().setParagraph().run(),
        active: (currentEditor) => currentEditor.isActive("paragraph")
      },
      {
        label: "H2",
        title: "Baslik 2",
        icon: Heading2,
        action: (currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: (currentEditor) => currentEditor.isActive("heading", { level: 2 })
      },
      {
        label: "H3",
        title: "Baslik 3",
        icon: Heading3,
        action: (currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: (currentEditor) => currentEditor.isActive("heading", { level: 3 })
      }
    ],
    [
      {
        label: "B",
        title: "Kalin",
        icon: Bold,
        action: (currentEditor) => currentEditor.chain().focus().toggleBold().run(),
        active: (currentEditor) => currentEditor.isActive("bold")
      },
      {
        label: "I",
        title: "Italik",
        icon: Italic,
        action: (currentEditor) => currentEditor.chain().focus().toggleItalic().run(),
        active: (currentEditor) => currentEditor.isActive("italic")
      }
    ],
    [
      {
        label: "Liste",
        title: "Madde isaretli liste",
        icon: List,
        action: (currentEditor) => currentEditor.chain().focus().toggleBulletList().run(),
        active: (currentEditor) => currentEditor.isActive("bulletList")
      },
      {
        label: "1.",
        title: "Numarali liste",
        icon: ListOrdered,
        action: (currentEditor) => currentEditor.chain().focus().toggleOrderedList().run(),
        active: (currentEditor) => currentEditor.isActive("orderedList")
      },
      {
        label: "Alinti",
        title: "Alinti blogu",
        icon: Quote,
        action: (currentEditor) => currentEditor.chain().focus().toggleBlockquote().run(),
        active: (currentEditor) => currentEditor.isActive("blockquote")
      }
    ],
    [
      {
        label: "Link",
        title: "Baglanti ekle",
        icon: LinkIcon,
        action: () => setLink(),
        active: (currentEditor) => currentEditor.isActive("link")
      },
      {
        label: "Unlink",
        title: "Baglantiyi kaldir",
        icon: Unlink,
        action: (currentEditor) => currentEditor.chain().focus().unsetLink().run()
      }
    ],
    [
      {
        label: "Temizle",
        title: "Bicimlendirmeyi temizle",
        icon: Eraser,
        action: (currentEditor) =>
          currentEditor.chain().focus().unsetAllMarks().clearNodes().run()
      },
      {
        label: "Geri al",
        title: "Geri al",
        icon: Undo2,
        action: (currentEditor) => currentEditor.chain().focus().undo().run()
      },
      {
        label: "Ileri al",
        title: "Ileri al",
        icon: Redo2,
        action: (currentEditor) => currentEditor.chain().focus().redo().run()
      }
    ]
  ];

  return (
    <div className="managed-richtext-shell">
      <div className="managed-richtext-toolbar" aria-label="Metin bicimlendirme araclari">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="managed-richtext-toolbar__group">
            {group.map((item) => (
              <ToolbarButton
                key={item.title}
                editor={editor}
                icon={item.icon}
                label={item.label}
                title={item.title}
                active={item.active}
                onClick={item.action}
              />
            ))}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  editor,
  icon: Icon,
  label,
  title,
  active,
  onClick
}: {
  editor: Editor | null;
  icon: LucideIcon;
  label: string;
  title: string;
  active?: (editor: Editor) => boolean;
  onClick: (editor: Editor) => void;
}) {
  const isActive = editor ? active?.(editor) : false;

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={!editor}
      onClick={() => {
        if (editor) {
          onClick(editor);
        }
      }}
      className={`managed-richtext-toolbar__button ${isActive ? "is-active" : ""}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
