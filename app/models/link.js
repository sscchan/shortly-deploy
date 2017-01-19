// var db = require('../config');
var mongoose = require('../configMongoose.js');
var crypto = require('crypto');
var Promise = require('bluebird');

// Old SQL based Code
// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });


var urlsSchema = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  creatorUserName: String,
  'created_at': Date,
  'updated_at': Date
});

urlsSchema.methods.createShortenedURL = function() {
  // console.log('link.js: createShortenedURL: this: ', this);
  var urlToShorten = this.url;
  var currentLink = this;

  return new Promise(function(resolve, reject) {
    var shasum = crypto.createHash('sha1');
    // console.log('link.js: createShortenedURL: url argument for shasum.update: ', urlToShorten);
    shasum.update(urlToShorten);
    currentLink.code = shasum.digest('hex').slice(0, 5);
    // console.log('link.js: createShortenedURL: link object: ', currentLink);
    resolve(currentLink.code);
  });
};


var Link = mongoose.model('Urls', urlsSchema);

module.exports = Link;
