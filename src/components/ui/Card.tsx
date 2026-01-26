import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingStyles = {
  none: '0',
  sm: '16px',
  md: '24px',
  lg: '32px',
};

export function Card({
  children,
  padding = 'md',
  hover = false,
  style,
  ...props
}: CardProps) {
  const baseStyles: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-stone-100)',
    padding: paddingStyles[padding],
    transition: 'all var(--transition-fast)',
    ...style,
  };

  return (
    <div
      style={baseStyles}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ children, action }: CardHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    }}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '1.25rem',
      color: 'var(--color-stone-900)',
      margin: 0,
    }}>
      {children}
    </h3>
  );
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontSize: '0.875rem',
      color: 'var(--color-stone-500)',
      marginTop: '4px',
      margin: 0,
    }}>
      {children}
    </p>
  );
}
