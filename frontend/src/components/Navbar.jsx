import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>🚌 TransportMS</span>
      <div style={styles.links}>
        <Link style={styles.link} to="/dashboard">Dashboard</Link>
        <Link style={styles.link} to="/routes">Routes</Link>
        <Link style={styles.link} to="/schedules">Schedules</Link>
      </div>
      <div style={styles.user}>
        <span style={{ marginRight: '1rem', color: '#ccc' }}>{user.name}</span>
        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a2e', padding: '0.8rem 1.5rem' },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: '18px' },
  links: { display: 'flex', gap: '1.5rem' },
  link: { color: '#93c5fd', textDecoration: 'none', fontSize: '15px' },
  user: { display: 'flex', alignItems: 'center' },
  logout: { padding: '0.3rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
