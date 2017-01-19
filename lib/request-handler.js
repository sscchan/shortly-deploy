var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var mongodb = require('../app/configMongoose.js');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  console.log('request-handler.js: fetchLinks: currentUsername: ', req.session.user.username);
  var currentUser = req.session.user.username;

  Link.find({creatorUserName: currentUser}).then(function(Links) {
    console.log('request-handler.js: fetchLinks: links belonging to user: ', Links);
    res.status(200).send(Links);
  });
  
  // Old SQL Bookshelf based code
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  var currentUser = req.session.user.username;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }


  Link.find({url: uri, creatorUserName: currentUser}).then(function(links) {
    if (links.length !== 0) {
      console.log('request-handler.js : saveLink: link already exist:');
      console.log(links);
      res.status(200).send(links[0]);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          creatorUserName: req.session.user.username,
          visits: 0,
          'created_at': new Date(),
          'updated_at': new Date()
        });
        console.log('request-handler.js : saveLink: newLink object: ', newLink);
        newLink.createShortenedURL().then(function() {
          newLink.save()
          .then(function(newLink) {
            // Links.add(newLink);
            return res.status(200).send(newLink);
          });
        });

      });

    }
  });



 // Old SQL Bookshelf based code
  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.status(200).send(found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.sendStatus(404);
  //       }
  //       var newLink = new Link({
  //         url: uri,
  //         title: title,
  //         baseUrl: req.headers.origin
  //       });
  //       newLink.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.status(200).send(newLink);
  //       });
  //     });
  //   }
  // });


};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username})
    .then(function(user) {
      // console.log('request-handler.js loginUser: DB find username success');
      if (!user) {
        // console.log('request-handler.js loginUser: no user found');
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          // console.log('request-handler.js loginUser: compared password matching: ', match);
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });        
      }
    })
    .catch(function(error) {
      // console.log('request-handler.js loginUser: DB find username failed');
      console.log('Error: ', error);
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // Old SQL Bookshelf code:
  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });

  User.findOne({ username: username })
    .then(function(user) {
      console.log('request-handler.js signupUser: DB find username op success');
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.hashPassword()
          .then(function(newUser) {
            console.log('request-handler.js signupUser: Create New User');
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });    

};

exports.navToLink = function(req, res) {

  Link.find({code: req.params[0]}).then(function(links) {
    console.log('request-handler.js: navToLink: database searched for shortened URL: ', links);
    if (links.length === 0) {
      res.redirect('/');
    } else {
      console.log('request-handler.js: navToLink: navigate to link: ', links[0]);
      var currentLink = links[0];
      if (currentLink.visits === undefined) {
        currentLink.visits = 1;
      } else {
        currentLink.visits = currentLink.visits + 1;
      }
      currentLink.save()
      .then(function() {
        return res.redirect(currentLink.url);
      })
      .catch(function(err) {
        console.log('request-handler.js: navToLink: linkSave error: ', err);
      });
    }
  });
  // Old SQL Bookshelf Code
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};