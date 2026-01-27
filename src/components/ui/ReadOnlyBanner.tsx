import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useCurrentUser } from '../../context/UserContext';
import { Button } from './Button';

/**
 * Shows a banner prompting users to sign in when viewing in read-only mode.
 * Returns null if user is already signed in.
 */
export function ReadOnlyBanner() {
  const { currentUser } = useCurrentUser();

  if (currentUser) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 16px',
        marginBottom: '24px',
        backgroundColor: 'var(--color-stone-50)',
        border: '1px solid var(--color-stone-200)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-stone-600)' }}>
        You're viewing in read-only mode. Sign in to make changes.
      </p>
      <Link to="/login" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <Button size="sm" icon={<LogIn size={16} />}>
          Sign In
        </Button>
      </Link>
    </div>
  );
}
