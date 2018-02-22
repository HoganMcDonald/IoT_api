// requires
const router = require('express').Router();
const passport = require ('passport');

//logout route
router.post('/', ( req, res ) => {
  console.log('in router.post');
  req.logout();
  // res.redirect('/');
  res.sendStatus(200);
}); // end logout

//export
module.exports = router;
