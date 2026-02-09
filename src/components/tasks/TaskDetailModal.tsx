import { useNavigate, useParams } from 'react-router-dom';
import { useTasks, useUpdateTask } from '../../hooks/useTasks';
import { useMembers } from '../../hooks/useMembers';
import { useCurrentUser } from '../../context/UserContext';
import { NotesSection } from '../notes/NotesSection';
import { Modal, Avatar, StatusBadge, Select } from '../ui';
import type { Task, TaskStatus } from '../../types';

interface TaskDetailModalProps {
  projectId: string;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskDetailModal({ projectId }: TaskDetailModalProps) {
  const { taskId } = useParams<{ taskId?: string }>();
  const navigate = useNavigate();
  const { data: tasks } = useTasks(projectId);
  const { data: members } = useMembers();
  const { currentUser } = useCurrentUser();
  const updateTask = useUpdateTask(projectId);

  const task = taskId ? tasks?.find((t: Task) => t.id === taskId) || null : null;

  const handleClose = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!task || !currentUser) return;
    updateTask.mutate({ id: task.id, data: { status: newStatus as TaskStatus } });
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    if (!task || !currentUser) return;
    updateTask.mutate({ id: task.id, data: { assigneeId: newAssigneeId || undefined } });
  };

  const assignee = task?.assigneeId ? members?.find(m => m.id === task.assigneeId) : null;

  return (
    <Modal
      isOpen={!!task}
      onClose={handleClose}
      title={task?.title || 'Task'}
      size="lg"
    >
      {task && (
        <div>
          {/* Task Details */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            {/* Status */}
            <div style={{ minWidth: '140px' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-stone-500)',
                  marginBottom: '6px',
                }}
              >
                Status
              </div>
              {currentUser ? (
                <Select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              ) : (
                <StatusBadge status={task.status} />
              )}
            </div>

            {/* Assignee */}
            <div style={{ minWidth: '160px' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-stone-500)',
                  marginBottom: '6px',
                }}
              >
                Assignee
              </div>
              {currentUser ? (
                <Select
                  value={task.assigneeId || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members?.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Select>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {assignee ? (
                    <>
                      <Avatar initials={assignee.initials} color={assignee.color} size="sm" />
                      <span style={{ fontWeight: 500 }}>{assignee.name}</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--color-stone-400)' }}>Unassigned</span>
                  )}
                </div>
              )}
            </div>

            {/* Completed date */}
            {task.completedAt && (
              <div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-500)',
                    marginBottom: '6px',
                  }}
                >
                  Completed
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-stone-600)' }}>
                  {new Date(task.completedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div
            style={{
              borderTop: '1px solid var(--color-stone-100)',
              paddingTop: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                marginBottom: '16px',
                color: 'var(--color-stone-700)',
              }}
            >
              Notes
            </h3>
            <NotesSection taskId={task.id} />
          </div>
        </div>
      )}
    </Modal>
  );
}
