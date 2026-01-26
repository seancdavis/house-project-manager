import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { TypeBadge, PriorityBadge, Avatar, Badge } from '../ui';
import type { Project, ProjectStatus } from '../../types';

interface ProjectsKanbanProps {
  projects: Project[];
}

const COLUMNS: { status: ProjectStatus; label: string; color: string }[] = [
  { status: 'not_started', label: 'Not Started', color: 'var(--color-stone-400)' },
  { status: 'in_progress', label: 'In Progress', color: 'var(--color-info)' },
  { status: 'on_hold', label: 'On Hold', color: 'var(--color-warning)' },
  { status: 'completed', label: 'Completed', color: 'var(--color-success)' },
];

export function ProjectsKanban({ projects }: ProjectsKanbanProps) {
  const { data: members } = useMembers();

  const getMember = (id: string | null) => {
    if (!id || !members) return null;
    return members.find(m => m.id === id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        minHeight: '400px',
      }}
    >
      {COLUMNS.map(column => {
        const columnProjects = getProjectsByStatus(column.status);
        return (
          <div
            key={column.status}
            style={{
              backgroundColor: 'var(--color-stone-50)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: `2px solid ${column.color}`,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: column.color,
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--color-stone-700)' }}>
                {column.label}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.8125rem',
                  color: 'var(--color-stone-400)',
                  fontWeight: 500,
                }}
              >
                {columnProjects.length}
              </span>
            </div>

            {/* Column Cards */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {columnProjects.map(project => {
                const owner = getMember(project.ownerId);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    style={{
                      display: 'block',
                      backgroundColor: 'white',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Card Title */}
                    <h4
                      style={{
                        margin: 0,
                        marginBottom: '8px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--color-stone-900)',
                        lineHeight: 1.3,
                      }}
                    >
                      {project.title}
                    </h4>

                    {/* Badges Row */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '10px',
                      }}
                    >
                      <TypeBadge type={project.type} />
                      <PriorityBadge priority={project.priority} />
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginBottom: '10px',
                        }}
                      >
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

                    {/* Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--color-stone-100)',
                      }}
                    >
                      {owner ? (
                        <Avatar initials={owner.initials} color={owner.color} size="sm" />
                      ) : (
                        <div />
                      )}
                      {project.targetDate && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--color-stone-500)',
                          }}
                        >
                          <Calendar size={12} />
                          {formatDate(project.targetDate)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Empty State */}
              {columnProjects.length === 0 && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-stone-400)',
                    fontSize: '0.875rem',
                    fontStyle: 'italic',
                  }}
                >
                  No projects
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
