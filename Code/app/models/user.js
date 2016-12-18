var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
 
// Thanks to http://blog.matoski.com/articles/jwt-express-node-mongoose/
 
// set up a mongoose model
var UserSchema = new Schema({
  name: {
      type: String,
      unique: true,
      required: true
  },
  password: {
      type: String,
      required: true
  },

  userInfo: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    bio: {
      type: String
    },
    height: {
      feet: {
        type: Number
      },
      inches: {
        type: Number
      }
    },
    weight: {
      type: Number
    },
    gender: {
      type: String
    },
    dateOfBirth: {
      type: Date
    },
    schoolInfo: {
      school: {
        type: String
      },
      grade: {
        type: String
      }
    },
    photos: { // placeholder for images
      type: String
    }
  },
  fitnessGoals: {
    personal: {
      type: String
    },
    workoutTime: {
      type: String
    },
    fitnessLevel: {
      type: String
    },
    goalWeight: {
      type: Number
    },
    genderPreference: {
      type: String
    }
  },
  matches: {
    accepted: {
      type: String
    },
    passed: {
      type: [String]
    },
    blocked: {
      type: [String]
    }
  }
});
 
UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
 
UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
 
module.exports = mongoose.model('User', UserSchema);