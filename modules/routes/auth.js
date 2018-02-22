// requires
const router = require('express').Router();
const bodyParser = require('body-parser');

//uses
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

//routes
//get logged in user
router.get('/', (req, res) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    let userObj = {
      first_name: req.user[0].first_name,
      last_name: req.user[0].last_name,
      email: req.user[0].email,
      phone: req.user[0].phone,
      privilege: req.user[0].privilege,
      id: req.user[0]._id,
      access_token: req.user[0].access_token ,
      primary_contact: req.user[0].primary_contact
    }
    res.send(userObj);
  } else {
    res.status(401).send({message: 'user not logged in'});
  }//end check authentication
});//end get user

//export module
module.exports = router;
