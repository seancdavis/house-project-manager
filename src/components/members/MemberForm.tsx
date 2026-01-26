import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Palette } from 'lucide-react';
import { Input, Select, InputWrapper, Button, Avatar } from '../ui';
import type { Member, MemberInput } from '../../types';

// Extended color palette organized by hue
const COLOR_PALETTE = {
  'Warm': [
    '#DC2626', // Red
    '#EA580C', // Orange
    '#D97706', // Amber
    '#CA8A04', // Yellow
  ],
  'Cool': [
    '#059669', // Emerald
    '#0D9488', // Teal
    '#0284C7', // Sky
    '#2563EB', // Blue
  ],
  'Rich': [
    '#7C3AED', // Violet
    '#9333EA', // Purple
    '#DB2777', // Pink
    '#E11D48', // Rose
  ],
  'Earth': [
    '#B45309', // Brown
    '#78716C', // Stone
    '#525252', // Neutral
    '#374151', // Gray
  ],
};

const ALL_COLORS = Object.values(COLOR_PALETTE).flat();

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberInput) => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState(member?.color || '#B45309');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MemberInput>({
    defaultValues: member ? {
      name: member.name,
      type: member.type,
      initials: member.initials,
      color: member.color,
    } : {
      type: 'family',
      color: ALL_COLORS[0],
    },
  });

  const selectedColor = watch('color');
  const watchedName = watch('name');
  const watchedInitials = watch('initials');
  const isCustomColor = selectedColor && !ALL_COLORS.includes(selectedColor);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Color palette by category */}
          {Object.entries(COLOR_PALETTE).map(([category, colors]) => (
            <div key={category}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-stone-500)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {category}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setValue('color', color);
                      setShowCustomColor(false);
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: color,
                      border: selectedColor === color && !isCustomColor
                        ? '3px solid var(--color-stone-900)'
                        : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      transform: selectedColor === color && !isCustomColor ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: selectedColor === color && !isCustomColor ? 'var(--shadow-md)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedColor !== color || isCustomColor) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedColor !== color || isCustomColor) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Custom color option */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-stone-100)' }}>
            <button
              type="button"
              onClick={() => setShowCustomColor(!showCustomColor)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: showCustomColor || isCustomColor ? 'var(--color-primary-50)' : 'var(--color-stone-50)',
                border: '1px solid var(--color-stone-200)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--color-stone-600)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Palette size={16} />
              Custom Color
              {isCustomColor && (
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: selectedColor,
                    marginLeft: '4px',
                    border: '2px solid white',
                    boxShadow: '0 0 0 1px var(--color-stone-300)',
                  }}
                />
              )}
            </button>

            {showCustomColor && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--color-stone-50)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: 0,
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                        setCustomColor(val);
                      }
                    }}
                    placeholder="#000000"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                      setValue('color', customColor);
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
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
