import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary-600)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--color-stone-700)',
    border: '1px solid var(--color-stone-200)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-stone-600)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--color-warning)',
    color: 'white',
    border: 'none',
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--color-primary-700)' },
  secondary: { backgroundColor: 'var(--color-stone-50)', borderColor: 'var(--color-stone-300)' },
  ghost: { backgroundColor: 'var(--color-stone-100)' },
  danger: { backgroundColor: '#B91C1C' },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '0.875rem', gap: '6px' },
  md: { padding: '10px 18px', fontSize: '0.9375rem', gap: '8px' },
  lg: { padding: '14px 24px', fontSize: '1rem', gap: '10px' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      style={baseStyles}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}
