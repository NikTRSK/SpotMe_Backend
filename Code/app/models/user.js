let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcryptjs');
 
// Thanks to http://blog.matoski.com/articles/jwt-express-node-mongoose/
 
// set up a mongoose model
let UserSchema = new Schema({
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
      type: Number
    },
    weight: {
      type: Number
    },
    gender: {
      type: String
    },
    age: {
      type: Number
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
      data: Buffer,
      contentType: String
    }
  },
  lastViewedUser: {
    type: Schema.Types.ObjectId
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
    accepted: [{
      id: Schema.Types.ObjectId,
      messages : [{
        conversationID : Schema.Types.ObjectId,
        author: String,
        bodydd: String
      }]
    }],
    passed: [{
      id: Schema.Types.ObjectId
    }],
    blocked: [{
      id: Schema.Types.ObjectId
    }]
  }
});

UserSchema.pre('save', function (next) {
  let user = this;
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

UserSchema.statics.getFirstEntry = function(cb) {
  let model = this.model("User");
  model.findOne({}, {"_id" : 1}).exec(function(err, user) {
    if (err) return cb(err);
    // console.log("FIRST:" + user);
    if (user) {
      cb(null, user);
    } else {
      // If user is null, we've wrapped around.
      model.findOne(cb);
    }
  });
};

module.exports = mongoose.model('User', UserSchema);