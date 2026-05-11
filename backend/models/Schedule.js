const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  departureTime: String,
  arrivalTime: String,
  days: [String],
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
