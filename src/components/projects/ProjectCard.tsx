import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { Card, StatusBadge, TypeBadge, Avatar, Badge, TagBadge } from '../ui';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const { data: members } = useMembers();
  const owner = members?.find(m => m.id === project.ownerId);
  const implementer = members?.find(m => m.id === project.implementerId);

  return (
    <Card padding={compact ? 'sm' : 'md'}>
      <Link
        to={`/projects/${project.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title & Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: compact ? '0.9375rem' : '1rem',
                  fontWeight: 600,
                  color: 'var(--color-stone-900)',
                  margin: 0,
                }}
              >
                {project.title}
              </h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <StatusBadge status={project.status} />
                <TypeBadge type={project.type} />
              </div>
            </div>

            {/* Description */}
            {project.description && !compact && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-stone-500)',
                  marginBottom: '12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {project.tags.slice(0, 3).map(tag => (
                  <TagBadge key={tag.id} name={tag.name} size="sm" />
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="default" size="sm">+{project.tags.length - 3}</Badge>
                )}
              </div>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {project.targetDate && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-500)',
                  }}
                >
                  <Calendar size={14} />
                  <span>{new Date(project.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {implementer && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-500)',
                  }}
                >
                  <span>Implementer:</span>
                  <span style={{ color: 'var(--color-stone-700)' }}>{implementer.name}</span>
                </div>
              )}

              {project.updatedAt && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-400)',
                  }}
                >
                  <Clock size={13} />
                  <span>Updated {formatRelativeTime(project.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Avatar & Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {owner && (
              <div title={`Owner: ${owner.name}`}>
                <Avatar
                  initials={owner.initials}
                  color={owner.color}
                  size="sm"
                />
              </div>
            )}
            <ArrowRight
              size={20}
              color="var(--color-stone-300)"
              style={{ transition: 'all var(--transition-fast)' }}
            />
          </div>
        </div>
      </Link>
    </Card>
  );
}
