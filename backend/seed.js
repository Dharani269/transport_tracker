const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Route = require('./models/Route');
const Vehicle = require('./models/Vehicle');

// Real Chennai MTC routes with accurate stop coordinates
const realRoutes = [
  {
    routeName: 'Chennai Central → Anna Nagar',
    routeNumber: '11C',
    totalDistance: 14,
    stops: [
      { name: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
      { name: 'Egmore', lat: 13.0784, lng: 80.2617 },
      { name: 'Kilpauk', lat: 13.0839, lng: 80.2408 },
      { name: 'Aminjikarai', lat: 13.0862, lng: 80.2216 },
      { name: 'Anna Nagar Tower', lat: 13.0878, lng: 80.2101 },
      { name: 'Anna Nagar East', lat: 13.0853, lng: 80.2063 },
    ],
  },
  {
    routeName: 'Tambaram → T.Nagar',
    routeNumber: '21M',
    totalDistance: 22,
    stops: [
      { name: 'Tambaram', lat: 12.9249, lng: 80.1000 },
      { name: 'Chromepet', lat: 12.9516, lng: 80.1462 },
      { name: 'Pallavaram', lat: 12.9675, lng: 80.1491 },
      { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
      { name: 'Saidapet', lat: 13.0197, lng: 80.2235 },
      { name: 'T.Nagar', lat: 13.0418, lng: 80.2341 },
    ],
  },
  {
    routeName: 'Adyar → Koyambedu',
    routeNumber: '5C',
    totalDistance: 18,
    stops: [
      { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
      { name: 'Kotturpuram', lat: 13.0134, lng: 80.2478 },
      { name: 'Saidapet', lat: 13.0197, lng: 80.2235 },
      { name: 'T.Nagar', lat: 13.0418, lng: 80.2341 },
      { name: 'Vadapalani', lat: 13.0504, lng: 80.2121 },
      { name: 'Koyambedu', lat: 13.0694, lng: 80.1948 },
    ],
  },
  {
    routeName: 'Chennai Beach → Velachery (MRTS)',
    routeNumber: 'MRTS-1',
    totalDistance: 19,
    stops: [
      { name: 'Chennai Beach', lat: 13.1043, lng: 80.2917 },
      { name: 'Chennai Fort', lat: 13.0950, lng: 80.2883 },
      { name: 'Park Town', lat: 13.0827, lng: 80.2707 },
      { name: 'Chepauk', lat: 13.0633, lng: 80.2785 },
      { name: 'Thiruvanmiyur', lat: 12.9827, lng: 80.2707 },
      { name: 'Velachery', lat: 12.9815, lng: 80.2209 },
    ],
  },
  {
    routeName: 'Perambur → Guindy',
    routeNumber: '27D',
    totalDistance: 16,
    stops: [
      { name: 'Perambur', lat: 13.1115, lng: 80.2494 },
      { name: 'Kolathur', lat: 13.1189, lng: 80.2341 },
      { name: 'Villivakkam', lat: 13.1003, lng: 80.2121 },
      { name: 'Arumbakkam', lat: 13.0762, lng: 80.2121 },
      { name: 'Vadapalani', lat: 13.0504, lng: 80.2121 },
      { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
    ],
  },
  {
    routeName: 'Madhavaram → Velachery',
    routeNumber: '47B',
    totalDistance: 25,
    stops: [
      { name: 'Madhavaram', lat: 13.1489, lng: 80.2341 },
      { name: 'Perambur', lat: 13.1115, lng: 80.2494 },
      { name: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
      { name: 'T.Nagar', lat: 13.0418, lng: 80.2341 },
      { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
      { name: 'Velachery', lat: 12.9815, lng: 80.2209 },
    ],
  },
];

// Fetch real road path from OSRM (free, no API key)
async function getRoadPath(stops) {
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const coords2 = data.routes[0].geometry.coordinates;
    return coords2.map(([lng, lat]) => ({ lat, lng }));
  } catch (e) {
    console.warn(`  OSRM failed, using straight-line fallback`);
    return stops.map(s => ({ lat: s.lat, lng: s.lng }));
  }
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Drop old indexes that may conflict
  await Route.collection.dropIndexes();
  await Vehicle.collection.dropIndexes();

  await Route.deleteMany({});
  await Vehicle.deleteMany({});

  const routeDocs = [];
  for (const r of realRoutes) {
    process.stdout.write(`Fetching road path for ${r.routeNumber}...`);
    const roadPath = await getRoadPath(r.stops);
    console.log(` ${roadPath.length} road points`);
    routeDocs.push({ ...r, roadPath });
    await new Promise(res => setTimeout(res, 1000)); // rate limit
  }

  const createdRoutes = await Route.insertMany(routeDocs);
  console.log(`✅ Seeded ${createdRoutes.length} routes with real road paths`);

  // 2 buses per route + 2 trains on MRTS
  const vehicles = [
    { vehicleId: 'MTC-11C-001', type: 'bus', routeId: createdRoutes[0]._id, lat: createdRoutes[0].stops[0].lat, lng: createdRoutes[0].stops[0].lng, speed: 30, status: 'active' },
    { vehicleId: 'MTC-11C-002', type: 'bus', routeId: createdRoutes[0]._id, lat: createdRoutes[0].stops[2].lat, lng: createdRoutes[0].stops[2].lng, speed: 28, status: 'active' },
    { vehicleId: 'MTC-21M-001', type: 'bus', routeId: createdRoutes[1]._id, lat: createdRoutes[1].stops[0].lat, lng: createdRoutes[1].stops[0].lng, speed: 25, status: 'active' },
    { vehicleId: 'MTC-21M-002', type: 'bus', routeId: createdRoutes[1]._id, lat: createdRoutes[1].stops[3].lat, lng: createdRoutes[1].stops[3].lng, speed: 27, status: 'active' },
    { vehicleId: 'MTC-5C-001', type: 'bus', routeId: createdRoutes[2]._id, lat: createdRoutes[2].stops[0].lat, lng: createdRoutes[2].stops[0].lng, speed: 28, status: 'active' },
    { vehicleId: 'MTC-5C-002', type: 'bus', routeId: createdRoutes[2]._id, lat: createdRoutes[2].stops[2].lat, lng: createdRoutes[2].stops[2].lng, speed: 26, status: 'active' },
    { vehicleId: 'MRTS-001', type: 'train', routeId: createdRoutes[3]._id, lat: createdRoutes[3].stops[0].lat, lng: createdRoutes[3].stops[0].lng, speed: 60, status: 'active' },
    { vehicleId: 'MRTS-002', type: 'train', routeId: createdRoutes[3]._id, lat: createdRoutes[3].stops[3].lat, lng: createdRoutes[3].stops[3].lng, speed: 55, status: 'active' },
    { vehicleId: 'MTC-27D-001', type: 'bus', routeId: createdRoutes[4]._id, lat: createdRoutes[4].stops[0].lat, lng: createdRoutes[4].stops[0].lng, speed: 30, status: 'active' },
    { vehicleId: 'MTC-27D-002', type: 'bus', routeId: createdRoutes[4]._id, lat: createdRoutes[4].stops[2].lat, lng: createdRoutes[4].stops[2].lng, speed: 24, status: 'active' },
    { vehicleId: 'MTC-47B-001', type: 'bus', routeId: createdRoutes[5]._id, lat: createdRoutes[5].stops[0].lat, lng: createdRoutes[5].stops[0].lng, speed: 28, status: 'active' },
    { vehicleId: 'MTC-47B-002', type: 'bus', routeId: createdRoutes[5]._id, lat: createdRoutes[5].stops[3].lat, lng: createdRoutes[5].stops[3].lng, speed: 30, status: 'active' },
  ];

  await Vehicle.insertMany(vehicles);
  console.log(`✅ Seeded ${vehicles.length} vehicles`);

  await mongoose.disconnect();
  console.log('\nDone! Run: npm start  then  npm run simulate');
}

seed().catch(console.error);
