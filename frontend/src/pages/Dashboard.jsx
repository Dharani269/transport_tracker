import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ROUTE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

const vehicleIcon = (color, type) => L.divIcon({
  className: '',
  html: `<div style="
    width:${type === 'train' ? 18 : 14}px;
    height:${type === 'train' ? 18 : 14}px;
    border-radius:${type === 'train' ? '3px' : '50%'};
    background:${color};
    border:2.5px solid #fff;
    box-shadow:0 0 8px ${color}99;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const stopIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid ${color}"></div>`,
  iconSize: [9, 9],
  iconAnchor: [4, 4],
});

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('');
  const { theme } = useTheme();

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {}
  };

  useEffect(() => {
    api.get('/routes').then(({ data }) => setRoutes(data));
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 2000);
    return () => clearInterval(interval);
  }, []);

  // Build color map by route _id
  const routeColorMap = {};
  routes.forEach((r, i) => { routeColorMap[r._id] = ROUTE_COLORS[i % ROUTE_COLORS.length]; });

  const filteredRoutes = selectedRoute === 'all' ? routes : routes.filter(r => r._id === selectedRoute);
  const filteredVehicles = selectedRoute === 'all'
    ? vehicles
    : vehicles.filter(v => (v.routeId?._id || v.routeId) === selectedRoute);

  const buses = vehicles.filter(v => v.type === 'bus').length;
  const trains = vehicles.filter(v => v.type === 'train').length;
  const avgSpeed = vehicles.length
    ? Math.round(vehicles.reduce((s, v) => s + (v.speed || 0), 0) / vehicles.length)
    : 0;

  const stats = [
    { label: 'Active Vehicles', value: vehicles.length, icon: '🚍', color: '#6366f1' },
    { label: 'Buses', value: buses, icon: '🚌', color: '#10b981' },
    { label: 'Trains', value: trains, icon: '🚆', color: '#f59e0b' },
    { label: 'Avg Speed', value: `${avgSpeed} km/h`, icon: '⚡', color: '#ef4444' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: theme.text }}>Live Dashboard</h1>
          <p style={{ color: theme.subtext, fontSize: '13px', marginTop: '2px' }}>
            Real Chennai road tracking · {vehicles.length} vehicles active
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.subtext }}>
          <span className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          {lastUpdated}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ background: theme.card, borderColor: theme.cardBorder }}>
            <div style={{ fontSize: '26px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: theme.subtext }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Route Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedRoute('all')}
          style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            background: selectedRoute === 'all' ? theme.accent : theme.card,
            color: selectedRoute === 'all' ? '#fff' : theme.subtext,
            border: `1px solid ${theme.cardBorder}` }}>
          All Routes
        </button>
        {routes.map((r, i) => (
          <button key={r._id} onClick={() => setSelectedRoute(r._id)}
            style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              background: selectedRoute === r._id ? ROUTE_COLORS[i % ROUTE_COLORS.length] : theme.card,
              color: selectedRoute === r._id ? '#fff' : theme.subtext,
              border: `1px solid ${selectedRoute === r._id ? ROUTE_COLORS[i % ROUTE_COLORS.length] : theme.cardBorder}` }}>
            {r.routeNumber}
          </button>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.cardBorder}` }}>
          <MapContainer center={[13.0500, 80.2200]} zoom={12} style={{ height: '500px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Real road polylines */}
            {filteredRoutes.map((r, i) => {
              const color = ROUTE_COLORS[i % ROUTE_COLORS.length] || routeColorMap[r._id];
              const path = r.roadPath?.length > 1
                ? r.roadPath.map(p => [p.lat, p.lng])
                : r.stops.map(s => [s.lat, s.lng]);
              return (
                <Polyline key={r._id} positions={path} color={color} weight={4} opacity={0.75} />
              );
            })}

            {/* Stop markers */}
            {filteredRoutes.map((r, i) => {
              const color = ROUTE_COLORS[i % ROUTE_COLORS.length] || routeColorMap[r._id];
              return r.stops.map((stop, si) => (
                <Marker key={`${r._id}-${si}`} position={[stop.lat, stop.lng]} icon={stopIcon(color)}>
                  <Tooltip direction="top" offset={[0, -5]}>
                    <span style={{ fontSize: '12px' }}><b>{stop.name}</b><br />{r.routeNumber}</span>
                  </Tooltip>
                </Marker>
              ));
            })}

            {/* Vehicle markers */}
            {filteredVehicles.map(v => {
              const routeIdx = routes.findIndex(r => r._id === (v.routeId?._id || v.routeId));
              const color = ROUTE_COLORS[routeIdx % ROUTE_COLORS.length] || '#6366f1';
              return (
                <Marker key={v._id} position={[v.lat, v.lng]} icon={vehicleIcon(color, v.type)}>
                  <Popup>
                    <div style={{ minWidth: '160px' }}>
                      <b style={{ fontSize: '14px' }}>{v.vehicleId}</b><br />
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        {v.routeId?.routeName || 'No route'}<br />
                        Type: {v.type} &nbsp;|&nbsp; Speed: <b>{v.speed} km/h</b><br />
                        📍 {v.lat?.toFixed(4)}, {v.lng?.toFixed(4)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Vehicle list */}
          <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '12px 1.2rem', borderBottom: `1px solid ${theme.cardBorder}`, fontWeight: '600', fontSize: '13px', color: theme.text }}>
              🚍 Vehicles ({filteredVehicles.length})
            </div>
            <div style={{ overflow: 'auto', maxHeight: '280px' }}>
              {filteredVehicles.map(v => {
                const routeIdx = routes.findIndex(r => r._id === (v.routeId?._id || v.routeId));
                const color = ROUTE_COLORS[routeIdx % ROUTE_COLORS.length] || '#6366f1';
                return (
                  <div key={v._id} style={{ padding: '10px 1.2rem', borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: v.type === 'train' ? '2px' : '50%', background: color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '12px', color: theme.text }}>{v.vehicleId}</div>
                        <div style={{ fontSize: '11px', color: theme.subtext }}>{v.routeId?.routeNumber || '-'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: color }}>{v.speed} km/h</div>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: color + '22', color }}>{v.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route legend */}
          <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: theme.subtext, marginBottom: '10px' }}>ROUTES</div>
            {routes.map((r, i) => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}
                onClick={() => setSelectedRoute(selectedRoute === r._id ? 'all' : r._id)}>
                <div style={{ width: '24px', height: '4px', background: ROUTE_COLORS[i % ROUTE_COLORS.length], borderRadius: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>{r.routeNumber}</span>
                  <span style={{ fontSize: '11px', color: theme.subtext, marginLeft: '6px' }}>{r.routeName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
