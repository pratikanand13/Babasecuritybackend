const mongoose = require('mongoose');

const apiStoreSchema = new mongoose.Schema({
    apiName: [{
        type: String,
        trim: true
    }],
    name: {
        type: String,
        required: true
    },
    githublink: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const ApiStore = mongoose.model('ApiStore', apiStoreSchema);

module.exports = ApiStore;
