import { useState, useMemo } from 'react';
import { Plus, FolderKanban, CheckCircle2, Filter, ArrowUpDown, ArrowUp, ArrowDown, X, LayoutGrid, Table, Columns3 } from 'lucide-react';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useMembers } from '../hooks/useMembers';
import { useCurrentUser } from '../context/UserContext';
import { useProjectFilters } from '../hooks/useUrlState';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { ProjectsTable } from '../components/projects/ProjectsTable';
import { ProjectsKanban } from '../components/projects/ProjectsKanban';
import { Card, EmptyState, Modal, PageLoading, Button, Select, ReadOnlyBanner } from '../components/ui';
import type { ProjectInput, Project } from '../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'diy', label: 'DIY' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'handyman', label: 'Handyman' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'title', label: 'Title' },
  { value: 'targetDate', label: 'Target Date' },
];

export function ProjectsPage() {
  const { currentUser } = useCurrentUser();
  const { data: projects, isLoading, error } = useProjects();
  const { data: members } = useMembers();
  const createProject = useCreateProject();
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters, resetFilters] = useProjectFilters();
  const canEdit = !!currentUser;

  const handleCreate = (data: ProjectInput) => {
    createProject.mutate(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let result = [...projects];

    // Apply filters
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.type) {
      result = result.filter(p => p.type === filters.type);
    }
    if (filters.owner) {
      result = result.filter(p => p.ownerId === filters.owner);
    }

    // Apply sorting
    const sortKey = filters.sort || 'createdAt';
    const sortOrder = filters.order || 'desc';

    result.sort((a, b) => {
      let aVal = a[sortKey as keyof Project];
      let bVal = b[sortKey as keyof Project];

      // Handle null values
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      // Compare
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      return 0;
    });

    return result;
  }, [projects, filters]);

  const activeFiltersCount = [filters.status, filters.type, filters.owner].filter(Boolean).length;

  if (isLoading) return <PageLoading />;
  if (error) return <div>Error: {error.message}</div>;

  const familyMembers = members?.filter(m => m.type === 'family') || [];
  const activeProjects = filteredProjects.filter(p => p.status !== 'completed');
  const completedProjects = filteredProjects.filter(p => p.status === 'completed');

  return (
    <div className="animate-fade-in">
      <ReadOnlyBanner />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Projects</h1>
          <p style={{ color: 'var(--color-stone-500)' }}>
            Manage and track all your home improvement projects
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)} icon={<Plus size={18} />}>
            New Project
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card style={{ marginBottom: '24px' }} padding="sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter size={16} />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  padding: '2px 8px',
                  backgroundColor: 'var(--color-primary-100)',
                  color: 'var(--color-primary-700)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} color="var(--color-stone-400)" />
            <Select
              value={filters.sort || 'createdAt'}
              onChange={(e) => setFilters({ sort: e.target.value })}
              style={{ minWidth: '140px', padding: '6px 32px 6px 10px', fontSize: '0.875rem' }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
              style={{ padding: '6px 8px' }}
              title={filters.order === 'asc' ? 'Ascending' : 'Descending'}
            >
              {filters.order === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </Button>
          </div>

          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
              border: '1px solid var(--color-stone-200)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setFilters({ view: 'cards' })}
              style={{
                padding: '6px 10px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: (!filters.view || filters.view === 'cards') ? 'var(--color-primary-100)' : 'transparent',
                color: (!filters.view || filters.view === 'cards') ? 'var(--color-primary-700)' : 'var(--color-stone-500)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
              }}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setFilters({ view: 'table' })}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderLeft: '1px solid var(--color-stone-200)',
                cursor: 'pointer',
                backgroundColor: filters.view === 'table' ? 'var(--color-primary-100)' : 'transparent',
                color: filters.view === 'table' ? 'var(--color-primary-700)' : 'var(--color-stone-500)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
              }}
              title="Table View"
            >
              <Table size={16} />
            </button>
            <button
              onClick={() => setFilters({ view: 'kanban' })}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderLeft: '1px solid var(--color-stone-200)',
                cursor: 'pointer',
                backgroundColor: filters.view === 'kanban' ? 'var(--color-primary-100)' : 'transparent',
                color: filters.view === 'kanban' ? 'var(--color-primary-700)' : 'var(--color-stone-500)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
              }}
              title="Kanban View"
            >
              <Columns3 size={16} />
            </button>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              icon={<X size={14} />}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-stone-100)',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-stone-500)', marginBottom: '4px' }}>
                Status
              </label>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({ status: e.target.value || undefined })}
                style={{ fontSize: '0.875rem' }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-stone-500)', marginBottom: '4px' }}>
                Type
              </label>
              <Select
                value={filters.type || ''}
                onChange={(e) => setFilters({ type: e.target.value || undefined })}
                style={{ fontSize: '0.875rem' }}
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-stone-500)', marginBottom: '4px' }}>
                Owner
              </label>
              <Select
                value={filters.owner || ''}
                onChange={(e) => setFilters({ owner: e.target.value || undefined })}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="">All Owners</option>
                {familyMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Modal for new project */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Project" size="md">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card>
          <EmptyState
            icon={<FolderKanban size={24} />}
            title={activeFiltersCount > 0 ? "No matching projects" : "No projects yet"}
            description={activeFiltersCount > 0
              ? "Try adjusting your filters to see more results"
              : "Create your first project to start tracking your home improvements"}
            action={
              activeFiltersCount > 0 ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : canEdit ? (
                <Button size="sm" onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
                  Create Project
                </Button>
              ) : null
            }
          />
        </Card>
      )}

      {/* Table View */}
      {filteredProjects.length > 0 && filters.view === 'table' && (
        <Card>
          <ProjectsTable projects={filteredProjects} />
        </Card>
      )}

      {/* Kanban View */}
      {filteredProjects.length > 0 && filters.view === 'kanban' && (
        <ProjectsKanban projects={filteredProjects} />
      )}

      {/* Cards View (default) */}
      {filteredProjects.length > 0 && (!filters.view || filters.view === 'cards') && (
        <>
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
                Active Projects
                <span
                  style={{
                    marginLeft: '10px',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-stone-400)',
                    fontWeight: 400,
                  }}
                >
                  {activeProjects.length}
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeProjects.map((project, index) => (
                  <div key={project.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="var(--color-success)" />
                  Completed
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-stone-400)',
                      fontWeight: 400,
                    }}
                  >
                    {completedProjects.length}
                  </span>
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completedProjects.map((project, index) => (
                  <div key={project.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
