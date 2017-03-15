let express     = require('express');
let app         = express();
let bodyParser  = require('body-parser');
let morgan      = require('morgan');
let mongoose    = require('mongoose');
let passport  = require('passport');
let config      = require('./config/database'); // get db config file
let User        = require('./app/models/user'); // get the mongoose model
let port        = process.env.PORT || 8080;
let jwt         = require('jwt-simple');
// added to fix cors issue
let cors        = require('cors');
// handling image uploads
let fs = require('fs');
let multer = require('multer');
let co = require('co');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());

// Setup for image uploads
// app.use(multer({ dest: './data/img/',
//   rename: function (fieldname, filename) {
//     return filename;
//   }
// }));

app.use(multer({dest:'./data/img/'}).single('photo'));
// var upload = multer({dest:'./data/img/'});
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

    User.getFirstEntry(function (err, id) {
      console.log(id);
      newUser.lastViewedUser = id._id;
      // save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Username already exists.'});
        }
        res.json({success: true, msg: 'Successful created new user.'});
      });
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

        console.log("ORIGINAL: " + req.body + " 1: " + req.body.workoutTime + " 2: " + req.body.genderPreference);
        console.log("MYUSER: " + user);
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

/*// Handle image uploads
apiRoutes.put('/setphoto', passport.authenticate('jwt', { session: false}), function(req, res) {
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
        if (req.body.photo != null) {
          user.userInfo.photos = fs.readFileSync(req.files.userPhoto.path);
          user.userInfo.photos.contentType = 'image/jpg';

        // user.save();
        user.save(function(err) {
          if (err)
            return res.send(err);

          return res.json({success: true, msg: 'image update succesfull' + user});
        });
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});*/
// Handle image uploads
apiRoutes.put('/setphoto', function(req, res) {
  // console.log(req.body);
  //
  console.log(req.file);

  User.findOne({
    name: req.body.name
  }, function (err, user) {
    // console.log(user);
    if (err) throw err;

    if (!user) {
      return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
      // if (req.body.photo != null) {
        user.userInfo.photos.data = fs.readFileSync(req.file.path);
        user.userInfo.photos.contentType = 'image/jpg';

        console.log(user);
        // user.save();
        user.save(function (err) {
          if (err)
            return res.send(err);

          return res.json({success: true, msg: 'image update succesfull' + user});
        });
      // }
    }
  });
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
apiRoutes.put('/getMatches', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    console.log(decoded.user);
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



apiRoutes.post('/getMatch', function(req, res) {
  console.log(req.body);

  // Find a match and return it
  let currentUser = User.findOne({name: req.body.name});
  currentUser.then(function(result) {
    co(function*() {
      const cursor = User.find({ _id : {$gte: result.lastViewedUser} }).cursor();
      for (let nextUser = yield cursor.next(); nextUser != null; nextUser = yield cursor.next()) {
        // Print the user, with the `band` field populated
        console.log(nextUser);
        if (
          nextUser.genderPreference === result.genderPreference &&
          nextUser.userInfo.schoolInfo.school === result.userInfo.schoolInfo.school &&
          nextUser.fitnessGoals.workoutTime === result.fitnessGoals.workoutTime
        ) {
          result.lastViewedUser = nextUser._id;
          return res.json(nextUser);
        }
      }
    });
  });
});

apiRoutes.post('/likeUser', function(req, res) {
  console.log(req.body);
  // userId
  // Find a match and return it
  let currentUser = User.findOne({name: req.body.name});
  currentUser.then(function(user) {
    let userToAdd = new User();
    userToAdd.id = req.body.matchID;
    userToAdd.
    user.matches.accepted.push(userToAdd);
    user.save(function (err) {
      if (err)
        return res.send(err);

      return res.json({success: true, msg: 'user liked' + user});
    });
  });
});

apiRoutes.post('/passUser', function(req, res) {
  console.log(req.body);
  // userId
  // Find a match and return it
  let currentUser = User.findOne({name: req.body.name});
  currentUser.then(function(user) {
    user.matches.passed.push(req.body.matchID);
    user.save(function (err) {
      if (err)
        return res.send(err);

      return res.json({success: true, msg: 'user liked' + user});
    });
  });
});

apiRoutes.post('/dislikeUser', function(req, res) {
  console.log(req.body);
  // userId
  // Find a match and return it
  let currentUser = User.findOne({name: req.body.name});
  currentUser.then(function(user) {
    user.matches.blocked.push(req.body.matchID);
    user.save(function (err) {
      if (err)
        return res.send(err);

      return res.json({success: true, msg: 'user liked' + user});
    });
  });
});

apiRoutes.get('/getMessages', function(req, res) {
  console.log(req.body);
  // userId
  // Find a match and return it
  currentUser.then(function(user) {
    return res.json({success: true, data: user.matches.accepted});
  });
});

apiRoutes.post('/sendMessage', function(req, res) {
  console.log(req.body);
  // userId
  // Find a match and return it
  // let currentUser = User.findOne({name: req.body.name});
  // currentUser.then(function(user) {
  //   user.matches.blocked.push(req.body.matchID);
  //   user.save(function (err) {
  //     if (err)
  //       return res.send(err);
  //
  //     return res.json({success: true, msg: 'user liked' + user});
  //   });
  // });
});

/*TAKE THIS OUT*/
// Get the list of good matches
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
        // User.find({
        //   "$and": [
        //     "name": {"$ne": user.name},
        //     "fitnessGoals.genderPreference": user.genderPreference,
        //     "schoolInfo.school": user.schoolInfo.school,
        //     "fitnessGoals.workoutTime": user.fitnessGoals.workoutTime
        //   ]
        // }, function (err, response) {
        //   if (err) throw err;
        //   else res.json({success: true, msg:response})
        // });
        res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

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

compareUsers = function(user, nextUser) {
  return (
    nextUser.fitnessGoals.genderPreference == user.genderPreference &&
    nextUser.userInfo.schoolInfo.school == user.userInfo.schoolInfo.school &&
    nextUser.fitnessGoals.workoutTime == user.fitnessGoals.workoutTime
  );
};

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);