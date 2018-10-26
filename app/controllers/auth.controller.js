const path = require('path'),
			async = require('async'),
			fs = require('fs'),
			crypto = require('crypto'),
			jwt = require('jsonwebtoken'),
			nodemailer = require('nodemailer'),
			hbs = require('nodemailer-express-handlebars'),
			sanitize = require('mongo-sanitize'),
			request = require('request');
			
const	errorHandler = require('./error-handler.controller');

const User = require('./../models/user.model');
const config = require('./../config/config');
const regexes = require('./../regexes/regexes');

const email = process.env.MAILER_EMAIL_ID || config.smtp_email;
const password = process.env.MAILER_PASSWORD || config.smtp_password;

const smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  auth: {
    user: email,
    pass: password
  }
});

const handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve(__dirname + '/../templates/'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));
 
function generateToken(user) {
	return jwt.sign(user, config.rsa_private_key, {
		algorithm: 'RS256',
		expiresIn: '12h'
	});
}
 
function setUserInfo(request) {
  return {
		_id: request._id,
    name: request.name,
    surname: request.surname,
		email: request.email,
		ltc: request.last_token_security_code
  };
}
 
exports.login = function(req, res, next) {
	let userInfo = setUserInfo(req.user);
	res.status(200).json({ token: generateToken(userInfo) });
}

exports.logout = function(req, res, next){
	let token = req.get('Authorization').split(' ')[1];
	jwt.verify(token, config.rsa_public_key, function(err, decoded) {
		if (err) {
			errorHandler.answerWithError({custom_code: 401}, req, res);
		} else if (!err && decoded) {
			let s_id = decoded._id;
			let s_ltc = decoded.ltc;
			User.findOneAndUpdate({ _id: s_id, last_token_security_code: s_ltc }, 
														{ $unset: { last_token_security_code: null }}, { new: true }).exec(function(err, user) {
				if (err) {
					errorHandler.answerWithError(err, req, res);
				} else if (!err && user) {
					res.status(200).send({message: 'Ok'});
				} else {
					errorHandler.answerWithError({custom_code: 401}, req, res);
				}
			});
		}
	});	
}

exports.register = function(req, res, next) {
	let name = req.body.name;
  let surname = req.body.surname;
  let s_email = sanitize(req.body.email.toLowerCase());
	let password = req.body.password;

	async.waterfall([
		_checkRequestBody,
		_checkUser,
		_saveNewUser
	], function (err, user_token) {
		if (err) {
			return errorHandler.answerWithError(err, req, res);
		} else {
			return res.status(201).send({token: user_token});
		}
	});

	function _checkRequestBody(done) {
		if(!regexes.password_regex.test(password) || !regexes.email_regex.test(email)){
			done({custom_code: 400});
		} else {
			done(null);
		}
	}

	function _checkUser(done) {
		User.findOne({email: s_email}, function(err, existingUser){
			if(err){
				done(err);
			} else if(existingUser){
				done({ custom_code: 422, custom_message: 'Email address already in use'})
			} else {
				done(null);
			}
		});
	}

	function _saveNewUser(done) {
		let user = new User({
			name: name,
			surname: surname,
			email: s_email,
			password: password,
		});
		user.save(function(err, user){
			if (err) {
				done(err);
			} else {
				let userInfo = setUserInfo(user);
				let token = generateToken(userInfo);
				done(null, token);
			}
		});
	}
}

