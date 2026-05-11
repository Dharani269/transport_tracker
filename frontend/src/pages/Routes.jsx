import { useEffect, useState } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ routeName: '', routeNumber: '', totalDistance: '' });
  const [msg, setMsg] = useState('');
  const { theme } = useTheme();

  useEffect(() => { api.get('/routes').then(({ data }) => setRoutes(data)); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/routes', { ...form, totalDistance: Number(form.totalDistance) });
      setRoutes(prev => [...prev, data]);
      setForm({ routeName: '', routeNumber: '', totalDistance: '' });
      setMsg('✅ Route added!');
      setTimeout(() => setMsg(''), 2500);
    } catch { setMsg('❌ Error adding route'); }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: theme.text }}>Routes</h1>
        <p style={{ color: theme.subtext, fontSize: '13px', marginTop: '2px' }}>Manage all transport routes</p>
      </div>

      <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '1rem', color: theme.text }}>Add New Route</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {[['routeName', 'Route Name'], ['routeNumber', 'Route Number'], ['totalDistance', 'Distance (km)']].map(([key, placeholder]) => (
            <input key={key} className="pro-input" placeholder={placeholder}
              type={key === 'totalDistance' ? 'number' : 'text'}
              value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
              required={key !== 'totalDistance'}
              style={{ background: theme.input, borderColor: theme.inputBorder, color: theme.text, width: '200px' }} />
          ))}
          <button className="pro-btn" type="submit" style={{ background: theme.accent, color: '#fff' }}>+ Add Route</button>
          {msg && <span style={{ fontSize: '13px', color: msg.startsWith('✅') ? '#10b981' : '#ef4444', alignSelf: 'center' }}>{msg}</span>}
        </form>
      </div>

      <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
        <table className="pro-table">
          <thead>
            <tr style={{ background: theme.tableHead }}>
              {['Route Name', 'Route Number', 'Stops', 'Distance (km)', 'Created'].map(h => (
                <th key={h} style={{ color: theme.subtext }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map(r => (
              <tr key={r._id} style={{ background: theme.tableRow }}>
                <td style={{ color: theme.text, borderColor: theme.cardBorder, fontWeight: '500' }}>{r.routeName}</td>
                <td style={{ color: theme.subtext, borderColor: theme.cardBorder }}>
                  <span className="badge" style={{ background: theme.accent + '22', color: theme.accent }}>{r.routeNumber}</span>
                </td>
                <td style={{ color: theme.text, borderColor: theme.cardBorder }}>{r.stops?.length || 0}</td>
                <td style={{ color: theme.text, borderColor: theme.cardBorder }}>{r.totalDistance || '-'}</td>
                <td style={{ color: theme.subtext, borderColor: theme.cardBorder, fontSize: '12px' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: theme.subtext, padding: '2rem', borderColor: theme.cardBorder }}>No routes yet. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
