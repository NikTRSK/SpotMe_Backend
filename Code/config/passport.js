let JwtStrategy = require('passport-jwt').Strategy;
ExtractJwt = require('passport-jwt').ExtractJwt; // Surprise surprise an update broke Auth. Added this.
 
// load up the user model
let User = require('../app/models/user');
// let config = require('../config/database'); // get db config file
let config = require('config'); // get db config file

module.exports = function(passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader(); // Surprise surprise an update broke Auth. Added this.
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.findOne({id: jwt_payload.id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};