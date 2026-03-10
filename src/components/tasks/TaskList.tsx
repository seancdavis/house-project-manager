import { useState } from 'react';
import { Plus, Check, ListTodo, GripVertical, MessageSquare } from 'lucide-react';
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
import { useTasks, useCreateTask, useUpdateTask, useReorderTasks } from '../../hooks/useTasks';
import { useTaskNotes } from '../../hooks/useNotes';
import { useCurrentUser } from '../../context/UserContext';
import { Input, Button, Loading, EmptyState } from '../ui';
import type { Task, TaskStatus } from '../../types';

interface TaskListProps {
  projectId: string;
  onTaskClick?: (taskId: string) => void;
}

export function TaskList({ projectId, onTaskClick }: TaskListProps) {
  const { currentUser } = useCurrentUser();
  const { data: tasks, isLoading } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
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
                  onClick={onTaskClick ? () => onTaskClick(task.id) : undefined}
                  disabled={!currentUser || reorderTasks.isPending}
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
              onClick={onTaskClick ? () => onTaskClick(task.id) : undefined}
              disabled={!currentUser}
              style={{ animationDelay: `${index * 30}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskNoteIndicator({ taskId }: { taskId: string }) {
  const { data: notes } = useTaskNotes(taskId);
  const count = notes?.length ?? 0;
  if (count === 0) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '0.75rem',
        color: 'var(--color-stone-400)',
        flexShrink: 0,
      }}
    >
      <MessageSquare size={13} />
      {count}
    </span>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onClick?: () => void;
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
  onClick,
  disabled,
  style,
  dragHandleProps,
  isDragging,
}: TaskItemProps) {
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

      {/* Title - click to open task modal */}
      <span
        onClick={onClick}
        style={{
          flex: 1,
          fontSize: '0.9375rem',
          color: isDone ? 'var(--color-stone-400)' : 'var(--color-stone-700)',
          textDecoration: isDone ? 'line-through' : 'none',
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {task.title}
      </span>

      {/* Note indicator */}
      <TaskNoteIndicator taskId={task.id} />
    </div>
  );
}
