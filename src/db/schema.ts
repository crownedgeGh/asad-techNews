import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  authorId: serial('author_id').references(() => users.id),
  category: text('category').notNull(),
  published: boolean('published').default(false).notNull(),
  views: integer('views').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
