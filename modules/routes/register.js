const router = require('express').Router();
const path = require('path');
const User = require('../models/usersModel');
const Contacts = require('../models/contactsModel');

router.get('/', ( req, res ) =>
  res.sendFile(path.join(__dirname, '../../public/views/register.html')));

//register admin post
router.post('/', ( req, res ) => {
  var adminCreds = req.body;
  console.log('adminCreds is:', adminCreds);
  //write to db
  User.create( adminCreds, ( err, response ) => {
    if ( err ) {
      console.log('error creating new admin:', err );
      res.sendStatus(500);
    }
    else {
      res.status(201).send({message: 'new admin created'});
    } // end check for db errors
  }); // end create user
}); // end post

module.exports = router;
