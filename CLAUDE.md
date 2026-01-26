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
- `Badge`, `StatusBadge`, `TypeBadge` - Status and type indicators
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

**IMPORTANT**: Any action that adjusts a view (sorting, filtering) should result in a URL change so it can be shared and bookmarked. Use React Router's `useSearchParams` for query parameters.

### User Context

The current user is stored in `UserContext` and persisted to localStorage. Access via `useCurrentUser()` hook.

### Form Handling

Use `react-hook-form` for all forms. Pattern:
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<FormType>();
```

### Database Schema

Tables defined in `db/schema.ts`:
- `members`: id, name, type, initials, color
- `projects`: id, title, description, type, status, ownerId, implementerId, targetDate
- `tasks`: id, projectId, title, status, assigneeId, sortOrder

## File Naming Conventions

- Pages: PascalCase in `src/pages/` (e.g., `ProjectDetail.tsx`)
- Components: PascalCase in `src/components/` (e.g., `ProjectCard.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useProjects.ts`)
- Types: PascalCase interfaces in `src/types/index.ts`

## Testing Changes

Always run `npm run build` after making changes to ensure TypeScript compilation passes.
