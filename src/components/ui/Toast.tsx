import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: 'var(--color-success-light)',
    border: 'var(--color-success)',
    icon: 'var(--color-success)',
  },
  error: {
    bg: 'var(--color-warning-light)',
    border: 'var(--color-warning)',
    icon: 'var(--color-warning)',
  },
  info: {
    bg: 'var(--color-info-light)',
    border: 'var(--color-info)',
    icon: 'var(--color-info)',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '400px',
      }}
    >
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        const colorScheme = colors[toast.type];

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: colorScheme.bg,
              border: `1px solid ${colorScheme.border}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            <Icon size={18} style={{ color: colorScheme.icon, flexShrink: 0, marginTop: '1px' }} />
            <span
              style={{
                flex: 1,
                fontSize: '0.875rem',
                color: 'var(--color-stone-700)',
                lineHeight: 1.4,
              }}
            >
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: 'var(--color-stone-400)',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
