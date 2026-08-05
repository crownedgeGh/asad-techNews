import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'

/**
 * The single source of truth for which content types an article body supports.
 *
 * Imported by BOTH the admin editor and the public article renderer. They must
 * never define their own lists: if they drift, articles render differently than
 * they were authored. Adding a feature means adding it here and to the toolbar,
 * in the same change.
 */
export const articleExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: false,
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    protocols: ['http', 'https', 'mailto'],
    HTMLAttributes: {
      rel: 'noopener noreferrer',
    },
  }),
  Image.configure({
    inline: false,
  }),
  Highlight,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
]

