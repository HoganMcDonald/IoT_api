const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

// schema
const deviceSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  device_name: { type: String, required: true },
  device_id: { type: String, unique: true, required: true},
  contacts: { type: Array }, // array of contact ids
  text_message: { type: String, default: 'Your device threshold has been reached.' },
  email_message: { type: String, default: 'Your device threshold has been reached.' },
  cellular: { type: Boolean },
  connected: { type: Boolean },
  last_heard: { type: String },
  notes: { type: String },
  status: { type: String }
}); // end schema

// device model
const devices = mongoose.model('devices', deviceSchema);

module.exports = devices;
