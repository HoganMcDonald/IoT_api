#!/usr/bin/env node
require('dotenv').config({path:'../config.env'});

// requires
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./modules/strategies/userStrategy');

// require routes
const index = require('./modules/routes/index');
const login = require('./modules/routes/login');
const register = require('./modules/routes/register');
const users = require('./modules/routes/users');
const contacts = require('./modules/routes/contacts');
const devices = require('./modules/routes/devices');
const temp = require('./modules/routes/temp');
const auth = require('./modules/routes/auth');
const logout = require('./modules/routes/logout');
const notifications = require('./modules/routes/notifications');
const callInfo = require('./modules/routes/callInfo');
let app = express();

// uses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// create session and tell app to use it
app.use(session({
  secret: 'my secret',
  key: 'user',
  resave: true,
  saveUninitialized: false,
  cookie: { maxage: 43200000, secure: false }
}));

// passport set up
app.use(passport.initialize());
app.use(passport.session());

// use routes
app.use('/login', login);
// app.use('/register', register); // register an admin
app.use('/users', users);
app.use('/users/contacts', contacts);
app.use('/devices', devices);
// app.use('/temp', temp); // test a single webhook
app.use('/auth', auth);
app.use('/', index);
app.use('/logout', logout);
app.use('/notifications', notifications);
app.use('/callInfo', callInfo);

// mongo set up
const MongoURI = process.env.MONGODB_URI
const MongoDB = mongoose.connect(MongoURI).connection;
MongoDB.on('error', ( err ) => {
  console.log('mongodb connection error:', err);
});
MongoDB.once('open', () => {
  console.log('mongodb connection is open');
});

// server
const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log('Server listening on port', server.address().port));

// module.exports = server;
