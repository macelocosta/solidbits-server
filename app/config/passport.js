const sanitize = require('mongo-sanitize');
const passport = require('passport');
const crypto = require('crypto');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const authController = require('./../controllers/auth.controller');
const User = require('./../models/user.model');
const config = require('./config');

const localOptions = {
  usernameField: 'email'
};
 
let localLogin = new LocalStrategy(localOptions, function(email, password, done){
  let s_email = sanitize(email);
  User.findOne({ email: { $in: [ s_email ] } }, function(err, user){
    if(err){
      return done(err);
    }
    if(!user){
      return done(null, false, {error: 'Login failed. Please try again.'});
    }
    user.comparePassword(password, function(err, isMatch){
      if(err){
        return done(err);
      }
      if(!isMatch){
        return done(null, false, {error: 'Login failed. Please try again.'});
      }
      crypto.randomBytes(32, function(err, buffer) {
        if (err) {
          return done(err);
        } else {
          user.last_token_security_code = buffer.toString('hex');
          user.save(function(err, user) {
            if (err) {
              return done(err);
            } else if (user) {
              return done(null, user);
            }
          });
        }
      });
      
    });
  });
});
 
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.rsa_public_key
};
 
let jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
  let s_id = sanitize(payload._id);
  let s_ltc = sanitize(payload.ltc);
  User.findById(s_id, function(err, user){
    if(err){
      return done(err, false);
    }
    if(user){
      if (user.last_token_security_code == s_ltc) {
        done(null, user);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  });
});
 
passport.use(jwtLogin);
passport.use(localLogin);