exports.recoverPassword = function (req, res, next) {
	let s_email = sanitize(req.body.email);

	async.waterfall([
    _checkRequestBody,
    _checkCaptchaValidity,
		_checkUserAndTokenValidity,
		_generateTempToken,
		_updateUser,
		_sendEmail
	], function (err, token) {
		if (err) {
			return errorHandler.answerWithError(err, req, res);
		} else {
			return res.status(200).json({token: token});
		}
	});

	function _checkRequestBody(done) {
		if (!req.body.email || !regexes.email_regex.test(req.body.email) || !req.body.captchaPayload) {
			done({custom_code: 400});
		} else {
			done(null);
		}
	}

	function _checkCaptchaValidity(done) {
		const captchaSecretKey = config.captcha_secret_key;
		const captchaPayload = req.body.captchaPayload;
		const remoteAddress = req.connection.remoteAddress;
		const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecretKey}&response=${captchaPayload}`;
		request.post(captchaVerificationUrl, function(error, response, body) {
			let parsed_body = JSON.parse(body);
			if (parsed_body.success){
				done(null);
			} else {
				done({custom_code: 400});
			}
		});
	}
	// checa se o usuário existe e se já existe um token válido
	function _checkUserAndTokenValidity(done) {
		User.findOne({ email: { $in: [ s_email ] } }).exec(function(err, user) {
			if (err) {
				done(err);
			} else if (!err && !user) {
				done({custom_code: 422, custom_message: 'No user found'});
			} else {
				if (user.reset_password_expires && user.reset_password_expires > Date.now()) {
					done({custom_code: 422, custom_message: 'Request already made'});
				} else {
					done(null, user);
				}
			}
		});
	}

	function _generateTempToken(user, done) {
		crypto.randomBytes(64, function(err, buffer) {
			if (err) {
				done(err);
			} else {
				let token = buffer.toString('hex');
				done(null, user, token);
			}
		});
	}
	
	function _updateUser(user, token, done) {
		User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token, reset_password_expires: Date.now() + 21600000 }, { upsert: true, new: true }).exec(function(err, new_user) {
      done(err, token, new_user);
    });
	}

	function _sendEmail(token, user, done){
		let serviceUrl = config.serviceUrl;
		let port = process.env.PORT || '3000';
		let data = {
			to: user.email,
			from: email,
			template: 'forgot-password-email',
			subject: 'SolidBits - Solicitação de alteração de senha',
			context: {
				url: `https://${serviceUrl}:${port}/auth/resetar-senha?token=${token}`,
				name: user.name.split(' ')[0]
			}
		};
		smtpTransport.sendMail(data, function(err){
			if (err) {
				done(err);
			} else {
				done(null, {custom_message: 'Success'});
			}
		});
	}
}

exports.resetPassword = function(req, res, next) {
	let s_token = sanitize(req.query.token);

	if (req.method == "GET") {
		async.waterfall([
			_checkUserAndTokenValidity
		], function(err, user) {
			if (err) {
				return errorHandler.answerWithError(err, req, res);
			} else {
				return res.status(200).send({message: 'Authorized'});
			}
		});
	} else {
		async.waterfall([
			_checkRequestBody,
			_checkUserAndTokenValidity,
			_updateUser,
			_sendEmail
		], function(err, success) {
			if (err) {
				return errorHandler.answerWithError(err, req, res);
			} else {
				return res.status(200).json({ message: success.custom_message });
			}
		});
	}

	function _checkRequestBody(done) {
		if (!req.body.password || !req.body.verifyPassword || req.body.password !== req.body.verifyPassword ||!regexes.password_regex.test(req.body.password)) {
			done({custom_code: 400});
		} else {
			done(null);
		}
	}

	function _checkUserAndTokenValidity(done) {
		User.findOne({ reset_password_token: { $in: [ s_token ] }, reset_password_expires: { $gt: Date.now() } }).exec(function(err, user) {
			if (err) {
				done(err);
			} else if (!err && !user) {
				done({custom_code: 400});
			} else if (!err && user) {
				done(null, user);
			}
		});
	}

	function _updateUser(user, done) {
		user.password = req.body.password;
		user.reset_password_token = undefined;
		user.reset_password_expires = undefined;
		user.last_token_security_code = undefined;
		user.save(function(err) {
			done(err, user);
		});
	}

	function _sendEmail(user, done) {
		var data = {
			to: user.email,
			from: email,
			template: 'reset-password-email',
			subject: 'SolidBits - Confirmação de alteração de senha',
			context: {
				name: user.name.split(' ')[0]
			}
		};
		smtpTransport.sendMail(data, function(err) {
			if (err) {
				done(err);
			} else {
				return done(null, { custom_message: 'Success' });
			}
		});
	}
}

exports.roleAuthorization = function(roles) {
	return function(req, res, next){
		let user = req.user;
		let s_id = sanitize(user._id);
		User.findById(s_id, function(err, foundUser){
			if(err){
					res.status(422).json({error: 'No user found.'});
					return next(err);
			}
			if(roles.indexOf(foundUser.role) > -1){
					return next();
			}
			res.status(401).json({error: 'Unauthorized'});
			return next('Unauthorized');
		});
	}
}