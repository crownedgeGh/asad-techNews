/**
 * Pure ProseMirror document helpers — no TipTap imports.
 *
 * Kept separate from `tiptap-extensions.ts` so the Payload config can build
 * documents without pulling the editor's React extensions into the server
 * bundle.
 */

export type ProseMirrorNode = {
  type?: string
  attrs?: Record<string, unknown>
  content?: ProseMirrorNode[]
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  text?: string
  [key: string]: unknown
}

export type ProseMirrorDoc = {
  type: 'doc'
  content: ProseMirrorNode[]
}

/** An empty document, for new articles. */
export const emptyDocument = (): ProseMirrorDoc => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
})

/** Build a minimal document from plain paragraphs of text. */
export const paragraphsToDocument = (paragraphs: string[]): ProseMirrorDoc => ({
  type: 'doc',
  content: paragraphs.map((text) => ({
    type: 'paragraph',
    content: text ? [{ type: 'text', text }] : [],
  })),
})

/** True when a value looks like a ProseMirror document we can render. */
export const isProseMirrorDoc = (value: unknown): value is ProseMirrorDoc =>
  typeof value === 'object' &&
  value !== null &&
  (value as { type?: unknown }).type === 'doc' &&
  Array.isArray((value as { content?: unknown }).content)
