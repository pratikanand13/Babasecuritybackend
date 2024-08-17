const mongoose = require('mongoose');

const apiStore = new mongoose.Schema({
    links: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

const Apistore = mongoose.model('apiStore', apiStore);

module.exports = Apistore;
