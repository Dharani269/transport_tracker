import { useEffect, useState } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_COLORS = { Mon: '#6366f1', Tue: '#10b981', Wed: '#f59e0b', Thu: '#ef4444', Fri: '#8b5cf6', Sat: '#0ea5e9', Sun: '#f97316' };

const empty = { routeId: '', vehicleId: '', departureTime: '', arrivalTime: '', days: [] };

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    api.get('/schedules').then(({ data }) => setSchedules(data));
    api.get('/routes').then(({ data }) => setRoutes(data));
    api.get('/vehicles').then(({ data }) => setVehicles(data));
  }, []);

  // Filter vehicles by selected route
  const routeVehicles = form.routeId
    ? vehicles.filter(v => (v.routeId?._id || v.routeId) === form.routeId)
    : vehicles;

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.routeId || !form.departureTime || form.days.length === 0) {
      setMsg('❌ Fill route, departure time and at least one day');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    try {
      const { data } = await api.post('/schedules', form);
      setSchedules(prev => [...prev, data]);
      setForm(empty);
      setShowForm(false);
      setMsg('✅ Schedule added!');
      setTimeout(() => setMsg(''), 2500);
    } catch {
      setMsg('❌ Error adding schedule');
      setTimeout(() => setMsg(''), 2500);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/schedules/${id}`);
    setSchedules(prev => prev.filter(s => s._id !== id));
  };

  // Group schedules by route
  const grouped = schedules.reduce((acc, s) => {
    const key = s.routeId?.routeNumber || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: theme.text }}>Schedules</h1>
          <p style={{ color: theme.subtext, fontSize: '13px', marginTop: '2px' }}>
            {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} routes
          </p>
        </div>
        <button className="pro-btn" onClick={() => setShowForm(!showForm)}
          style={{ background: theme.accent, color: '#fff' }}>
          {showForm ? '✕ Cancel' : '+ Add Schedule'}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px',
          background: msg.startsWith('✅') ? '#10b98122' : '#ef444422',
          color: msg.startsWith('✅') ? '#10b981' : '#ef4444',
          border: `1px solid ${msg.startsWith('✅') ? '#10b981' : '#ef4444'}` }}>
          {msg}
        </div>
      )}

      {/* Add Schedule Form */}
      {showForm && (
        <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '1.2rem', color: theme.text }}>New Schedule</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Route */}
              <div>
                <label style={{ fontSize: '12px', color: theme.subtext, display: 'block', marginBottom: '6px' }}>Route *</label>
                <select className="pro-input" value={form.routeId}
                  onChange={e => setForm({ ...form, routeId: e.target.value, vehicleId: '' })}
                  style={{ background: theme.input, borderColor: theme.inputBorder, color: theme.text }}>
                  <option value="">Select route</option>
                  {routes.map(r => <option key={r._id} value={r._id}>{r.routeNumber} — {r.routeName}</option>)}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label style={{ fontSize: '12px', color: theme.subtext, display: 'block', marginBottom: '6px' }}>Vehicle (optional)</label>
                <select className="pro-input" value={form.vehicleId}
                  onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                  style={{ background: theme.input, borderColor: theme.inputBorder, color: theme.text }}>
                  <option value="">Select vehicle</option>
                  {routeVehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleId} ({v.type})</option>)}
                </select>
              </div>

              {/* Departure */}
              <div>
                <label style={{ fontSize: '12px', color: theme.subtext, display: 'block', marginBottom: '6px' }}>Departure Time *</label>
                <input className="pro-input" type="time" value={form.departureTime}
                  onChange={e => setForm({ ...form, departureTime: e.target.value })}
                  style={{ background: theme.input, borderColor: theme.inputBorder, color: theme.text }} />
              </div>

              {/* Arrival */}
              <div>
                <label style={{ fontSize: '12px', color: theme.subtext, display: 'block', marginBottom: '6px' }}>Arrival Time</label>
                <input className="pro-input" type="time" value={form.arrivalTime}
                  onChange={e => setForm({ ...form, arrivalTime: e.target.value })}
                  style={{ background: theme.input, borderColor: theme.inputBorder, color: theme.text }} />
              </div>
            </div>

            {/* Days */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '12px', color: theme.subtext, display: 'block', marginBottom: '8px' }}>Operating Days *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {DAYS.map(day => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s',
                      background: form.days.includes(day) ? DAY_COLORS[day] : theme.input,
                      color: form.days.includes(day) ? '#fff' : theme.subtext,
                      border: `1px solid ${form.days.includes(day) ? DAY_COLORS[day] : theme.inputBorder}` }}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <button className="pro-btn" type="submit" style={{ background: theme.accent, color: '#fff' }}>
              Save Schedule
            </button>
          </form>
        </div>
      )}

      {/* Schedules grouped by route */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '3rem', textAlign: 'center', color: theme.subtext }}>
          <div style={{ fontSize: '40px', marginBottom: '1rem' }}>📅</div>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: theme.text }}>No schedules yet</div>
          <div style={{ fontSize: '13px' }}>Click "Add Schedule" to create one</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(grouped).map(([routeNum, items]) => (
            <div key={routeNum} style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 1.5rem', borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: theme.accent + '22', color: theme.accent, padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>{routeNum}</span>
                <span style={{ color: theme.subtext, fontSize: '13px' }}>{items[0].routeId?.routeName}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: theme.subtext }}>{items.length} trip{items.length > 1 ? 's' : ''}</span>
              </div>
              <table className="pro-table">
                <thead>
                  <tr style={{ background: theme.tableHead }}>
                    {['Vehicle', 'Departure', 'Arrival', 'Duration', 'Days', ''].map(h => (
                      <th key={h} style={{ color: theme.subtext, fontSize: '11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(s => {
                    // Calculate duration
                    let duration = '-';
                    if (s.departureTime && s.arrivalTime) {
                      const [dh, dm] = s.departureTime.split(':').map(Number);
                      const [ah, am] = s.arrivalTime.split(':').map(Number);
                      const mins = (ah * 60 + am) - (dh * 60 + dm);
                      if (mins > 0) duration = `${Math.floor(mins / 60) > 0 ? Math.floor(mins / 60) + 'h ' : ''}${mins % 60}m`;
                    }
                    return (
                      <tr key={s._id} style={{ background: theme.tableRow }}>
                        <td style={{ color: theme.text, borderColor: theme.cardBorder }}>
                          {s.vehicleId?.vehicleId
                            ? <span style={{ background: theme.accent + '22', color: theme.accent, padding: '2px 8px', borderRadius: '999px', fontSize: '12px' }}>{s.vehicleId.vehicleId}</span>
                            : <span style={{ color: theme.subtext, fontSize: '12px' }}>—</span>}
                        </td>
                        <td style={{ color: '#10b981', borderColor: theme.cardBorder, fontWeight: '600', fontSize: '15px' }}>
                          {s.departureTime || '—'}
                        </td>
                        <td style={{ color: '#ef4444', borderColor: theme.cardBorder, fontWeight: '600', fontSize: '15px' }}>
                          {s.arrivalTime || '—'}
                        </td>
                        <td style={{ color: theme.subtext, borderColor: theme.cardBorder, fontSize: '13px' }}>{duration}</td>
                        <td style={{ borderColor: theme.cardBorder }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {s.days?.map(d => (
                              <span key={d} style={{ background: DAY_COLORS[d] + '22', color: DAY_COLORS[d], padding: '2px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{d}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ borderColor: theme.cardBorder }}>
                          <button onClick={() => handleDelete(s._id)}
                            style={{ background: '#ef444422', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
