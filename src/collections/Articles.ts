import type { Access, CollectionConfig } from 'payload'

import { formatSlug } from '../fields/slug/formatSlug'

type UserRole = 'admin' | 'editor'

const hasRole =
  (...roles: UserRole[]): Access =>
  ({ req: { user } }) =>
    Boolean(user && roles.includes(user.role as UserRole))

// Editorial roles see everything; everyone else sees published articles only.
// This is the authorization model for the custom admin, /cms, and the REST API
// alike, because admin mutations run with `overrideAccess: false`.
const readAccess: Access = ({ req: { user } }) => {
  if (user && (user.role === 'admin' || user.role === 'editor')) return true
  return {
    _status: {
      equals: 'published',
    },
  }
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    read: readAccess,
    create: hasRole('admin', 'editor'),
    update: hasRole('admin', 'editor'),
    delete: hasRole('admin'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'views', 'likes', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.slug && typeof data.title === 'string') {
          data.slug = formatSlug(data.title)
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/fields/slug/SlugComponent#SlugComponent',
        },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // ProseMirror JSON, produced by the custom admin's TipTap editor and
      // rendered on the public site via generateHTML(). Deliberately not a
      // Payload richText field — TipTap is ProseMirror, Payload's richText is
      // Lexical, and the two document models are not interchangeable.
      // See design decision 3.
      name: 'content',
      type: 'json',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'commentsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Manual trend ranking — lower shows first.',
      },
    },
  ],
}
