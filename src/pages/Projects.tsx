import { useState } from 'react';
import { Plus, FolderKanban, CheckCircle2 } from 'lucide-react';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Card, Button, EmptyState, Modal, PageLoading } from '../components/ui';
import type { ProjectInput } from '../types';

export function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (data: ProjectInput) => {
    createProject.mutate(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  if (isLoading) return <PageLoading />;
  if (error) return <div>Error: {error.message}</div>;

  const activeProjects = projects?.filter(p => p.status !== 'completed') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Projects</h1>
          <p style={{ color: 'var(--color-stone-500)', fontSize: '1.0625rem' }}>
            Manage and track all your home improvement projects
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={18} />}>
          New Project
        </Button>
      </div>

      {/* Modal for new project */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Project" size="md">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Empty State */}
      {activeProjects.length === 0 && completedProjects.length === 0 && (
        <Card>
          <EmptyState
            icon={<FolderKanban size={28} />}
            title="No projects yet"
            description="Create your first project to start tracking your home improvements"
            action={
              <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
                Create Project
              </Button>
            }
          />
        </Card>
      )}

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
    </div>
  );
}
