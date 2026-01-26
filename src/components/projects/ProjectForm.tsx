import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { useTags, useCreateTag } from '../../hooks/useTags';
import { Input, Textarea, Select, InputWrapper, Button, Badge } from '../ui';
import type { Project, ProjectInput } from '../../types';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectInput) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const { data: members } = useMembers();
  const { data: allTags } = useTags();
  const createTag = useCreateTag();

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    project?.tags?.map(t => t.id) || []
  );
  const [newTagName, setNewTagName] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectInput>({
    defaultValues: project ? {
      title: project.title,
      description: project.description || '',
      type: project.type,
      status: project.status,
      priority: project.priority || undefined,
      ownerId: project.ownerId || '',
      implementerId: project.implementerId || '',
      targetDate: project.targetDate ? project.targetDate.split('T')[0] : '',
      estimatedBudget: project.estimatedBudget ? project.estimatedBudget / 100 : undefined,
      actualBudget: project.actualBudget ? project.actualBudget / 100 : undefined,
    } : {
      type: 'diy',
      status: 'not_started',
    },
  });

  const handleFormSubmit = (data: ProjectInput) => {
    onSubmit({
      ...data,
      estimatedBudget: data.estimatedBudget ? Math.round(Number(data.estimatedBudget) * 100) : null,
      actualBudget: data.actualBudget ? Math.round(Number(data.actualBudget) * 100) : null,
      tagIds: selectedTagIds,
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag.mutateAsync(newTagName.trim());
    setSelectedTagIds(prev => [...prev, tag.id]);
    setNewTagName('');
  };

  const selectedTags = allTags?.filter(t => selectedTagIds.includes(t.id)) || [];
  const availableTags = allTags?.filter(t => !selectedTagIds.includes(t.id)) || [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
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

        <InputWrapper label="Priority">
          <Select {...register('priority')}>
            <option value="">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </InputWrapper>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <InputWrapper label="Estimated Budget ($)">
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register('estimatedBudget')}
            placeholder="0.00"
          />
        </InputWrapper>

        <InputWrapper label="Actual Budget ($)">
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register('actualBudget')}
            placeholder="0.00"
          />
        </InputWrapper>
      </div>

      <InputWrapper label="Tags">
        <div className="tag-selector">
          {selectedTags.length > 0 && (
            <div className="selected-tags">
              {selectedTags.map(tag => (
                <Badge key={tag.id} variant="primary" className="tag-badge">
                  {tag.name}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => toggleTag(tag.id)}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {availableTags.length > 0 && (
            <div className="available-tags">
              {availableTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="default"
                  className="tag-badge clickable"
                  onClick={() => toggleTag(tag.id)}
                >
                  <Plus size={12} />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="new-tag-input">
            <Input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Create new tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTag.isPending}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
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
