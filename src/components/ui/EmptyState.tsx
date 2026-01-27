import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-stone-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-stone-400)',
            marginBottom: '16px',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-stone-700)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-stone-500)',
            marginBottom: action ? '20px' : 0,
            maxWidth: '320px',
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
