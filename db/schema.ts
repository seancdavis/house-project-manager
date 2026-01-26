import { pgTable, uuid, text, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';

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
  priority: text('priority'), // 'low' | 'medium' | 'high' | null
  ownerId: uuid('owner_id').references(() => members.id),
  implementerId: uuid('implementer_id').references(() => members.id),
  targetDate: timestamp('target_date'),
  estimatedBudget: integer('estimated_budget'), // in cents
  actualBudget: integer('actual_budget'), // in cents
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

// Tags for projects - stored separately so users can reuse across projects
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Many-to-many relationship between projects and tags
export const projectTags = pgTable('project_tags', {
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.tagId] }),
}));

// Photos for projects - stored in Netlify Blobs
export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  blobKey: text('blob_key').notNull(), // Key in Netlify Blobs store
  filename: text('filename').notNull(), // Original filename
  caption: text('caption'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // File size in bytes
  uploadedById: uuid('uploaded_by_id').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notes for projects and tasks
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => members.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity feed for tracking all CRUD operations
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: text('action').notNull(), // 'created' | 'updated' | 'deleted' | 'completed'
  entityType: text('entity_type').notNull(), // 'project' | 'task' | 'member' | 'note' | 'photo'
  entityId: uuid('entity_id'), // ID of the entity (nullable for deleted items)
  entityTitle: text('entity_title'), // Title/name for display
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }), // Related project if applicable
  actorId: uuid('actor_id').references(() => members.id, { onDelete: 'set null' }), // Who performed the action
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
