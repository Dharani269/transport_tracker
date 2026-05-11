import { NavLink, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: '📡', label: 'Dashboard' },
  { to: '/routes', icon: '🛣️', label: 'Routes' },
  { to: '/schedules', icon: '📅', label: 'Schedules' },
  { to: '/eta', icon: '⏱️', label: 'ETA Calculator' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!token) return <Navigate to="/" />;

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bg, color: theme.text }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', minWidth: '220px', background: theme.sidebar,
        borderRight: `1px solid ${theme.cardBorder}`, display: 'flex',
        flexDirection: 'column', padding: '1.5rem 1rem',
      }}>
        <div style={{ marginBottom: '2rem', paddingLeft: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: theme.accent }}>🚌 TransportMS</div>
          <div style={{ fontSize: '12px', color: theme.subtext, marginTop: '2px' }}>Fleet Management</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? theme.accent : 'transparent',
                color: isActive ? '#fff' : theme.subtext,
              })}>
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '1rem' }}>
          <div style={{ fontSize: '13px', color: theme.subtext, marginBottom: '8px', paddingLeft: '8px' }}>
            👤 {user.name || 'User'}
          </div>
          <button className="pro-btn" onClick={logout}
            style={{ width: '100%', background: '#ef4444', color: '#fff', fontSize: '13px', padding: '8px' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }} className="fade-in">
        <Outlet />
      </main>
    </div>
  );
}
