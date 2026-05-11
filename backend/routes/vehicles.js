const express = require('express');
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all active vehicles (live positions)
router.get('/', authMiddleware, async (req, res) => {
  const vehicles = await Vehicle.find({ status: 'active' }).populate('routeId', 'routeName routeNumber');
  res.json(vehicles);
});

// GPS ping - update vehicle location
router.put('/ping/:vehicleId', async (req, res) => {
  const { lat, lng, speed } = req.body;
  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleId: req.params.vehicleId },
    { lat, lng, speed, lastUpdated: Date.now() },
    { new: true, upsert: true }
  );
  res.json(vehicle);
});

// Get single vehicle
router.get('/:id', authMiddleware, async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('routeId');
  res.json(vehicle);
});

module.exports = router;
