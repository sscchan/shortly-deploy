// var db = require('../config');
var mongoose = require('../configMongoose.js');

var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

// Old SQL Bookshelf Calls
// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function() {
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function() {
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });


var usersSchema = mongoose.Schema({
  username: String,
  password: String,
  'created_at': Date,
  'updated_at': Date
});

usersSchema.methods.comparePassword = function(attemptedPassword, callback) {
  // console.log('user.comparePassword: ', attemptedPassword, ' against ', this.password);
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

usersSchema.methods.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      console.log('user.hashPassword function: hashvalue: ', hash);
      this.save();
    });
};

var User = mongoose.model('Users', usersSchema);

console.log(User.comparePassword);

module.exports = User;
