const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const Vehicle = require('./models/Vehicle');

const state = {}; // vehicleId -> { path, pathIndex, progress }

function interpolate(a, b, t) {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

async function init() {
  await mongoose.connect(process.env.MONGO_URI);
  const vehicles = await Vehicle.find({ status: 'active' }).populate('routeId');

  vehicles.forEach((v, i) => {
    const path = v.routeId?.roadPath?.length > 1
      ? v.routeId.roadPath
      : v.routeId?.stops?.map(s => ({ lat: s.lat, lng: s.lng })) || [];

    // Stagger start positions so buses on same route aren't bunched
    const startIndex = Math.floor((i % 3) * (path.length / 3));

    state[v.vehicleId] = {
      path,
      pathIndex: startIndex,
      progress: 0,
      type: v.type,
    };
  });

  console.log(`🚌 GPS Simulator started for ${vehicles.length} vehicles on real Chennai roads`);
  console.log(`   Vehicles: ${vehicles.map(v => v.vehicleId).join(', ')}`);
  setInterval(() => tick(vehicles), 2000);
}

function tick(vehicles) {
  vehicles.forEach(v => {
    const s = state[v.vehicleId];
    if (!s || s.path.length < 2) return;

    // Speed: trains faster, buses slower, slight randomness
    const step = s.type === 'train' ? 0.12 : 0.06;
    s.progress += step + Math.random() * 0.03;

    if (s.progress >= 1) {
      s.progress = 0;
      s.pathIndex = (s.pathIndex + 1) % (s.path.length - 1);
    }

    const from = s.path[s.pathIndex];
    const to = s.path[s.pathIndex + 1];
    const pos = interpolate(from, to, s.progress);
    const kmh = s.type === 'train'
      ? Math.floor(45 + Math.random() * 25)
      : Math.floor(15 + Math.random() * 35);

    axios.put(`http://localhost:5000/api/vehicles/ping/${v.vehicleId}`, {
      lat: +pos.lat.toFixed(6),
      lng: +pos.lng.toFixed(6),
      speed: kmh,
    }).catch(() => {});
  });
}

init().catch(console.error);
