const mongoose = require('mongoose');
const scanResultSchema = new mongoose.Schema({
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true, 
  },
  githubOrgName: { type: String, required: true }, 
  githubLink: { type: String, required: true },    
  CRITICAL: { type: [String], default: [] },
  HIGH: { type: [String], default: [] },
  MEDIUM: { type: [String], default: [] },
  LOW: { type: [String], default: [] }
});

const ScanResult = mongoose.model('ScanResult', scanResultSchema);

module.exports = ScanResult;
