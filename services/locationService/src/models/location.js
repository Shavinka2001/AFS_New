const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  type: {
    type: String,
    enum: ['building', 'outdoor', 'facility', 'other'],
    default: 'building'
  },
  createdBy: {
    type: String,  // User ID who created this location
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
LocationSchema.index({ 'coordinates': '2dsphere' });

const Location = mongoose.model('Location', LocationSchema);
module.exports = Location;
