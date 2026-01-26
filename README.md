# House Project Manager

A home improvement project tracking application built with React, TypeScript, and Netlify.

## Features

- **Dashboard**: Overview of project statistics and quick access to active projects
- **Projects**: Create, edit, and track home improvement projects with status management
- **Tasks**: Add and manage tasks within each project
- **Members**: Manage family members and contractors who work on projects
- **Authentication**: Simple user selection for personalized views

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router v7
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Backend**: Netlify Functions
- **Database**: PostgreSQL via Netlify Neon (Drizzle ORM)

## Design System

The application uses a custom "Warm Workshop" design system with:

- **Typography**: DM Serif Display (headings) + DM Sans (body)
- **Colors**: Warm amber primary palette with stone neutrals
- **Components**: Reusable UI components in `src/components/ui/`
  - Button, Card, Input, Select, Textarea
  - Avatar, Badge, StatusBadge, TypeBadge
  - Modal, EmptyState, Loading

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Project Structure

```
src/
├── api/              # API client functions
├── components/
│   ├── layout/       # App layout with sidebar
│   ├── members/      # Member-related components
│   ├── projects/     # Project-related components
│   ├── tasks/        # Task-related components
│   └── ui/           # Reusable UI components
├── context/          # React context (UserContext)
├── hooks/            # React Query hooks
├── pages/            # Route pages
└── types/            # TypeScript interfaces
```

## Deployment

Deployed on Netlify with:
- Automatic builds from git
- Netlify Functions for API
- Netlify Neon for PostgreSQL database
