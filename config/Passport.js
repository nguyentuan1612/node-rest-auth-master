var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
var User = require('../models/user');
var config = require('../config/database'); // get db config file

const cookieExtractor = function(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
    // console.log("HIHI "+token );
  }
  return token;
};

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    cookieExtractor
  ]);
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    let user = await User.findOne({_id: jwt_payload.id});
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
  }));
};
