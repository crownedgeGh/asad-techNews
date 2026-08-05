import React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TipTapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

type ToolbarButton = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor | null) => void;
  isActive?: (editor: Editor | null) => boolean;
};

export default function TipTapEditor({
  initialContent = '',
  onChange,
  placeholder = 'Start writing your article...',
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
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

  const loadedContentRef = React.useRef(initialContent);
  React.useEffect(() => {
    if (!editor || initialContent === loadedContentRef.current) return;
    loadedContentRef.current = initialContent;
    editor.commands.setContent(initialContent || `<p>${placeholder}</p>`);
  }, [editor, initialContent, placeholder]);

  if (!editor) {
    return (
      <div className="border border-base-300 rounded-xl overflow-hidden bg-base-100">
        <div className="flex items-center gap-1 p-2 bg-base-200/60 border-b border-base-300 h-[42px]" />
        <div className="min-h-[360px] p-4 animate-pulse text-base-content/40 text-sm">Loading editor…</div>
      </div>
    );
  }

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
      { label: 'Bold', icon: Bold, action: (e) => e?.chain().focus().toggleBold().run(), isActive: (e) => e?.isActive('bold') ?? false },
      { label: 'Italic', icon: Italic, action: (e) => e?.chain().focus().toggleItalic().run(), isActive: (e) => e?.isActive('italic') ?? false },
      { label: 'Underline', icon: UnderlineIcon, action: (e) => e?.chain().focus().toggleUnderline().run(), isActive: (e) => e?.isActive('underline') ?? false },
    ],
    [
      { label: 'Heading 1', icon: Heading1, action: (e) => e?.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (e) => e?.isActive('heading', { level: 1 }) ?? false },
      { label: 'Heading 2', icon: Heading2, action: (e) => e?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e?.isActive('heading', { level: 2 }) ?? false },
      { label: 'Heading 3', icon: Heading3, action: (e) => e?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e?.isActive('heading', { level: 3 }) ?? false },
    ],
    [
      { label: 'Bullet List', icon: List, action: (e) => e?.chain().focus().toggleBulletList().run(), isActive: (e) => e?.isActive('bulletList') ?? false },
      { label: 'Numbered List', icon: ListOrdered, action: (e) => e?.chain().focus().toggleOrderedList().run(), isActive: (e) => e?.isActive('orderedList') ?? false },
      { label: 'Quote', icon: Quote, action: (e) => e?.chain().focus().toggleBlockquote().run(), isActive: (e) => e?.isActive('blockquote') ?? false },
    ],
  ];

  return (
    <div className="border border-base-300 rounded-xl overflow-hidden bg-base-100">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-base-200/60 border-b border-base-300">
        {toolbarGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="w-px h-5 bg-base-300 mx-1" />}
            {group.map(({ label, icon: Icon, action, isActive }) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  action(editor);
                }}
                className={cn(
                  'inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors',
                  isActive?.(editor) ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </React.Fragment>
        ))}
        <span className="w-px h-5 bg-base-300 mx-1" />
        <button
          type="button"
          title="Link"
          aria-label="Link"
          onMouseDown={(e) => { e.preventDefault(); setLink(); }}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-base-content hover:bg-base-200 transition-colors"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Image"
          aria-label="Image"
          onMouseDown={(e) => { e.preventDefault(); addImage(); }}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-base-content hover:bg-base-200 transition-colors"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
