const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  CRITICAL: { type: [String], default: [] }, // Change from String to [String]
  HIGH: { type: [String], default: [] },     // Change from String to [String]
  MEDIUM: { type: [String], default: [] },   // Change from String to [String]
  LOW: { type: [String], default: [] }       // Change from String to [String]
});

const ScanResult = mongoose.model('ScanResult', scanResultSchema);

module.exports = ScanResult;
