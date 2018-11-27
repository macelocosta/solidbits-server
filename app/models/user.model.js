const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  last_token_security_code: {
    type: String,
    required: false
  },
  reset_password_token: {
    type: String
  },
  reset_password_expires: {
    type: String
  }
}, {
  timestamps: true
});

// hasheia a senha antes de salvar no bd
UserSchema.pre('save', function(next){
  var user = this;
  var salt_factor = 10;
  if(!user.isModified('password')){
    return next();
  }
  bcrypt.genSalt(salt_factor, function(err, salt){
    if(err){
      return next(err);
    }
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err){
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(passwordAttempt, cb){
  bcrypt.compare(passwordAttempt, this.password, function(err, isMatch){
    if(err){
      return cb(err);
    } else {
      cb(null, isMatch);
    }
  });
}

module.exports = mongoose.model('User', UserSchema);