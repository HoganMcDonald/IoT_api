// requires
const router = require('express').Router();
const path = require('path');
const passport = require ('passport');
const User = require('../models/usersModel');

router.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '../../public/views/login.html')));

// login route
router.post('/', passport.authenticate( 'local' ), ( req, res ) => {
  // check privilege level for user attempting to login.
  User.findOne({email: req.body.email}, 'privilege', ( err, user ) => {
    if (user.privilege > 2) { // privelege 3: disabled, privilege 4: abyss
      req.logout();
      res.status(401).send({message: 'Not authorized to login.'});
    } else {
      res.status(200).send({message: 'Logged in.', privilege: user.privilege});
    } // end check privilege
  }); // end find user privilege
}); // end passport login

module.exports = router;
