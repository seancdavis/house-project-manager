import { useForm } from 'react-hook-form';
import { Input, Select, InputWrapper, Button, Avatar } from '../ui';
import type { Member, MemberInput } from '../../types';

const DEFAULT_COLORS = [
  '#B45309', // Amber
  '#059669', // Emerald
  '#0284C7', // Sky
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#DC2626', // Red
  '#EA580C', // Orange
  '#16A34A', // Green
];

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberInput) => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MemberInput>({
    defaultValues: member ? {
      name: member.name,
      type: member.type,
      initials: member.initials,
      color: member.color,
    } : {
      type: 'family',
      color: DEFAULT_COLORS[0],
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DEFAULT_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: color,
                border: selectedColor === color
                  ? '3px solid var(--color-stone-900)'
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (selectedColor !== color) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedColor !== color) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            />
          ))}
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
