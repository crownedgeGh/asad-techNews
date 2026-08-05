import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html/server'

import { articleExtensions } from '@/lib/tiptap-extensions'
import { isProseMirrorDoc } from '@/lib/prosemirror-doc'

/**
 * Renders an article body stored as ProseMirror JSON.
 *
 * Shared by the public article page and the admin preview so the preview is a
 * true preview rather than an approximation. Uses `articleExtensions` — the
 * same list the editor is built from — so what renders matches what was
 * authored.
 *
 * `generateHTML` parses the stored JSON through the extension schema, which
 * discards any node or attribute the schema does not define. That is what makes
 * the `dangerouslySetInnerHTML` below safe: the schema is the allowlist.
 */
export function ArticleBody({ content }: { content: unknown }) {
  if (!isProseMirrorDoc(content)) return null

  const html = generateHTML(content as JSONContent, articleExtensions)

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
