// requires
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('../models/usersModel');

passport.use('local', new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email',
  passwordField: 'password'
}, function ( req, email, attemptedPassword, done ) {
  console.log('hit local strategy');
  // look up our user
  User.findOne({ email: email }, function ( err, foundUser ) {
    if (!foundUser) {
      console.log('no user');
      done( null, false, {message:'Incorrect credentials.'} );
    }
    else {
      console.log('found user');
      foundUser.comparePassword( attemptedPassword, function( isMatch ) {
        if( isMatch ) {
          console.log('correct password');
          done( null, foundUser, {message: 'Successful Login'} );
        } // end isMatch
        else {
          console.log('incorrect password');
          done( null, false, {message:'Incorrect credentials.'});
        }
      }); // end comparePassword
    } // user found
  }); // end User.findOne

  passport.serializeUser( function( user, done ) {
    console.log('serialize user:', user.id);
    done( null, user.id );
  }); // end serializeUser
  passport.deserializeUser( function( id, done ) {
    console.log('deserialize user:', id);
    User.find({_id: id}, function( err, foundUser ) {
      done( null, foundUser );
    }); // end findByID
  }); // end deserialize
}));



module.exports = passport;
