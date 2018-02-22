const router = require('express').Router();
const nodemailer = require('nodemailer');
const User = require('../models/usersModel');
const Contacts = require('../models/contactsModel');

const PRAECO_URL = 'https://praeco-iot.herokuapp.com/';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// get all users
router.get('/', (req, res) => {
  if( req.isAuthenticated() ) {
    User.find({privilege: {$gt: 0, $lt: 4}}, 'first_name last_name email phone access_token privilege').then(function ( response ){
      res.send(response);
      });
  } else {
    res.status(401).send({message: "Invalid credentials."});
  }
}); // get all users

//create new user
router.post('/', (req, res) => {
  if (req.isAuthenticated()) {
    //new user object
    let newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      access_token: req.body.access_token,
      password: randomPass(),
      privilege: 1 // privilege: pending (until user changes password)
    }; // end new user

    var newEntry = User(newUser);
    //create new user in DB
    newEntry.save(function( err, response ) {
      if (err) {
        console.log(err);
        res.status(409).send({message: 'A User with this Email Already Exists', error: err});
      } else {
        // create new contact for user
        let newContact = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          phone: req.body.phone,
          user_id: newEntry._id
        }

        var newContactEntry = Contacts(newContact);
        User.update( { _id: newEntry._id }, { primary_contact: newContactEntry._id } ).then(response => {
          newContactEntry.save(function( err, response ) {
            if (err) {
              res.status(500).send({message: 'Contact not created.', error: err});
            } else {
              // console.log(response);
              let messageBody = '<h3>Welcome to Praeco</h3><p>Use these credentials to setup your account:</p>';
              messageBody += '<ul><li>username: ' + newUser.email + ' </li><li>password: ' + newUser.password + '</li>';
              messageBody += '</ul> <p>Follow this link to get started: <a href=" ' + PRAECO_URL + ' ">Praeco</a></p>';
              let mailOptions = {
                // from: process.env.EMAIL_USERNAME,
                from: `"Lab651" <${process.env.EMAIL_USERNAME}>`,
                to: newUser.email,
                subject: 'Welcome to the Praeco Platform',
                html: messageBody
              };
              // console.log(mailOptions);
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  // console.log('invite not sent', error);
                  //delete contact
                  // console.log(newContactEntry._id, newEntry._id);
                  Contacts.remove({_id: newContactEntry._id}).then(( del ) => {
                    // console.log( del );
                  });
                  //delete user
                  User.remove({_id: newEntry._id}).then(( del ) => {
                    // console.log('deleted');
                  });
                  res.status(500).send({message: 'Email invite not sent. User not added.', error: error});
                } else {
                  res.status(201).send({message: 'User created. Email sent.'});
                } // end check for errors
              }); // end send email
            } // end check for error creating new contact
          }); // end create new contact in db
        }); // end update primary_contact
      } // end check for err creating new user
    }); // end create new user in db
  } else {
    res.status(401).send({message: "Invalid credentials."});
  } // end check admin credentials
}); // end create new user post

//update profile info - NOT PASSWORD
router.put('/', (req, res) => {
  // console.log(req.body); // req.body should be passable to db
  // console.log(req.user[0].email);
  if (req.isAuthenticated()) {
    User.findOne({_id: req.body.id}).then(changedUser => {
      let oldEmail = changedUser.email;

      let newInfo = {
        email: req.body.email,
        privilege: req.body.privilege,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone
      };
      // console.log('New info object:', req.body);
      if (req.body.hasOwnProperty('access_token')) {
        newInfo.access_token = req.body.access_token;
      }
      User.update({_id: req.body.id}, newInfo).then((response) => {
        let newContactInfo = {
          email: req.body.email,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone: req.body.phone
        };
        Contacts.update({ _id: req.body.primary_contact }, newContactInfo).then(response => {
          if (newInfo.email !== oldEmail)  {
            req.logout();
            res.status(401).send({message: "Invalid credentials."});
          } else {
            res.status(200).send({message: 'Profile Updated.'});
          } // log out user if email is changed
        }); // end update contact
      }); // end update user information
    }); // end find user info
  } else {
    res.status(401).send({message: "Invalid credentials."});
  } // end check authentication
}); // end update profile info

//update password
router.put('/password', ( req, res ) => {
  // console.log('req.body', req.body);
  if (req.isAuthenticated()) {
    var newPassword = {};
    if (req.body.privilege === 1) { // privilege 1: pending
      newPassword = {
        password: req.body.password,
        privilege: 2 // privilege 2: user
      };
      // console.log('in if statement');
    } else {
      newPassword = {
        password: req.body.password
      };
    }
    User.update({email: req.body.email}, newPassword, ( err, response ) => {
      if (err) {
        res.status(500).send({message: 'New password not saved.'});
      } else {
        res.status(200).send({message: 'Password updated.'});
      }
    }); // end add new user
  } else {
    res.status(401).send({message: "Invalid credentials."});
  } // end check authentication
}); // end update password

// forgot password
router.put('/password/forgot', ( req, res ) => {
  // console.log('in forgot password');
  User.findOne({email: req.body.email}, 'privilege', ( err, user ) => {
    if (err) {
      res.status(500).send({message: 'Password reset email not sent.'});
    } else {
      if (user !== null) {
        let updatedPassword = {
          password: randomPass()
        }
        switch (user.privilege) {
          case 2:
            updatedPassword.privilege = 1; // privilege 1: pending
            break;
          default:
            break;
        }
        User.update({email: req.body.email}, updatedPassword).then((response) => {
          //send email to user with updated password
          let messageBody = '<h3>Welcome to Praeco</h3><p>This temporary password can be used to recover your account:</p>';
          messageBody += '<ul><li>username: ' + req.body.email + ' </li><li>password: ' + updatedPassword.password + '</li>';
          messageBody += '</ul> <p>Follow this link to set your own password: <a href=" ' + PRAECO_URL + ' ">Praeco</a></p>';
          let mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: req.body.email,
            subject: 'New Praeco Password',
            html: messageBody
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              // console.log('invite not sent', error);
              res.status(500).send({message: 'Password reset email not sent.'});
            } else {
              res.status(200).send({message: 'Password Updated. Email sent.'});
            } // end check for errors
          }); // end send email
        }); // end update password in DB
      } else {
        res.status(404).send({message: 'Email not found.'});
      } // end check if user is not null
    } // end check for error
  }); // end find id for email
}); // end forgot password

module.exports = router;

// generate number between max and min
var randomNum = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}; // end random number

// generate random password
var randomPass = () => {
  let passLength = 9; // must be divisible by 3
  let pass = '';
  for (var i = 0; i < passLength / 3; i++) {
    pass += String.fromCharCode(randomNum(122, 97)); // low - 97 to 122
    pass += String.fromCharCode(randomNum(90, 65)); // caps - 65 to 90
    pass += String.fromCharCode(randomNum(57, 48)); // num - 48 to 57
  }
  return pass;
}; // end password generator
