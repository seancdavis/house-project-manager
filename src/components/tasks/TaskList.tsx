import { useState } from 'react';
import { Plus, Check, Trash2, ListTodo } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { Input, Button, Loading, EmptyState } from '../ui';
import type { Task, TaskStatus } from '../../types';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask.mutate({ title: newTaskTitle.trim() }, {
      onSuccess: () => setNewTaskTitle(''),
    });
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };

  if (isLoading) return <Loading size="sm" text="Loading tasks..." />;

  const todoTasks = tasks?.filter(t => t.status !== 'done') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];

  return (
    <div>
      {/* Add Task Form */}
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

      {/* Empty State */}
      {todoTasks.length === 0 && doneTasks.length === 0 && (
        <EmptyState
          icon={<ListTodo size={24} />}
          title="No tasks yet"
          description="Add tasks to track progress on this project"
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
  style?: React.CSSProperties;
}

function TaskItem({ task, onToggle, onDelete, style }: TaskItemProps) {
  const isDone = task.status === 'done';

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
        ...style,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: 'var(--radius-sm)',
          border: isDone
            ? 'none'
            : '2px solid var(--color-stone-300)',
          backgroundColor: isDone ? 'var(--color-success)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        {isDone && <Check size={14} color="white" strokeWidth={3} />}
      </button>

      {/* Title */}
      <span
        style={{
          flex: 1,
          fontSize: '0.9375rem',
          color: isDone ? 'var(--color-stone-400)' : 'var(--color-stone-700)',
          textDecoration: isDone ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>

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
        <Trash2 size={16} />
      </button>
    </div>
  );
}
