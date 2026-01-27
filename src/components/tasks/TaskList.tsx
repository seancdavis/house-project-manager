import { useState } from 'react';
import { Plus, Check, Trash2, ListTodo, GripVertical, Edit2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentUser) return;

    const todoTasks = tasks?.filter(t => t.status !== 'done') || [];
    const oldIndex = todoTasks.findIndex(t => t.id === active.id);
    const newIndex = todoTasks.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(todoTasks, oldIndex, newIndex);
      reorderTasks.mutate(newOrder.map(t => t.id));
    }
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

      {/* Todo Tasks - Sortable */}
      {todoTasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todoTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ marginBottom: '24px' }}>
              {todoTasks.map((task, index) => (
                <SortableTaskItem
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
          </SortableContext>
        </DndContext>
      )}

      {/* Done Tasks - Not sortable */}
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
  disabled?: boolean;
  style?: React.CSSProperties;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

function SortableTaskItem(props: Omit<TaskItemProps, 'dragHandleProps' | 'isDragging'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  disabled,
  style,
  dragHandleProps,
  isDragging,
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
        backgroundColor: isDragging ? 'var(--color-stone-50)' : (isDone ? 'var(--color-stone-50)' : 'var(--bg-card)'),
        borderRadius: 'var(--radius-md)',
        border: isDragging ? '1px solid var(--color-primary-300)' : '1px solid var(--color-stone-100)',
        transition: isDragging ? 'none' : 'all var(--transition-fast)',
        opacity: disabled ? 0.7 : 1,
        boxShadow: isDragging ? 'var(--shadow-md)' : undefined,
        ...style,
      }}
    >
      {/* Drag Handle - only for non-done tasks when not disabled */}
      {!isDone && !disabled && dragHandleProps && (
        <div
          {...dragHandleProps}
          style={{
            cursor: 'grab',
            color: 'var(--color-stone-300)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'none',
          }}
        >
          <GripVertical size={16} />
        </div>
      )}

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
