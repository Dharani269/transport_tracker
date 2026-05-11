const express = require('express');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const schedules = await Schedule.find()
    .populate('routeId', 'routeName routeNumber')
    .populate('vehicleId', 'vehicleId type');
  res.json(schedules);
});

router.post('/', authMiddleware, async (req, res) => {
  const schedule = await Schedule.create(req.body);
  const populated = await Schedule.findById(schedule._id)
    .populate('routeId', 'routeName routeNumber')
    .populate('vehicleId', 'vehicleId type');
  res.status(201).json(populated);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  await Schedule.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ETA calculation
router.get('/eta/:vehicleId', authMiddleware, async (req, res) => {
  const vehicle = await Vehicle.findOne({ vehicleId: req.params.vehicleId }).populate('routeId');
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const speed = vehicle.speed || 30;
  const stops = vehicle.routeId?.stops || [];
  const etas = stops.map(stop => {
    const distKm = Math.sqrt(Math.pow(stop.lat - vehicle.lat, 2) + Math.pow(stop.lng - vehicle.lng, 2)) * 111;
    const etaMin = Math.round((distKm / speed) * 60);
    return { stop: stop.name, etaMinutes: etaMin };
  });
  res.json({ vehicleId: vehicle.vehicleId, etas });
});

module.exports = router;
