# Claude Code Context

This file provides context for AI assistants working on this codebase.

## Project Overview

House Project Manager is a React application for tracking home improvement projects. It uses Netlify Functions for the backend and PostgreSQL (via Netlify Neon) for the database.

## Design System

The application uses a custom "Warm Workshop" design aesthetic:

### CSS Variables (defined in `src/index.css`)

- **Primary colors**: `--color-primary-*` (warm amber palette)
- **Neutral colors**: `--color-stone-*` (warm stone grays)
- **Accent colors**: `--color-success`, `--color-warning`, `--color-info`
- **Backgrounds**: `--bg-cream`, `--bg-warm`, `--bg-card`
- **Typography**: `--font-display` (DM Serif Display), `--font-body` (DM Sans)
- **Spacing**: `--radius-*`, `--shadow-*`, `--transition-*`

### UI Components (`src/components/ui/`)

Always use these reusable components rather than creating inline styles:

- `Button` - Primary, secondary, ghost, danger variants
- `Card` - Container with optional hover effect
- `Input`, `Textarea`, `Select` - Form inputs with consistent styling
- `InputWrapper` - Label + input + error message wrapper
- `Avatar` - User avatar with initials and color
- `Badge`, `StatusBadge`, `TypeBadge`, `PriorityBadge` - Status, type, and priority indicators
- `Modal` - Dialog with backdrop
- `EmptyState` - Placeholder for empty lists
- `Loading`, `PageLoading` - Loading indicators

### Icons

Use Lucide React for all icons. Import from `lucide-react`.

## Data Flow

1. **API Client** (`src/api/client.ts`): Base HTTP functions (get, post, put, del)
2. **React Query Hooks** (`src/hooks/`): Data fetching and mutations
3. **Components**: Use hooks to access and mutate data

## Key Patterns

### URL-based State

**IMPORTANT**: Any action that adjusts a view (sorting, filtering) should result in a URL change so it can be shared and bookmarked.

Use the `useUrlState` hook from `src/hooks/useUrlState.ts`:
```tsx
const [filters, setFilters, resetFilters] = useProjectFilters();
// filters.status, filters.type, filters.owner, filters.sort, filters.order, filters.view
// setFilters({ status: 'in_progress' }) // updates URL with ?status=in_progress
// resetFilters() // clears all filters
```

Available hooks:
- `useProjectFilters()` - For project list filtering/sorting/view
- `useMemberFilters()` - For member list filtering/sorting
- `useUrlState(defaults)` - Generic hook for custom URL state

### Project Views

The Projects page supports three views, controlled via URL parameter `?view=`:
- `cards` (default): Card layout with Active/Completed sections
- `table`: Tabular view with sortable columns
- `kanban`: Board view grouped by status (Not Started, In Progress, On Hold, Completed)

Components:
- `ProjectCard`: Used in cards view
- `ProjectsTable`: Table component for list view
- `ProjectsKanban`: Board component for kanban view

### User Context & Authentication

The current user is stored in `UserContext` and persisted to localStorage. Access via `useCurrentUser()` hook.

**IMPORTANT**: All mutation actions (create, edit, delete) require a signed-in user. Use:
- `RequireAuthButton` component for action buttons that need auth
- Check `currentUser` before executing mutations
- Show sign-in prompts when auth is required but user is not signed in

The login flow uses `/login` route where users select their profile from family members.

### Form Handling

Use `react-hook-form` for all forms. Pattern:
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<FormType>();
```

### Database Schema

Tables defined in `db/schema.ts`:
- `members`: id, name, type, initials, color
- `projects`: id, title, description, type, status, priority, ownerId, implementerId, targetDate, estimatedBudget, actualBudget, completedAt
- `tasks`: id, projectId, title, status, assigneeId, sortOrder
- `tags`: id, name (unique)
- `projectTags`: projectId, tagId (junction table for many-to-many relationship)

### Budget Fields

Budget values are stored in **cents** (integers) to avoid floating point issues. When displaying:
- Divide by 100 for display: `(project.estimatedBudget / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })`
- Multiply by 100 when saving: `Math.round(inputValue * 100)`

### Tags

Projects can have multiple open-ended tags. The `useTags` hook provides:
- `useTags()`: Fetch all tags
- `useCreateTag()`: Create a new tag

Tags are normalized to lowercase when created. The ProjectForm component handles tag selection and creation.

### Project Photos

Photos are stored in Netlify Blobs and served via Netlify Image CDN. The `photos` table stores metadata:
- `blobKey`: Reference to the file in Netlify Blobs
- `projectId`: Associated project
- `filename`, `mimeType`, `size`: File metadata
- `caption`: Optional caption
- `uploadedById`: Who uploaded it

Use the `usePhotos` hook:
- `usePhotos(projectId)`: Get photos for a project
- `useUploadPhoto()`: Upload a new photo
- `useDeletePhoto()`: Delete a photo

Photo URLs are constructed as: `/.netlify/images?url=/.netlify/blobs/project-photos/${blobKey}`

The `PhotoGallery` component in `src/components/photos/PhotoGallery.tsx` handles upload and display.

### Notes

Notes are a comments-like system for projects (and can be extended to tasks). Each note has:
- `content`: The note text
- `authorId`: Who wrote the note
- `projectId` or `taskId`: What the note is attached to

Use the `useNotes` hooks:
- `useProjectNotes(projectId)`: Get notes for a project
- `useTaskNotes(taskId)`: Get notes for a task
- `useCreateNote()`: Create a new note
- `useUpdateNote()`: Edit a note
- `useDeleteNote()`: Delete a note

Users can only edit/delete their own notes. The `NotesSection` component handles display and CRUD operations.

### Tasks

Tasks are ordered by `sortOrder` field. The TaskList component supports:
- **Inline editing**: Click on task title to edit, press Enter to save or Escape to cancel
- **Reordering**: Use up/down arrows to reorder tasks within the same list
- **Status toggle**: Click checkbox to mark complete/incomplete
- **Delete**: Remove tasks with delete button

Reordering uses batch update via `PUT /api/tasks/reorder` with `{ taskIds: string[] }`.

### Members Color Picker

The MemberForm includes an enhanced color picker with:
- **Preset palette**: 16 colors organized by category (Warm, Cool, Rich, Earth)
- **Custom color**: Native color picker + hex input for any color
- **Live preview**: Avatar updates in real-time as color changes

Colors are stored as hex values (e.g., `#B45309`).

### Activity Feed

The activity feed tracks CRUD operations across the application. The `activities` table stores:
- `action`: 'created' | 'updated' | 'deleted' | 'completed'
- `entityType`: 'project' | 'task' | 'member' | 'note' | 'photo'
- `entityId`, `entityTitle`: Reference to the affected item
- `projectId`: Related project (for project-scoped activities)
- `actorId`: Who performed the action

To log an activity from a mutation:
```typescript
import { useCreateActivity } from '../hooks/useActivities';

const createActivity = useCreateActivity();
createActivity.mutate({
  action: 'created',
  entityType: 'project',
  entityId: newProject.id,
  entityTitle: newProject.title,
  actorId: currentUser?.id,
});
```

The `ActivityFeed` component displays recent activities with:
- Relative timestamps
- Actor avatars
- Action icons with color-coded badges
- Links to related projects

## File Naming Conventions

- Pages: PascalCase in `src/pages/` (e.g., `ProjectDetail.tsx`)
- Components: PascalCase in `src/components/` (e.g., `ProjectCard.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useProjects.ts`)
- Types: PascalCase interfaces in `src/types/index.ts`

## Testing Changes

Always run `npm run build` after making changes to ensure TypeScript compilation passes.
