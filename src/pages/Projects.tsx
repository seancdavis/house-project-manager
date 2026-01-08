import { useState } from 'react';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const activeProjects = projects?.filter(p => p.status !== 'completed') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Projects</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '0.5rem 1rem' }}>
          Add Project
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h2>New Project</h2>
          <ProjectForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {activeProjects.length === 0 && completedProjects.length === 0 && (
        <p>No projects yet. Add one to get started.</p>
      )}

      {activeProjects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Active ({activeProjects.length})</h2>
          {activeProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {completedProjects.length > 0 && (
        <div>
          <h2>Completed ({completedProjects.length})</h2>
          {completedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
