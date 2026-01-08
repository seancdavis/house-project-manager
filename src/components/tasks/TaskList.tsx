import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
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
    if (confirm('Delete this task?')) {
      deleteTask.mutate(id);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;

  const todoTasks = tasks?.filter(t => t.status !== 'done') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];

  return (
    <div>
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Add</button>
      </form>

      {todoTasks.length === 0 && doneTasks.length === 0 && (
        <p style={{ color: '#666' }}>No tasks yet.</p>
      )}

      {todoTasks.map(task => (
        <div
          key={task.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            borderBottom: '1px solid #eee',
          }}
        >
          <input
            type="checkbox"
            checked={false}
            onChange={() => handleToggleStatus(task)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ flex: 1 }}>{task.title}</span>
          <button
            onClick={() => handleDelete(task.id)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Delete
          </button>
        </div>
      ))}

      {doneTasks.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ color: '#666' }}>Completed ({doneTasks.length})</h4>
          {doneTasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                borderBottom: '1px solid #eee',
                opacity: 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={true}
                onChange={() => handleToggleStatus(task)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ flex: 1, textDecoration: 'line-through' }}>{task.title}</span>
              <button
                onClick={() => handleDelete(task.id)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
