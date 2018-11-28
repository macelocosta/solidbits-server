// const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const body_parser = require('body-parser');
const helmet = require('helmet');
const serve_static = require('serve-static');
const mongoose = require('mongoose');
const mosca = require('mosca');

const config = require('./app/config/config');
const api_routes = require('./app/routes/api.routes');
const mosca_routes = require('./app/routes/mosca.routes');
let app = express();

let production = process.env.NODE_ENV === 'production'

// get port from environment and store in Express
let port = process.env.PORT || '80';
app.set('port', port);

// parsers for POST data
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

// create HTTPS server
let server = https.createServer({
  key: fs.readFileSync('./app/certificates/server.key'),
  cert: fs.readFileSync('./app/certificates/server.cert')
}, app);
// let server = http.createServer(app);
server.listen(port, () => console.log(`[HTTP Server] Running on port ${port}`));

// http header security improvements - helmet
app.use(helmet());
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'"],
//     scriptSrc: ["'self'", 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
//     frameSrc: ["'self'", 'https://www.google.com/recaptcha/']
//   }
// }))

// deal Cross Origin Resource Sharing (CORS) issues we might run into
app.use(cors());

// log requests using Morgan
// app.use(morgan('dev'));

// chokidar/reload config for live-reload on changes if not in production
if (!production) {
  let chokidar = require('chokidar');

  let watcher = chokidar.watch('./app');
  watcher.on('ready', function() {
    watcher.on('all', function() {
      console.log("[Chokidar] Clearing cache")
      Object.keys(require.cache).forEach(function(id) {
        if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id]
      })
    })
  });

  console.log('[Chokidar / Reload] Watching for changes');
}

// point static path to public
app.use(serve_static(path.join(__dirname, 'app/public')));

// set API routes
app.use('/api', api_routes);

// catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/index.html'));
});

// Mongoose settings
let mongoose_connection_options = {
  autoIndex: false,
  auto_reconnect:true,
  useNewUrlParser: true,
  connectTimeoutMS: 360000,
  socketTimeoutMS: 900000,
  reconnectInterval: 5000
}

mongoose.connect(config.database_url, mongoose_connection_options);

mongoose.connection.on('connected', function(){
  console.log(`[Mongoose] Connected to ${config.database_url}`);
});

mongoose.connection.on('disconnected', function(){
  console.log(`[Mongoose] Disconnected from ${config.database_url}`);
  mongoose.connect(config.database_url, mongoose_connection_options);
});

mongoose.connection.on('error', function(error){
  console.log('[Mongoose] Erro na conexão: ' + error);
  mongoose.connect(config.database_url, mongoose_connection_options);
});

mongoose.set('debug', true);

//Mosca settings
let mosca_server = new mosca.Server({port:config.mqtt_port});
  
mosca_server.on('ready', function() {
  console.log(`[Mosca Server] Running on port ${config.mqtt_port}`);
});

// TODO: renomear métodos
mosca_server.on('clientConnected', function(client) {
  mosca_routes.registrarEvento(client.id, 'connected');
});

mosca_server.on('clientDisconnected', function(client) {
  mosca_routes.registrarEvento(client.id, 'disconnected');
});

mosca_server.on('published', function(packet, client) {
  if (!packet.topic.startsWith('$')){
    mosca_routes.salvarMensagem(packet);
  }
});

mosca_server.on('subscribed', function(topic, client) {
  console.log('subscribed: ' + client.id);
});

mosca_server.on('unsubscribed', function(topic, client) {
  console.log('unsubscribed: ' + client.id);    
});