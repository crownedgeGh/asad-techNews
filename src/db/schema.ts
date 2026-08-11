import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const linkPreviews = pgTable('link_previews', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  type: text('type').notNull(), // 'video' | 'link' | 'failed'
  title: text('title'),
  description: text('description'),
  image: text('image'),
  siteName: text('site_name'),
  embedUrl: text('embed_url'), // iframe src, for video previews
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  name: text('name'),
  body: text('body').notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  path: text('path').notNull(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'set null' }),
  referrer: text('referrer'),
  device: text('device'), // 'mobile' | 'tablet' | 'desktop'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  authorId: integer('author_id').references(() => users.id),
  category: text('category').notNull(),
  published: boolean('published').default(false).notNull(),
  trending: boolean('trending').default(false).notNull(),
  featured: boolean('featured').default(false).notNull(),
  credit: text('credit'),
  views: integer('views').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
