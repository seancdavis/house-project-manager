import { useForm } from 'react-hook-form';
import { useMembers } from '../../hooks/useMembers';
import type { Project, ProjectInput } from '../../types';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectInput) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const { data: members } = useMembers();
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectInput>({
    defaultValues: project ? {
      title: project.title,
      description: project.description || '',
      type: project.type,
      status: project.status,
      ownerId: project.ownerId || '',
      implementerId: project.implementerId || '',
      targetDate: project.targetDate ? project.targetDate.split('T')[0] : '',
    } : {
      type: 'diy',
      status: 'not_started',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Title
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
        {errors.title && <span style={{ color: 'red' }}>{errors.title.message}</span>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Description
          <textarea
            {...register('description')}
            rows={3}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Type
          <select
            {...register('type')}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="diy">DIY</option>
            <option value="contractor">Contractor</option>
            <option value="handyman">Handyman Session</option>
          </select>
        </label>
      </div>

      {project && (
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Status
            <select
              {...register('status')}
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Owner
          <select
            {...register('ownerId')}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="">Select owner...</option>
            {members?.filter(m => m.type === 'family').map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Implementer
          <select
            {...register('implementerId')}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="">Select implementer...</option>
            {members?.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Target Date
          <input
            type="date"
            {...register('targetDate')}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          {project ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
