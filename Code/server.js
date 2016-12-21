var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
// added to fix cors issue
var cors        = require('cors');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());

// to fix cors issue
app.use(cors());
/////////////

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});
//-------------------------------------------------------------------//
// connect to database
mongoose.connect(config.database);
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

// update user info (upon user creation). Change later to look for user token
apiRoutes.put('/accountInfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        if (req.body.firstName != null)
          user.userInfo.firstName = req.body.firstName;
        if (req.body.lastName != null)
          user.userInfo.lastName = req.body.lastName;
        if (req.body.bio != null)
          user.userInfo.bio = req.body.bio;
        if (req.body.height != null)
          user.userInfo.height = req.body.height;
        if (req.body.weight != null)
          user.userInfo.weight = req.body.weight;
        if (req.body.gender != null)
          user.userInfo.gender = req.body.gender;
        if (req.body.age != null)
          user.userInfo.age = req.body.age;
        if (req.body.school != null)
          user.userInfo.schoolInfo.school = req.body.school;
        // user.userInfo.schoolInfo.grade = req.body.grade;

        if (req.body.personalGoal != null)
          user.fitnessGoals.personal = req.body.personalGoal;
        if (req.body.workoutTime != null)
          user.fitnessGoals.workoutTime = req.body.workoutTime;
        if (req.body.fitnessLevel != null)
          user.fitnessGoals.fitnessLevel = req.body.fitnessLevel;
        if (req.body.goalWeight != null)
          user.fitnessGoals.goalWeight = req.body.goalWeight;
        if (req.body.genderPreference != null)
          user.fitnessGoals.genderPreference = req.body.genderPreference;

        // user.save();
        user.save(function(err) {
          if (err)
            return res.send(err);

          return res.json({success: true, msg: 'update succesfull' + user});
        });
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

// Get the list of good matches. TEST ONLY
apiRoutes.get('/getMatches', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // get all the users that match the same settings as the user
        console.log("Finding matches for " + user.name);
        User.find({
          "name": {"$ne": user.name},
          "$and": [{"fitnessGoals.genderPreference": user.genderPreference},
            {"userInfo.schoolInfo.school": user.userInfo.schoolInfo.school},
            {"fitnessGoals.workoutTime": user.fitnessGoals.workoutTime}
          ]
        }, {"name":1,_id:0}, function(err, users) {
          if (err) throw err;

          return res.json(users);
        });
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});



apiRoutes.post('/getMatches', function(req, res) {
  console.log(req.body);
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      /////////
      console.log("retrieved user" + user);
      User.find({
        "name": {"$ne": user.name},
        "$and": [{"fitnessGoals.genderPreference": user.genderPreference},
        {"userInfo.schoolInfo.school": user.userInfo.schoolInfo.school},
          {"fitnessGoals.workoutTime": user.fitnessGoals.workoutTime}
        ]
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          // Get the match list and return it to the user
          res.json({success: true, msg: 'Welcome in the member area \n' + user});
        }
      });
      ////////
      // Get the match list and return it to the user
      // res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
    }
  });
});




/*// Get the list of good matches
apiRoutes.get('/getMatches', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // Get the match list and return it to the user
        User.find({
          "$and": [
            "name": {"$ne": user.name},
            "fitnessGoals.genderPreference": user.genderPreference,
            "schoolInfo.school": user.schoolInfo.school,
            "fitnessGoals.workoutTime": user.fitnessGoals.workoutTime
          ]
        }, function (err, response) {
          if (err) throw err;
          else res.json({success: true, msg:response})
        });
        res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});*/

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);