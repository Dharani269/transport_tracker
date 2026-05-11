const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  routeNumber: { type: String, required: true },
  stops: [stopSchema],
  roadPath: [{ lat: Number, lng: Number }], // actual road coordinates from OSRM
  totalDistance: Number,
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
