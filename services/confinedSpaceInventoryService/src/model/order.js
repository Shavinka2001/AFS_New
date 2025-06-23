const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  uniqueId: { type: String },
  dateOfSurvey: { type: Date, required: true },
  surveyors: { type: [String], required: true },
  confinedSpaceNameOrId: { type: String, required: true },
  building: { type: String, required: true },
  locationDescription: { type: String },
  confinedSpaceDescription: { type: String },
  confinedSpace: { type: Boolean, required: true },
  permitRequired: { type: Boolean, required: true },
  entryRequirements: { type: String },
  atmosphericHazard: { type: Boolean, required: true },
  atmosphericHazardDescription: { type: String },
  engulfmentHazard: { type: Boolean, required: true },
  engulfmentHazardDescription: { type: String },
  configurationHazard: { type: Boolean, required: true },
  configurationHazardDescription: { type: String },
  otherRecognizedHazards: { type: Boolean, required: true },
  otherHazardsDescription: { type: String },
  ppeRequired: { type: Boolean, required: true },
  ppeList: { type: String },
  forcedAirVentilationSufficient: { type: Boolean, required: true },
  dedicatedContinuousAirMonitor: { type: Boolean, required: true },
  warningSignPosted: { type: Boolean, required: true },
  otherPeopleWorkingNearSpace: { type: Boolean, required: true },
  canOthersSeeIntoSpace: { type: Boolean, required: true },
  contractorsEnterSpace: { type: Boolean, required: true },
  numberOfEntryPoints: { type: Number },
  notes: { type: String },
  pictures: { type: [String] }
});

module.exports = mongoose.model('Order', OrderSchema);
