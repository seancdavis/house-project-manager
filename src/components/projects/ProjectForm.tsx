import { useForm } from 'react-hook-form';
import { useMembers } from '../../hooks/useMembers';
import { Input, Textarea, Select, InputWrapper, Button } from '../ui';
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
      <InputWrapper label="Title" error={errors.title?.message}>
        <Input
          type="text"
          {...register('title', { required: 'Title is required' })}
          placeholder="e.g., Kitchen Renovation"
        />
      </InputWrapper>

      <InputWrapper label="Description">
        <Textarea
          {...register('description')}
          placeholder="Describe the project scope and goals..."
          rows={3}
        />
      </InputWrapper>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <InputWrapper label="Type">
          <Select {...register('type')}>
            <option value="diy">DIY</option>
            <option value="contractor">Contractor</option>
            <option value="handyman">Handyman Session</option>
          </Select>
        </InputWrapper>

        {project && (
          <InputWrapper label="Status">
            <Select {...register('status')}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </Select>
          </InputWrapper>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <InputWrapper label="Owner">
          <Select {...register('ownerId')}>
            <option value="">Select owner...</option>
            {members?.filter(m => m.type === 'family').map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </Select>
        </InputWrapper>

        <InputWrapper label="Implementer">
          <Select {...register('implementerId')}>
            <option value="">Select implementer...</option>
            {members?.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </Select>
        </InputWrapper>
      </div>

      <InputWrapper label="Target Date">
        <Input type="date" {...register('targetDate')} />
      </InputWrapper>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
