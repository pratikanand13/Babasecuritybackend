const mongoose = require('mongoose');
const recordSchema = new mongoose.Schema({
  apiName: { type: String, required: true }, 
  name: { type: String, required: true },    
  tag: { type: String },                      
  severity: { type: String }                 
});

module.exports = recordSchema