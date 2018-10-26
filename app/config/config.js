const	fs = require('fs');

// database, mqtt
exports.database_url = 'mongodb://supersolid:da39a3ee5e6b@ds259802.mlab.com:59802/solidbits';
exports.mqtt_port = 1883;

// e-mail
exports.smtp_email = 'solidbits.noreply@gmail.com';
exports.smtp_password = 'GS6:>K+G-DN9G(n+';

//jwt keys
exports.rsa_private_key = fs.readFileSync(__dirname + '/../jwt-keys/jwtRS256.key', 'utf-8');
exports.rsa_public_key = fs.readFileSync(__dirname + '/../jwt-keys/jwtRS256.key.pub', 'utf-8');

//captcha
exports.captcha_secret_key = '6Lfto0EUAAAAABGWXDFRhdTYCJ7Orwt4rmWmXa7g';

// const fs = require('fs');

// exports.RSA_PRIVATE_KEY = {
// 	key: fs.readFileSync(__dirname + '/../keys/jwt/private.key', 'utf8'),
// 	passphrase: 'wCMfxGHMISxEP59gPnwO06OskvFjChXs6jPPenjo4L8D47pgG3FKzj8I7m2HCiSX'
// };

// // used to sign cookies | rsa private key password
// exports.secret = 'wCMfxGHMISxEP59gPnwO06OskvFjChXs6jPPenjo4L8D47pgG3FKzj8I7m2HCiSX';

// exports.RSA_PUBLIC_KEY = fs.readFileSync(__dirname + '/../keys/jwt/public.pem', 'utf8');

// exports.captchaSecretKey = '6Lfto0EUAAAAABGWXDFRhdTYCJ7Orwt4rmWmXa7g';

// exports.databaseUrl = 'mongodb://admin:LIBudgNVt6PXLXh6@ds241677.mlab.com:41677/blocofort';
// // exports.databaseUrl = 'mongodb://127.0.0.1:27017';

// exports.certificatePassphrase = '5PW1F655SM9LRFUF';

// exports.serviceUrl = 'localhost';