import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Comments } from './collections/Comments'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { paragraphsToDocument } from './lib/prosemirror-doc'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const DEV_ADMIN_EMAIL = 'dev@lumen.tech'
const DEV_ADMIN_PASSWORD = 'dev12345'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- The Lumen Tech Admin',
    },
    // Skips the login/signup screens in local dev by auto-authenticating as a seeded user.
    // Never enable this outside development.
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: DEV_ADMIN_EMAIL,
            password: DEV_ADMIN_PASSWORD,
            prefillOnly: false,
          }
        : false,
  },
  // The custom editorial admin owns /admin; Payload's native admin lives at /cms.
  // This must stay in lockstep with the directory name under src/app/(payload)/.
  routes: {
    admin: '/cms',
  },
  collections: [Users, Media, Categories, Articles, Comments],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  onInit: async (payload) => {
    if (process.env.NODE_ENV !== 'development') return

    const { totalDocs: userCount } = await payload.find({
      collection: 'users',
      where: { email: { equals: DEV_ADMIN_EMAIL } },
      limit: 0,
    })
    if (userCount === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: DEV_ADMIN_EMAIL,
          password: DEV_ADMIN_PASSWORD,
          role: 'admin',
        },
      })
    }

    const { totalDocs: articleCount } = await payload.find({
      collection: 'articles',
      limit: 0,
    })
    if (articleCount === 0) {
      const categories = await Promise.all(
        [
          { title: 'Tech News', slug: 'tech-news' },
          { title: 'AI Tools', slug: 'ai-tools' },
          { title: 'Reviews', slug: 'reviews' },
        ].map((data) => payload.create({ collection: 'categories', data })),
      )

      const sampleArticles = [
        {
          title: 'The Rise of On-Device AI: Why 2026 Is the Tipping Point',
          slug: 'on-device-ai-2026-tipping-point',
          excerpt:
            'Local inference is finally fast enough to matter — here is what changed and why it will reshape how apps are built.',
          category: categories[1].id,
          views: 4210,
          likes: 312,
          sortOrder: 0,
        },
        {
          title: 'We Tested Five Flagship Phones So You Don’t Have To',
          slug: 'flagship-phones-2026-review',
          excerpt:
            'Cameras, battery life, and the software quirks that actually matter after two weeks of daily use.',
          category: categories[2].id,
          views: 2870,
          likes: 198,
          sortOrder: 1,
        },
        {
          title: 'Inside the Chip Shortage That Wasn’t: What Actually Happened',
          slug: 'chip-shortage-retrospective',
          excerpt:
            'A look back at supply chain panic, and the quieter, more durable shifts it left behind.',
          category: categories[0].id,
          views: 1985,
          likes: 143,
          sortOrder: 2,
        },
      ]

      for (const data of sampleArticles) {
        await payload.create({
          collection: 'articles',
          data: {
            ...data,
            _status: 'published',
            // ProseMirror JSON — the format the custom admin's TipTap editor
            // reads and writes. See design decision 3.
            content: paragraphsToDocument([data.excerpt]),
          },
        })
      }
    }
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      config: {
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
