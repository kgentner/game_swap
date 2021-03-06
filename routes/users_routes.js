'use strict';

var User = require('../models/user');
var Game = require('../models/game');

module.exports = function(app) {

  app.get('/api/user', function(req, res) {//passport.authenticate('basic', {session: false}),
    var email = req.query.email;
    var password = req.query.password;
    console.log("pw", password);
    console.log("email", email);

    User.findOne({'email': email}, function(err, user) {
      if (err) return res.status(500).json({error: 1});
      console.log(user);
      if (!user) return res.status(400).json({"error": 6});

      //check to see if password is valid
      if (!user.validPassword(password)) return res.status(400).json({"error": 4});

      res.status(200).json({error: 0, jwt: user.generateToken(app.get('jwtSecret'))});
    });
  });

  //creating a new user
  app.post('/api/user', function(req, res) {
    var email = req.query.email;
    var password = req.query.password;
    var screenname = req.query.screenname;
    var loc = req.query.zip;

    User.findOne({'email': email}, function(err, user) {
      if (err) return res.status(400).json({error: 1});

      if (user) return res.status(400).json({error: 2});

      if (req.body.password && (req.body.password === req.body.email)) {
        return res.status(400).json({error:3});
      }

      //password pattern: any 8-12 character length combo of ASCII
      //with at least one number and one letter
      var passwordPattern = /^(?=.*\d+)(?=.*[a-z A-Z])[ -~]{8,12}$/;
      if (!passwordPattern.test(password)) {
        return res.status(400).json({error: 4});
      }

      var newUser = new User();
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      //insert code to make sure password and confirmation password match
      newUser.screenname = screenname;
      newUser.zip = loc;

      newUser.save(function(err, data) {
        //console.log(data);
        if (err) return res.status(400).json({error: 1});
        res.status(200).json({error:0, jwt: newUser.generateToken(app.get('jwtSecret'))});
      });
    });
  });

  /*app.delete('/api/users', jwtadminauth, function(req, res) {
    User.findOne({'basic.email': req.body.email}, function(err, user) {
      if (err) return res.status(500).send('server error');
      if (!user) return res.status(500).send('user not found');

      User.remove({'basic.email': req.body.email}, function(err) {
        if (err) return res.status(500).send('server error');
        return res.status(200).send('user deleted');
      });
    });
  });*/
};