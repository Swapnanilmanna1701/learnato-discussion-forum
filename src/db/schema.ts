import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const replies = sqliteTable('replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  author: text('author').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  parentReplyId: integer('parent_reply_id').references(() => replies.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});