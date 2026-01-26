import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  User,
  MessageSquare,
  Image,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import { Avatar, Loading, EmptyState } from '../ui';
import type { Activity, ActivityAction, ActivityEntityType } from '../../types';

interface ActivityFeedProps {
  projectId?: string;
  limit?: number;
}

const ENTITY_ICONS: Record<ActivityEntityType, typeof FolderKanban> = {
  project: FolderKanban,
  task: CheckSquare,
  member: User,
  note: MessageSquare,
  photo: Image,
};

const ACTION_ICONS: Record<ActivityAction, typeof Plus> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  completed: CheckCircle2,
};

const ACTION_COLORS: Record<ActivityAction, string> = {
  created: 'var(--color-success)',
  updated: 'var(--color-info)',
  deleted: 'var(--color-warning)',
  completed: 'var(--color-success)',
};

const ACTION_BG_COLORS: Record<ActivityAction, string> = {
  created: 'var(--color-success-light)',
  updated: 'var(--color-info-light)',
  deleted: 'var(--color-warning-light)',
  completed: 'var(--color-success-light)',
};

function formatActionText(activity: Activity): string {
  const { action, entityType, entityTitle } = activity;

  const actionVerbs: Record<ActivityAction, string> = {
    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
    completed: 'completed',
  };

  const entityLabels: Record<ActivityEntityType, string> = {
    project: 'project',
    task: 'task',
    member: 'member',
    note: 'note',
    photo: 'photo',
  };

  const verb = actionVerbs[action] || action;
  const entity = entityLabels[entityType] || entityType;

  if (entityTitle) {
    return `${verb} ${entity} "${entityTitle}"`;
  }
  return `${verb} a ${entity}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityFeed({ projectId, limit = 10 }: ActivityFeedProps) {
  const { data: activities, isLoading } = useActivities({ projectId, limit });

  if (isLoading) return <Loading size="sm" text="Loading activity..." />;

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={24} />}
        title="No activity yet"
        description="Actions like creating projects, completing tasks, and adding photos will appear here"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {activities.map((activity, index) => {
        const EntityIcon = ENTITY_ICONS[activity.entityType] || FolderKanban;
        const ActionIcon = ACTION_ICONS[activity.action] || Edit;
        const actionColor = ACTION_COLORS[activity.action];
        const actionBgColor = ACTION_BG_COLORS[activity.action];

        return (
          <div
            key={activity.id}
            className="animate-slide-in-up"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 0',
              borderBottom: index < activities.length - 1 ? '1px solid var(--color-stone-100)' : undefined,
              animationDelay: `${index * 30}ms`,
            }}
          >
            {/* Avatar or icon */}
            {activity.actor ? (
              <Avatar
                initials={activity.actor.initials}
                color={activity.actor.color}
                size="sm"
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-stone-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EntityIcon size={14} color="var(--color-stone-400)" />
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {/* Action icon badge */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: actionBgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActionIcon size={10} color={actionColor} />
                </div>

                <span style={{ fontWeight: 500, color: 'var(--color-stone-800)' }}>
                  {activity.actor?.name || 'Someone'}
                </span>
                <span style={{ color: 'var(--color-stone-500)' }}>
                  {formatActionText(activity)}
                </span>
              </div>

              {/* Project link if not on project page */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                {activity.project && !projectId && (
                  <Link
                    to={`/projects/${activity.project.id}`}
                    style={{
                      color: 'var(--color-primary-600)',
                      textDecoration: 'none',
                    }}
                  >
                    {activity.project.title}
                  </Link>
                )}
                <span style={{ color: 'var(--color-stone-400)' }}>
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
