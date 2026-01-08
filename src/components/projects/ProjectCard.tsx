import { Link } from 'react-router-dom';
import { useMembers } from '../../hooks/useMembers';
import type { Project } from '../../types';

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const TYPE_LABELS = {
  diy: 'DIY',
  contractor: 'Contractor',
  handyman: 'Handyman',
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { data: members } = useMembers();
  const owner = members?.find(m => m.id === project.ownerId);
  const implementer = members?.find(m => m.id === project.implementerId);

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link
            to={`/projects/${project.id}`}
            style={{ fontSize: '1.125rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}
          >
            {project.title}
          </Link>
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            {TYPE_LABELS[project.type]} · {STATUS_LABELS[project.status]}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {owner && (
            <div
              title={`Owner: ${owner.name}`}
              style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                backgroundColor: owner.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: 'bold',
              }}
            >
              {owner.initials}
            </div>
          )}
        </div>
      </div>
      {project.description && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#444' }}>
          {project.description}
        </p>
      )}
      {implementer && (
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
          Implementer: {implementer.name}
        </div>
      )}
    </div>
  );
}
