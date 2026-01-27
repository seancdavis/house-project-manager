import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, FolderKanban, Users, LogOut } from 'lucide-react';
import { useCurrentUser } from '../../context/UserContext';
import { Avatar } from '../ui';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/members', label: 'Members', icon: Users },
];

export function AppLayout() {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useCurrentUser();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--color-stone-200)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 20px',
            borderBottom: '1px solid var(--color-stone-200)',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home size={18} color="white" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-stone-900)',
              }}
            >
              House Projects
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px' }}>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path} style={{ marginBottom: '2px' }}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      color: active ? 'var(--color-primary-700)' : 'var(--color-stone-600)',
                      backgroundColor: active ? 'var(--color-primary-50)' : 'transparent',
                      transition: 'all var(--transition-fast)',
                      fontWeight: active ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'var(--color-stone-100)';
                        e.currentTarget.style.color = 'var(--color-stone-900)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-stone-600)';
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid var(--color-stone-200)',
          }}
        >
          {currentUser ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-stone-50)',
              }}
            >
              <Avatar
                initials={currentUser.initials}
                color={currentUser.color}
                size="sm"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: 'var(--color-stone-900)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentUser.name}
                </div>
                <div
                  style={{
                    color: 'var(--color-stone-500)',
                    fontSize: '0.75rem',
                  }}
                >
                  {currentUser.type === 'family' ? 'Family' : 'Contractor'}
                </div>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  color: 'var(--color-stone-400)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-stone-700)';
                  e.currentTarget.style.backgroundColor = 'var(--color-stone-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-stone-400)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-600)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-warm)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '24px 32px',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
