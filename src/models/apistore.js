    const mongoose = require('mongoose');

    // Define the ApiStore schema with a reference to Dashboard
    const apiStoreSchema = new mongoose.Schema({
        apiName: [{
            type: String,
            trim: true
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
