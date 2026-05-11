import { useState } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function ETACalculator() {
  const [vehicleId, setVehicleId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const fetchETA = async () => {
    if (!vehicleId.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await api.get(`/schedules/eta/${vehicleId.trim()}`);
      setResult(data);
    } catch {
      setError('Vehicle not found. Make sure the simulator is running.');
    } finally { setLoading(false); }
  };

  const suggestions = ['OLA-BUS-001', 'OLA-BUS-002', 'OLA-BUS-003', 'OLA-TRAIN-001'];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: theme.text }}>ETA Calculator</h1>
        <p style={{ color: theme.subtext, fontSize: '13px', marginTop: '2px' }}>Calculate estimated arrival time for any vehicle</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Input Panel */}
        <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '1rem', color: theme.text }}>Enter Vehicle ID</div>
          <input className="pro-input" placeholder="e.g. OLA-BUS-001"
            value={vehicleId} onChange={e => setVehicleId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchETA()}
            style={{ background: theme.input, borderColor: theme.inputBorder, color: theme.text, marginBottom: '1rem' }} />

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '8px' }}>Quick select:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {suggestions.map(s => (
                <button key={s} className="pro-btn" onClick={() => setVehicleId(s)}
                  style={{ background: vehicleId === s ? theme.accent : theme.accent + '22', color: vehicleId === s ? '#fff' : theme.accent, fontSize: '12px', padding: '6px 12px' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button className="pro-btn" onClick={fetchETA} disabled={loading}
            style={{ background: theme.accent, color: '#fff', width: '100%' }}>
            {loading ? '⏳ Calculating...' : '⏱️ Calculate ETA'}
          </button>

          {error && <div style={{ marginTop: '1rem', padding: '12px', background: '#ef444422', borderRadius: '8px', color: '#ef4444', fontSize: '13px' }}>{error}</div>}
        </div>

        {/* Results Panel */}
        <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.cardBorder}`, fontWeight: '600', color: theme.text }}>
            {result ? `📍 ETAs for ${result.vehicleId}` : '📍 ETA Results'}
          </div>
          {result ? (
            <div style={{ overflow: 'auto', maxHeight: '380px' }}>
              {result.etas?.length > 0 ? result.etas.map((e, i) => (
                <div key={i} style={{
                  padding: '14px 1.5rem', borderBottom: `1px solid ${theme.cardBorder}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.accent + '22', color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{i + 1}</div>
                    <span style={{ color: theme.text, fontWeight: '500', fontSize: '14px' }}>{e.stop}</span>
                  </div>
                  <span className="badge" style={{
                    background: e.etaMinutes < 5 ? '#10b98122' : e.etaMinutes < 15 ? '#f59e0b22' : '#ef444422',
                    color: e.etaMinutes < 5 ? '#10b981' : e.etaMinutes < 15 ? '#f59e0b' : '#ef4444',
                    fontSize: '13px',
                  }}>
                    {e.etaMinutes} min
                  </span>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: theme.subtext, fontSize: '13px' }}>No stops found for this vehicle's route.</div>
              )}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: theme.subtext, fontSize: '13px' }}>
              Select a vehicle and click Calculate ETA
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
