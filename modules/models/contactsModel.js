const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

// schema
const contactSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  user_id: { type: String, required: true }
}); // end schema

// contact model
const contacts = mongoose.model('contacts', contactSchema);

module.exports = contacts;
