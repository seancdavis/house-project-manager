interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeStyles = {
  sm: { spinner: '16px', text: '0.875rem' },
  md: { spinner: '24px', text: '0.9375rem' },
  lg: { spinner: '32px', text: '1rem' },
};

export function Loading({ size = 'md', text }: LoadingProps) {
  const { spinner, text: fontSize } = sizeStyles[size];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: spinner,
          height: spinner,
          border: '2px solid var(--color-stone-200)',
          borderTopColor: 'var(--color-primary-500)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && (
        <span style={{ fontSize, color: 'var(--color-stone-500)' }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
