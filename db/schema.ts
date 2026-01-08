import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'family' | 'contractor'
  initials: text('initials').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'diy' | 'contractor' | 'handyman'
  status: text('status').notNull().default('not_started'),
  ownerId: uuid('owner_id').references(() => members.id),
  implementerId: uuid('implementer_id').references(() => members.id),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('todo'),
  assigneeId: uuid('assignee_id').references(() => members.id),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});
