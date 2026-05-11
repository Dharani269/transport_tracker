import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🚌</div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.2, marginBottom: '1rem' }}>
          Transport<br />Management<br /><span style={{ color: '#6366f1' }}>System</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, maxWidth: '340px' }}>
          Real-time fleet tracking, route management, and ETA calculations — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
          {[['📡', 'Live GPS'], ['🛣️', 'Routes'], ['⏱️', 'ETA']].map(([icon, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>{icon}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#1e293b' }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem' }}>
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '2rem' }}>
            {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
          </p>

          {error && (
            <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isRegister && (
              <div>
                <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input className="pro-input" type="text" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  style={{ background: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Email</label>
              <input className="pro-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                style={{ background: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Password</label>
              <input className="pro-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                style={{ background: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
            </div>
            <button className="pro-btn" type="submit" disabled={loading}
              style={{ background: '#6366f1', color: '#fff', marginTop: '0.5rem', padding: '12px' }}>
              {loading ? '⏳ Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: '#64748b' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600', marginLeft: '6px' }}>
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
