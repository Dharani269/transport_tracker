const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['bus', 'train'], default: 'bus' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
