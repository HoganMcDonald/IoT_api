// requires
const router = require('express').Router();
const Contacts = require('../models/contactsModel');
const Users = require('../models/usersModel');
const Devices = require('../models/devicesModel');

// nodemailer credentials
const fromEmail = process.env.EMAIL_USERNAME;
const secret = process.env.NOTIFICATION_SECRET;

// twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// require notification services
const client = require('twilio')(accountSid, authToken); //require the Twilio module and create a REST client
const nodemailer = require('nodemailer');

// nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: fromEmail,
    pass: process.env.EMAIL_PASSWORD
    //  || config.gmailPassword
  }
});

// Post to the Twilio API - call
function sendCall( phoneNumber, device ) {
  client.calls.create({
    url: 'https://praeco-iot.herokuapp.com/callInfo/' + device.device_id,
    to: '+1' + phoneNumber,
    from: fromNumber,
  }).then((call) => {
    process.stdout.write(call.sid)
  });
} // end sendSMS

// Post to the Twilio API - sms
function sendSMS( phoneNumber, message ) {
  const sms = {
    to: '+1' + phoneNumber,
    from: fromNumber,
    body: message
  };
  return client.messages.create(sms);
} // end sendSMS

// Send email via nodemailer
function sendEmail(email, message) {
  const mailOptions = {
    from: `"Lab651" <${fromEmail}>`,
    to: email,
    subject: 'Sensor Notification', // TODO what should this be
    text: message
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      return resolve(info);
    });
  });
} // end sendEmail

// loop through contacts and send messages
function notifyContacts(device) {
  let textMessage = device.text_message;
  let emailMessage = device.email_message;
  let contacts = device.contacts; // array of Contact _ids
  for (var i = 0; i < contacts.length; i++) {
    Contacts.findOne({_id: contacts[i]}, ( err, contact ) => {
      if (err) {
        return err;
      } else {
        //check for phone
        if (contact.phone) {
          sendSMS(contact.phone, textMessage);
          sendCall(contact.phone, device);
        }
        //check for email
        if (contact.email) {
          sendEmail(contact.email, emailMessage);
        }
      } // end err - findOne contact
    }); // end findOne contact
  } // end loop through contacts array on device document
  return 'done';
} //

// Send notifications, currently sms and email, if secret is valid
router.post('/:id', (req, res, next) => {
  // check secret
  if (req.body.secret === secret) {
    let deviceID = req.params.id
    Devices.findOne({device_id: deviceID}, ( err, response ) => {
      if (err) {
        res.sendStatus(500);
      } else {
        if (response !== null) {
          return response;
        } else {
          res.sendStatus(404);
        } // end check if device is registered in DB
      } // end err - findOne device
    }) // end find device
    .then(response => {
      Users.findOne({_id: response.user_id}, (err, user) => {
        if (user.privilege === 2) {
          notifyContacts(response);
        } else {
          res.sendStatus(401);
        } // end compare privilege
      }); // end find user
    }) // end notify contacts
    .then(response => {
      res.sendStatus(200);
    })
    .catch(error => {
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(403);
  } // end compare secrets
}); // end post notifications

module.exports = router;
