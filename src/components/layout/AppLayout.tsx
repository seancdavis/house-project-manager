import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserPicker } from '../members/UserPicker';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/members', label: 'Members' },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <div>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>House Projects</h1>
        <UserPicker />
      </header>
      <nav style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1rem', borderBottom: '1px solid #eee' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === item.path ? '#000' : '#666',
              fontWeight: location.pathname === item.path ? 'bold' : 'normal',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
