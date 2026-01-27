import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shuffle, Palette } from 'lucide-react';
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
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColorInput, setCustomColorInput] = useState(member?.color || '#3B82F6');

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
    setShowCustomColor(false);
  };

  const handleApplyCustomColor = () => {
    if (customColorInput.match(/^#[0-9A-Fa-f]{6}$/)) {
      setValue('color', customColorInput);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Color buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRandomColor}
              icon={<Shuffle size={16} />}
            >
              Random
            </Button>
            <Button
              type="button"
              variant={showCustomColor ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowCustomColor(!showCustomColor)}
              icon={<Palette size={16} />}
            >
              Custom
            </Button>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedColor,
                border: '2px solid var(--color-stone-200)',
                marginLeft: '8px',
              }}
            />
          </div>

          {/* Custom color picker */}
          {showCustomColor && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'var(--color-stone-50)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <input
                type="color"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                      setCustomColorInput(val);
                    }
                  }}
                  placeholder="#000000"
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyCustomColor}
              >
                Apply
              </Button>
            </div>
          )}
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
