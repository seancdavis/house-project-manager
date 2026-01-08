import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useMembers } from '../hooks/useMembers';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskList } from '../components/tasks/TaskList';
import type { ProjectInput } from '../types';

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const TYPE_LABELS = {
  diy: 'DIY',
  contractor: 'Contractor',
  handyman: 'Handyman Session',
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id!);
  const { data: members } = useMembers();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  const owner = members?.find(m => m.id === project.ownerId);
  const implementer = members?.find(m => m.id === project.implementerId);

  const handleUpdate = (data: ProjectInput) => {
    updateProject.mutate({ id: project.id, data }, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this project and all its tasks?')) {
      deleteProject.mutate(project.id, {
        onSuccess: () => navigate('/projects'),
      });
    }
  };

  if (isEditing) {
    return (
      <div>
        <h1>Edit Project</h1>
        <ProjectForm project={project} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/projects">&larr; Back to Projects</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{project.title}</h1>
          <div style={{ color: '#666' }}>
            {TYPE_LABELS[project.type]} · {STATUS_LABELS[project.status]}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsEditing(true)} style={{ padding: '0.5rem 1rem' }}>
            Edit
          </button>
          <button onClick={handleDelete} style={{ padding: '0.5rem 1rem' }}>
            Delete
          </button>
        </div>
      </div>

      {project.description && (
        <p style={{ marginTop: '1rem' }}>{project.description}</p>
      )}

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <strong>Owner:</strong> {owner?.name || 'Unassigned'}
        </div>
        <div>
          <strong>Implementer:</strong> {implementer?.name || 'Unassigned'}
        </div>
        {project.targetDate && (
          <div>
            <strong>Target Date:</strong> {new Date(project.targetDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Tasks</h2>
        <TaskList projectId={project.id} />
      </div>
    </div>
  );
}
