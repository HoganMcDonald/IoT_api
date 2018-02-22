const router = require('express').Router();
const Devices = require('../models/devicesModel');


// includesID function: returns true if object with matching ID exists in array
var includesById = (arr, object) => {
  if (object.device_id) {
    let objectID = object.device_id;
    for (var i = 0; i <= arr.length; i++) {
      if (i === arr.length) {
        return false;
      }
      if (arr[i].id === objectID) {
        return true;
      }
    } // end loop
  } else {
    let objectID = object.id;
    for (var i = 0; i <= arr.length; i++) {
      if (i === arr.length) {
        return false;
      }
      if (arr[i].device_id === objectID) {
        return true;
      }
    } // end loop
  } // end check object property
}; // end includesID function


// gets all devices belonging to a certain user that are stored in the DB
function getDevicesByID(id) {
  return Devices.find({user_id: id}); // end devices find
} // end get devices by id


// delete devices from DB that are no longer in particle
function deleteRemovedDevices(DBarray, particleArray) {
    for (var i = 0; i < DBarray.length; i++) {
      console.log('delete array', i);
      // will return true if DBarray[i] is in particleArray
      if (!includesById(particleArray, DBarray[i])) {
        Devices.remove({device_id: DBdevices[i].device_id}).then( ( err, response ) => {
          console.log('entry deleted', response);
        }); // end remove device
      } // end check for device to be removed
    } // end loop through DBarray
    return DBarray;
} // end deleteRemovedDevices


// create/update existing devices
function createOrUpdateDevices( DBdevices, particleDevices, userID ) {
  console.log('hit createOrUpdateDevices');
  for (var i = 0; i < particleDevices.length; i++) {
    console.log('loop thru particleDevices:', i);
    // if device does not exist in DB, create device in DB
    if (!includesById(DBdevices, particleDevices[i])) {
      let newDevice = {
        user_id: userID,
        device_name: particleDevices[i].name,
        device_id: particleDevices[i].id,
        contacts: [],
        cellular: particleDevices[i].cellular,
        connected: particleDevices[i].connected,
        last_heard: particleDevices[i].last_heard,
        notes: particleDevices[i].notes,
        status: particleDevices[i].status
      }
      var newRecord = Devices(newDevice);
      // console.log('NEW RECORD:', newRecord);
      newRecord.save().then((err, response) => {
        console.log('save response', response);
      });
    } else {
      // create custom object to update in DB
      let updatedDevice = {
        device_name: particleDevices[i].name,
        cellular: particleDevices[i].cellular,
        connected: particleDevices[i].connected,
        last_heard: particleDevices[i].last_heard,
        notes: particleDevices[i].notes,
        status: particleDevices[i].status
      }
      // if not find object in DB and push
      Devices.update({device_id: particleDevices[i].id}, updatedDevice).then((response) => {
        console.log('update response', response);
      });

    } // end check if already exists in DB
  } // end particleDevices loop
  return 'created';
}


// update DB with results of particle get client side.
router.post('/:id', (req, res) => {
  console.log('req.body', req.body);
  if (req.isAuthenticated()) {
    var userID = req.params.id;
    var particleDevices = req.body;

    getDevicesByID(userID)
      .then(DBdevices => deleteRemovedDevices( DBdevices, particleDevices ) ) // end get all devices
      .then(DBdevices => createOrUpdateDevices( DBdevices, particleDevices, userID ) )
      .then(response => getDevicesByID( userID ) )
      .then(updatedDevices => res.send( updatedDevices ) )
      .catch(error => res.send( error ));

  } else {
    res.status(401).send({
      message: "Invalid credentials."
    });
  } // end check if user is authenticated
}); // end devices post


// updates contacts per device
router.put('/:id', (req, res) => {
  if (req.isAuthenticated()) {
    let deviceID = req.params.id;
    let updatedDevice = req.body;
    console.log(deviceID);
    console.log(updatedDevice);
    // console.log(contacts);
    // update device contacts in DB
    Devices.update({
      _id: deviceID
    }, updatedDevice, (err, response) => {
      if (err) {
        res.status(500).send({
          message: 'Device not updated.',
          error: err
        });
      } else {
        res.status(200).send({
          message: 'Device updated.'
        });
      } // end check for error
    }); // end devicesUpdate
  } else {
    res.status(401).send({
      message: "Invalid credentials."
    });
  } // end check if authenticated
}); // end devices put

module.exports = router;
