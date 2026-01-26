import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-stone-100)',
    color: 'var(--color-stone-700)',
  },
  primary: {
    backgroundColor: 'var(--color-primary-100)',
    color: 'var(--color-primary-800)',
  },
  success: {
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-light)',
    color: 'var(--color-warning)',
  },
  info: {
    backgroundColor: 'var(--color-info-light)',
    color: 'var(--color-info)',
  },
  neutral: {
    backgroundColor: 'var(--color-stone-200)',
    color: 'var(--color-stone-600)',
  },
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'var(--color-stone-400)',
  primary: 'var(--color-primary-500)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  neutral: 'var(--color-stone-500)',
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: '2px 8px', fontSize: '0.75rem' },
  md: { padding: '4px 12px', fontSize: '0.8125rem' },
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
  onClick,
}: BadgeProps) {
  return (
    <span
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : undefined,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[variant],
          }}
        />
      )}
      {children}
    </span>
  );
}

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    not_started: { label: 'Not Started', variant: 'neutral' },
    in_progress: { label: 'In Progress', variant: 'info' },
    on_hold: { label: 'On Hold', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    todo: { label: 'To Do', variant: 'neutral' },
    done: { label: 'Done', variant: 'success' },
  };

  const { label, variant } = config[status] || { label: status, variant: 'default' as BadgeVariant };

  return <Badge variant={variant} dot>{label}</Badge>;
}

export function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    diy: { label: 'DIY', variant: 'primary' },
    contractor: { label: 'Contractor', variant: 'info' },
    handyman: { label: 'Handyman', variant: 'default' },
    family: { label: 'Family', variant: 'primary' },
  };

  const { label, variant } = config[type] || { label: type, variant: 'default' as BadgeVariant };

  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;

  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    low: { label: 'Low Priority', variant: 'neutral' },
    medium: { label: 'Medium Priority', variant: 'info' },
    high: { label: 'High Priority', variant: 'warning' },
  };

  const { label, variant } = config[priority] || { label: priority, variant: 'default' as BadgeVariant };

  return <Badge variant={variant}>{label}</Badge>;
}
