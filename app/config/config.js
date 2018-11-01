const	fs = require('fs');

// database, mqtt, ext_url
exports.service_url = 'localhost';
exports.database_url = 'mongodb://supersolid:da39a3ee5e6b@ds259802.mlab.com:59802/solidbits';
exports.mqtt_port = 1883;

// e-mail
exports.smtp_email = 'solidbits.noreply@gmail.com';
exports.smtp_password = 'GS6:>K+G-DN9G(n+';

//jwt keys
exports.rsa_private_key = fs.readFileSync(__dirname + '/../jwt-keys/jwtRS256.key', 'utf-8');
exports.rsa_public_key = fs.readFileSync(__dirname + '/../jwt-keys/jwtRS256.key.pub', 'utf-8');

//captcha
exports.captcha_secret_key = '6LdEx3cUAAAAAJkaY9vRZgWQkuMqRrNMziEy-0Qx';