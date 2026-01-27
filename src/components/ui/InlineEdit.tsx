import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './Button';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isPending?: boolean;
  variant?: 'default' | 'title';
}

export function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit...',
  required = false,
  disabled = false,
  isPending = false,
  variant = 'default',
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Sync editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (required && !editValue.trim()) return;
    onSave(editValue.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing && !disabled) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          style={{
            flex: 1,
            padding: variant === 'title' ? '4px 8px' : '8px 12px',
            border: '1px solid var(--color-stone-200)',
            borderRadius: variant === 'title' ? 'var(--radius-sm)' : 'var(--radius-md)',
            fontSize: variant === 'title' ? '1.0625rem' : '0.9375rem',
            fontWeight: variant === 'title' ? 600 : 'normal',
            fontFamily: 'var(--font-body)',
          }}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="sm"
          variant="primary"
          icon={<Check size={14} />}
          onClick={handleSave}
          disabled={isPending || (required && !editValue.trim())}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<X size={14} />}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (variant === 'title') {
    return (
      <span
        onClick={() => !disabled && setIsEditing(true)}
        style={{
          cursor: disabled ? 'default' : 'pointer',
        }}
        title={disabled ? undefined : 'Click to edit'}
      >
        {value || placeholder}
      </span>
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      style={{
        padding: '8px 12px',
        backgroundColor: 'var(--color-stone-50)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9375rem',
        color: value ? 'var(--color-stone-700)' : 'var(--color-stone-400)',
        cursor: disabled ? 'default' : 'pointer',
        fontStyle: value ? 'normal' : 'italic',
      }}
    >
      {value || placeholder}
    </div>
  );
}
