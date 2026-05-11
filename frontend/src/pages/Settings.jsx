import { useTheme, themes } from '../context/ThemeContext';

const themeOptions = [
  { key: 'dark', label: 'Dark', preview: ['#0f172a', '#1e293b', '#6366f1'] },
  { key: 'light', label: 'Light', preview: ['#f1f5f9', '#ffffff', '#6366f1'] },
  { key: 'ocean', label: 'Ocean', preview: ['#0a1628', '#0d2137', '#0ea5e9'] },
];

export default function Settings() {
  const { theme, themeName, setThemeName } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: theme.text }}>Settings</h1>
        <p style={{ color: theme.subtext, fontSize: '13px', marginTop: '2px' }}>Customize your experience</p>
      </div>

      {/* Profile */}
      <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '1rem', color: theme.text }}>👤 Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#fff', fontWeight: '700' }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: theme.text }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: theme.subtext }}>{user.email}</div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: theme.text }}>🎨 Theme</div>
        <div style={{ fontSize: '13px', color: theme.subtext, marginBottom: '1rem' }}>Choose your preferred color theme</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {themeOptions.map(t => (
            <button key={t.key} onClick={() => setThemeName(t.key)}
              style={{
                background: 'transparent', border: `2px solid ${themeName === t.key ? theme.accent : theme.cardBorder}`,
                borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', minWidth: '120px',
              }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', justifyContent: 'center' }}>
                {t.preview.map((c, i) => (
                  <div key={i} style={{ width: '20px', height: '20px', borderRadius: '4px', background: c }} />
                ))}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: themeName === t.key ? theme.accent : theme.text }}>{t.label}</div>
              {themeName === t.key && <div style={{ fontSize: '11px', color: theme.accent, marginTop: '2px' }}>✓ Active</div>}
            </button>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '1rem', color: theme.text }}>ℹ️ App Info</div>
        {[['Version', 'v1.0.0'], ['Backend', 'http://localhost:5000'], ['Refresh Rate', 'Every 5 seconds'], ['Map Provider', 'OpenStreetMap']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.cardBorder}`, fontSize: '14px' }}>
            <span style={{ color: theme.subtext }}>{k}</span>
            <span style={{ color: theme.text, fontWeight: '500' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
