import { useForm } from 'react-hook-form';
import type { Member, MemberInput } from '../../types';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

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
      color: COLORS[0],
    },
  });

  const selectedColor = watch('color');

  // Auto-generate initials from name
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
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Name
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            onChange={(e) => {
              register('name').onChange(e);
              handleNameChange(e);
            }}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
        {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Type
          <select
            {...register('type')}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="family">Family</option>
            <option value="contractor">Contractor</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Initials
          <input
            type="text"
            maxLength={2}
            {...register('initials', { required: 'Initials required' })}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
        {errors.initials && <span style={{ color: 'red' }}>{errors.initials.message}</span>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Color</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          {COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: color,
                border: selectedColor === color ? '3px solid black' : '1px solid gray',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <input type="hidden" {...register('color', { required: true })} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          {member ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
