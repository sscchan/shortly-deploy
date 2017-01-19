var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var mongodb = mongoose.connection;

mongodb.on('error', function(error) {
  console.log('configMongoose.js - Mongoose connection onError event triggered.');
  console.log('Error: ', error);
});

mongodb.on('open', function() {
  console.log('configMongoose.js - Mongoose connection successfully opened.');


});

var urlsSchema = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  'created_at': Date,
  'updated_at': Date
});

var usersSchema = mongoose.Schema({
  username: String,
  password: String,
  'created_at': Date,
  'updated_at': Date
});

var Urls = mongoose.model('Urls', urlsSchema);
var Users = mongoose.model('Users', usersSchema);


module.exports = mongodb;
module.exports.Urls = Urls;
module.exports.Users = Users;

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('baseUrl', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });
