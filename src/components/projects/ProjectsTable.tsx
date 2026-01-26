import { Link } from 'react-router-dom';
import { useMembers } from '../../hooks/useMembers';
import { StatusBadge, TypeBadge, PriorityBadge, Avatar, Badge } from '../ui';
import type { Project } from '../../types';

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const { data: members } = useMembers();

  const getMember = (id: string | null) => {
    if (!id || !members) return null;
    return members.find(m => m.id === id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBudget = (cents: number | null) => {
    if (cents === null) return '—';
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '2px solid var(--color-stone-200)',
              textAlign: 'left',
            }}
          >
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Project
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Status
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Type
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Priority
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Owner
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Target Date
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-stone-600)' }}>
              Budget
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => {
            const owner = getMember(project.ownerId);
            return (
              <tr
                key={project.id}
                style={{
                  borderBottom: '1px solid var(--color-stone-100)',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-stone-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <Link
                    to={`/projects/${project.id}`}
                    style={{
                      color: 'var(--color-stone-900)',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {project.title}
                    {project.tags && project.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {project.tags.slice(0, 2).map(tag => (
                          <Badge key={tag.id} variant="default" size="sm">
                            {tag.name}
                          </Badge>
                        ))}
                        {project.tags.length > 2 && (
                          <Badge variant="default" size="sm">+{project.tags.length - 2}</Badge>
                        )}
                      </div>
                    )}
                  </Link>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={project.status} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <TypeBadge type={project.type} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <PriorityBadge priority={project.priority} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {owner ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar initials={owner.initials} color={owner.color} size="sm" />
                      <span>{owner.name}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-stone-400)' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-stone-600)' }}>
                  {formatDate(project.targetDate)}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-stone-600)' }}>
                  {formatBudget(project.estimatedBudget)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
