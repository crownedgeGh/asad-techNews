import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

interface TipTapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

type ToolbarButton = {
  label: string;
  action: (editor: ReturnType<typeof useEditor>) => void;
  isActive?: (editor: ReturnType<typeof useEditor>) => boolean;
};

export default function TipTapEditor({
  initialContent = '',
  onChange,
  placeholder = 'Start writing your article...',
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: initialContent || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[360px] p-4 focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:', editor.getAttributes('link').href ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const toolbarGroups: ToolbarButton[][] = [
    [
      {
        label: 'B',
        action: (e) => e?.chain().focus().toggleBold().run(),
        isActive: (e) => e?.isActive('bold') ?? false,
      },
      {
        label: 'I',
        action: (e) => e?.chain().focus().toggleItalic().run(),
        isActive: (e) => e?.isActive('italic') ?? false,
      },
      {
        label: 'U',
        action: (e) => e?.chain().focus().toggleUnderline().run(),
        isActive: (e) => e?.isActive('underline') ?? false,
      },
    ],
    [
      {
        label: 'H1',
        action: (e) => e?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: (e) => e?.isActive('heading', { level: 1 }) ?? false,
      },
      {
        label: 'H2',
        action: (e) => e?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (e) => e?.isActive('heading', { level: 2 }) ?? false,
      },
      {
        label: 'H3',
        action: (e) => e?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (e) => e?.isActive('heading', { level: 3 }) ?? false,
      },
    ],
    [
      {
        label: '• List',
        action: (e) => e?.chain().focus().toggleBulletList().run(),
        isActive: (e) => e?.isActive('bulletList') ?? false,
      },
      {
        label: '1. List',
        action: (e) => e?.chain().focus().toggleOrderedList().run(),
        isActive: (e) => e?.isActive('orderedList') ?? false,
      },
      {
        label: '❝',
        action: (e) => e?.chain().focus().toggleBlockquote().run(),
        isActive: (e) => e?.isActive('blockquote') ?? false,
      },
    ],
  ];

  return (
    <div className="border border-base-300 rounded-xl overflow-hidden bg-base-100">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-base-200 border-b border-base-300">
        {toolbarGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="w-px h-5 bg-base-300 mx-1" />}
            {group.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  btn.action(editor);
                }}
                className={`btn btn-xs font-mono ${
                  btn.isActive?.(editor) ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </React.Fragment>
        ))}
        <span className="w-px h-5 bg-base-300 mx-1" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setLink(); }} className="btn btn-xs btn-ghost font-mono">
          🔗 Link
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); addImage(); }} className="btn btn-xs btn-ghost font-mono">
          🖼 Img
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
