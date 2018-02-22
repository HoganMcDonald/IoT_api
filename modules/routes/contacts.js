const router = require('express').Router();
const User = require('../models/usersModel');
const Contacts = require('../models/contactsModel')

// get user's contacts
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    userID = req.user[0]._id;
    console.log(userID);
    Contacts.find({user_id: userID}).then (( response ) => {
      console.log('response in then', response);
      res.send(response);
    }); // end query
  } else {
    res.status(401).send({message: 'Invalid credentials.'});
  }  // end check authentication
}); // end get user's contacts


// create new contact
router.post('/', (req, res) => {
  if (req.isAuthenticated()) {
    let userID = req.user[0]._id;
    console.log(userID);
    let newContact = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      user_id: userID
    }
    console.log(newContact);
    // create new contact in db
    let newEntry = Contacts(newContact);
    newEntry.save(( err, response ) => {
      if(err) {
        console.log(err);
        res.status(500).send({message: 'User not created.', error: err});
      } else {
        res.status(201).send({message: 'Contact created.'});
      } // end check for error
    }); // end save new contact
  } else {
    res.status(401).send({message: 'Invalid credentials.'});
  }  // end check authentication
}); // end create new contact


// update contact
router.put('/:id', (req, res) => {
  if(req.isAuthenticated()) {
    let contactID = req.params.id;
    let updatedContactInfo = req.body;
    console.log('contactID:', contactID);
    console.log(updatedContactInfo);
    // update contact in db
    Contacts.update({_id: contactID}, updatedContactInfo, ( err, response ) => {
      if (err) {
        console.log(err);
        res.status(500).send({message: 'Contact not updated.', error: err})
      } else {
        res.status(200).send({message: 'Contact updated.'});
      } // end check for error
    }); // end update contact
  } else {
    res.status(401).send({message: 'Invalid credentials.'});
  } // end check authentication
}); // end update contact


// delete contact
router.delete('/:id', (req, res) => {
  let contactID = req.params.id;
  Contacts.remove({_id: contactID}, ( err, del ) => {
    if(err) {
      console.log(err);
      res.status(500).send({message: 'Contact not deleted.'})
    } else {
      res.status(200).send({message: 'Contact deleted.'});
    } // end check for error
  }); // end query
}); // end delete contact

module.exports = router;
