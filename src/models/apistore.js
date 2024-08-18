const mongoose = require('mongoose');
const recordSchema = require('./nucleiSchema');  // Import your recordSchema

const apiStoreSchema = new mongoose.Schema({
    apiName: [{ type: String, required: true }],
    records: [{
        apiName: String,
        name: String,
        tag: String,
        severity: String
    }],
    name: {
        type: String,
    },
    githublink: {
        type: String,
    },
    livelink: {
        type: String,
    },
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dashboard',  // Reference to the Dashboard model
    }
}, {
    timestamps: true
});

const ApiStore = mongoose.model('ApiStore', apiStoreSchema);

module.exports = ApiStore;
