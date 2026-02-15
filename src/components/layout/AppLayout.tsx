import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, FolderKanban, Users, LogOut, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { useCurrentUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/members', label: 'Members', icon: Users },
];

export function AppLayout() {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const { mode, setMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="mobile-header-logo" onClick={closeSidebar}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home size={15} color="white" />
            </div>
            <span>House Projects</span>
          </Link>
        </div>
        {currentUser ? (
          <Avatar
            initials={currentUser.initials}
            color={currentUser.color}
            size="sm"
          />
        ) : (
          <Link
            to="/login"
            onClick={closeSidebar}
            style={{
              color: 'var(--color-primary-600)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Sidebar Backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
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
            onClick={closeSidebar}
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
                    onClick={closeSidebar}
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

        {/* Theme Toggle */}
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--color-stone-200)',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-stone-100)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
            }}
          >
            {([
              { value: 'light' as const, icon: Sun, label: 'Light' },
              { value: 'system' as const, icon: Monitor, label: 'System' },
              { value: 'dark' as const, icon: Moon, label: 'Dark' },
            ]).map((option) => {
              const Icon = option.icon;
              const isSelected = mode === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  title={option.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '6px 4px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 500 : 400,
                    backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                    color: isSelected ? 'var(--color-stone-900)' : 'var(--color-stone-500)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={14} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
                padding: '8px 4px',
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
              onClick={closeSidebar}
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
        className="main-content"
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
