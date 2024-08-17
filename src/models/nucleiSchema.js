const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tag: { type: String },
  severity: { type: String }
});

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  records: [recordSchema]
});

const nucleiSchema = mongoose.model('Url', urlSchema);

module.exports = nucleiSchema;
