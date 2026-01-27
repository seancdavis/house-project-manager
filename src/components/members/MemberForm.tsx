import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Shuffle } from 'lucide-react';
import { Input, Select, InputWrapper, Button, Avatar } from '../ui';
import type { Member, MemberInput } from '../../types';

// Colors for random selection
const RANDOM_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#CA8A04', // Warm
  '#059669', '#0D9488', '#0284C7', '#2563EB', // Cool
  '#7C3AED', '#9333EA', '#DB2777', '#E11D48', // Rich
  '#B45309', '#78716C', '#525252', '#374151', // Earth
];

function getRandomColor(): string {
  return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
}

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberInput) => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MemberInput>({
    defaultValues: member ? {
      name: member.name,
      type: member.type,
      initials: member.initials,
      color: member.color,
    } : {
      type: 'family',
      color: getRandomColor(),
    },
  });

  const selectedColor = watch('color');
  const watchedName = watch('name');
  const watchedInitials = watch('initials');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!member) {
      const initials = value
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      setValue('initials', initials);
    }
  };

  const handleRandomColor = () => {
    setValue('color', getRandomColor());
  };

  const handleColorBoxClick = () => {
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('color', e.target.value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Preview */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          padding: '24px',
          backgroundColor: 'var(--color-stone-50)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar initials={watchedInitials || '?'} color={selectedColor} size="xl" />
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--color-stone-800)' }}>
              {watchedName || 'Member Name'}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-stone-500)' }}>
              Preview
            </div>
          </div>
        </div>
      </div>

      <InputWrapper label="Name" error={errors.name?.message}>
        <Input
          type="text"
          {...register('name', { required: 'Name is required' })}
          onChange={(e) => {
            register('name').onChange(e);
            handleNameChange(e);
          }}
          placeholder="Enter full name"
        />
      </InputWrapper>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <InputWrapper label="Type">
          <Select {...register('type')}>
            <option value="family">Family</option>
            <option value="contractor">Contractor</option>
          </Select>
        </InputWrapper>

        <InputWrapper label="Initials" error={errors.initials?.message}>
          <Input
            type="text"
            maxLength={2}
            {...register('initials', { required: 'Initials required' })}
            placeholder="AB"
            style={{ textTransform: 'uppercase' }}
          />
        </InputWrapper>
      </div>

      <InputWrapper label="Color">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Color box - click to open picker */}
          <button
            type="button"
            onClick={handleColorBoxClick}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: selectedColor,
              border: '2px solid var(--color-stone-200)',
              cursor: 'pointer',
              padding: 0,
            }}
            title="Click to choose color"
          />
          {/* Hidden color input */}
          <input
            ref={colorInputRef}
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
          {/* Random button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRandomColor}
            icon={<Shuffle size={16} />}
          >
            Random
          </Button>
        </div>
        <input type="hidden" {...register('color', { required: true })} />
      </InputWrapper>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {member ? 'Update Member' : 'Create Member'}
        </Button>
      </div>
    </form>
  );
}
