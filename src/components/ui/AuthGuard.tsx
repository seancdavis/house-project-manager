import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useCurrentUser } from '../../context/UserContext';
import { Button } from './Button';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wraps content that requires authentication.
 * If no user is signed in, shows a sign-in prompt instead.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return fallback || (
      <Link to="/login">
        <Button variant="secondary" icon={<LogIn size={18} />}>
          Sign in to continue
        </Button>
      </Link>
    );
  }

  return <>{children}</>;
}

interface RequireAuthButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * A button that requires authentication.
 * When clicked without auth, redirects to login.
 * When clicked with auth, executes the onClick handler.
 */
export function RequireAuthButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
}: RequireAuthButtonProps) {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return (
      <Link to="/login" style={{ textDecoration: 'none' }}>
        <Button variant={variant} size={size} icon={icon}>
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button variant={variant} size={size} icon={icon} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}
