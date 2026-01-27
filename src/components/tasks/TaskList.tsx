import { useState } from 'react';
import { Plus, Check, Trash2, ListTodo, ChevronUp, ChevronDown, Edit2 } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useReorderTasks } from '../../hooks/useTasks';
import { useCurrentUser } from '../../context/UserContext';
import { Input, Button, Loading, EmptyState } from '../ui';
import type { Task, TaskStatus } from '../../types';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const { currentUser } = useCurrentUser();
  const { data: tasks, isLoading } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const reorderTasks = useReorderTasks(projectId);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentUser) return;
    createTask.mutate({ title: newTaskTitle.trim() }, {
      onSuccess: () => setNewTaskTitle(''),
    });
  };

  const handleToggleStatus = (task: Task) => {
    if (!currentUser) return;
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

  const handleDelete = (id: string) => {
    if (!currentUser) return;
    deleteTask.mutate(id);
  };

  const handleEditTask = (task: Task, newTitle: string) => {
    if (!currentUser || !newTitle.trim()) return;
    updateTask.mutate({ id: task.id, data: { title: newTitle.trim() } });
  };

  const handleMoveUp = (task: Task, tasksList: Task[]) => {
    if (!currentUser) return;
    const currentIndex = tasksList.findIndex(t => t.id === task.id);
    if (currentIndex <= 0) return;

    const newOrder = [...tasksList];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    reorderTasks.mutate(newOrder.map(t => t.id));
  };

  const handleMoveDown = (task: Task, tasksList: Task[]) => {
    if (!currentUser) return;
    const currentIndex = tasksList.findIndex(t => t.id === task.id);
    if (currentIndex >= tasksList.length - 1) return;

    const newOrder = [...tasksList];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    reorderTasks.mutate(newOrder.map(t => t.id));
  };

  if (isLoading) return <Loading size="sm" />;

  const todoTasks = tasks?.filter(t => t.status !== 'done') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];

  return (
    <div>
      {/* Add Task Form */}
      {currentUser && (
        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <Input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
            />
          </div>
          <Button type="submit" icon={<Plus size={18} />} disabled={!newTaskTitle.trim()}>
            Add
          </Button>
        </form>
      )}

      {/* Empty State */}
      {todoTasks.length === 0 && doneTasks.length === 0 && (
        <EmptyState
          icon={<ListTodo size={24} />}
          title="No tasks yet"
          description={currentUser ? "Add tasks to track progress on this project" : "Sign in to add tasks"}
        />
      )}

      {/* Todo Tasks */}
      {todoTasks.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {todoTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggleStatus(task)}
              onDelete={() => handleDelete(task.id)}
              onEdit={(newTitle) => handleEditTask(task, newTitle)}
              onMoveUp={() => handleMoveUp(task, todoTasks)}
              onMoveDown={() => handleMoveDown(task, todoTasks)}
              disabled={!currentUser}
              canMoveUp={index > 0}
              canMoveDown={index < todoTasks.length - 1}
              style={{ animationDelay: `${index * 30}ms` }}
            />
          ))}
        </div>
      )}

      {/* Done Tasks */}
      {doneTasks.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--color-stone-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-stone-100)',
            }}
          >
            Completed ({doneTasks.length})
          </div>
          {doneTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggleStatus(task)}
              onDelete={() => handleDelete(task.id)}
              onEdit={(newTitle) => handleEditTask(task, newTitle)}
              disabled={!currentUser}
              style={{ animationDelay: `${index * 30}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (newTitle: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  disabled?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  style?: React.CSSProperties;
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  disabled,
  canMoveUp,
  canMoveDown,
  style,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const isDone = task.status === 'done';

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onEdit(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className="animate-slide-in-up"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        marginBottom: '8px',
        backgroundColor: isDone ? 'var(--color-stone-50)' : 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-stone-100)',
        transition: 'all var(--transition-fast)',
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={disabled}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: 'var(--radius-sm)',
          border: isDone
            ? 'none'
            : '2px solid var(--color-stone-300)',
          backgroundColor: isDone ? 'var(--color-success)' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        {isDone && <Check size={14} color="white" strokeWidth={3} />}
      </button>

      {/* Title - editable */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            flex: 1,
            fontSize: '0.9375rem',
            padding: '4px 8px',
            border: '1px solid var(--color-primary-300)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
      ) : (
        <span
          onClick={!disabled && !isDone ? () => setIsEditing(true) : undefined}
          style={{
            flex: 1,
            fontSize: '0.9375rem',
            color: isDone ? 'var(--color-stone-400)' : 'var(--color-stone-700)',
            textDecoration: isDone ? 'line-through' : 'none',
            cursor: !disabled && !isDone ? 'text' : 'default',
          }}
        >
          {task.title}
        </span>
      )}

      {/* Action Buttons */}
      {!disabled && !isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {/* Reorder buttons - only for non-done tasks */}
          {!isDone && onMoveUp && onMoveDown && (
            <>
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: canMoveUp ? 'pointer' : 'not-allowed',
                  color: canMoveUp ? 'var(--color-stone-400)' : 'var(--color-stone-200)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: canMoveDown ? 'pointer' : 'not-allowed',
                  color: canMoveDown ? 'var(--color-stone-400)' : 'var(--color-stone-200)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronDown size={16} />
              </button>
            </>
          )}

          {/* Edit button */}
          {!isDone && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: 'var(--color-stone-300)',
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary-600)';
                e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-stone-300)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Edit2 size={14} />
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--color-stone-300)',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-warning)';
              e.currentTarget.style.backgroundColor = 'var(--color-warning-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-stone-300)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
