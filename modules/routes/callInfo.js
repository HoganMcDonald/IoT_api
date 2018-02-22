const router = require('express').Router();
const Contacts = require('../models/contactsModel');
const Devices = require('../models/devicesModel');

const VoiceResponse = require('twilio').twiml.VoiceResponse;

// post request for twilio to send custom twiml
router.post('/:deviceID', (req, res) => {
  // find matching device object
  Devices.findOne({device_id: req.params.deviceID}, ( err, device ) => {
    if (err) {
      res.sendStatus(404);
    } else {
      const response = new VoiceResponse();
      response.say('Your Praeco device has been triggered. ' +  device.text_message);
      res.send(response.toString());
    } // end handle mongo error
  }); // end find matching device
}); //end router post

module.exports = router;
