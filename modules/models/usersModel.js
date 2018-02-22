const mongoose = require ('mongoose');
const bcrypt = require ('bcrypt');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

// schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  access_token: { type: String },
  password: { type: String, required: true },
  primary_contact: { type: String }, // references the contact id for the contact made at the same time as the user
  privilege: { type: Number, required: true } // privilege 0: admin | privilege 1: pending | privilege 2: user | privilege 3: disabled | privilege 4: abyss
}); // end schema

// password hasher
userSchema.pre('save', function(next) {
  var user = this;
  // console.log('In userSchema:', user);
  if(!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(SALT_WORK_FACTOR, function( err, salt ) {
    bcrypt.hash(user.password, salt, function( err, hash ) {
      user.password = hash;
      // console.log(user);
      next();
    }); // end hash
  }); // end bcrypt
}); // end UserSchema.pre

userSchema.pre('update', function(next) {
  var query = this;
  var newPassword = query._update.$set.password;

  if(!query._update.$set.hasOwnProperty('password')) {
    return next();
  }
  bcrypt.genSalt(SALT_WORK_FACTOR, function( err, salt ) {
    bcrypt.hash(newPassword, salt, function( err, hash ) {
      query.update({}, { $set: { password: hash } });
      // console.log(user);
      next();
    }); // end hash
  }); // end bcrypt
}); // end UserSchema.pre

// password comparison
userSchema.methods.comparePassword = function( attemptedPassword, callback ) {
  bcrypt.compare( attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  }); // end compare
}; // end UserSchema.comparePassword

// user model
const users = mongoose.model('users', userSchema);
module.exports = users;
