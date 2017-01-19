var mongoose = require('mongoose');
mongose.connect('mongodb://localhost/test');

var mongodb = mongoose.connection;

mongodb.on('error', function() {
  console.log('configMongoose.js - Mongoose connection onError event triggered.');
});

mongodb.on('open', function() {
  console.log('configMongoose.js - Mongoose connection successfully opened.');

});

module.exports = mongodb;