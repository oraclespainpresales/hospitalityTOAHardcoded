
/**
 * Module dependencies.
 */
var fs = require('fs'),

    path = require('path'),

    http = require('http'),

    https = require('https'),

    express = require('express'),

    config = require(__dirname + '/config');

var socketio = require('socket.io'),

    soap = require('soap'),

    readfile = require('fs').readFileSync,

    inspect = require('util').inspect;


/**
 * Application configuration.
 */
var app = express();

app.configure(function(){
  app.use(express.json());

  app.use(express.logger());

  app.use(express.urlencoded());

  app.set('view engine', 'jade');

  app.set('views', __dirname  + '/views');

  app.engine('html', require('ejs').renderFile);

  app.use(express.cookieParser(config.server.cookieSecret));

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  app.use(express.favicon(config.server.staticUrl + '/favicon.ico'));

  app.use(config.server.staticUrl, express.static(config.server.distFolder + config.server.staticUrl));

  app.use(config.server.staticUrl, function(req, res, next) {res.send(404);});

  app.use(config.server.staticUrl, express.compress());

  app.use(express.methodOverride());

  app.use(express.cookieSession());

  app.use(app.router);

  app.use(express.static(path.join(__dirname, 'public')));

  app.use(require('stylus').middleware(__dirname + '/public'));

  app.set('wsdl', __dirname  + '/wsdl/toa_agent_interface.wsdl');

  app.set('endpoint' , '/toa_agent_interface');
});


/**
 * Module dependencies.
 */
var now = require('./routes/now/services');

var wedo_hospitality = require('./routes/wedo_hospitality/services');

var log = require('./routes/log/services');

/*
 * Application routes.
 */
app.get('/now', now.index);

app.get('/wedo_hospitality', wedo_hospitality.wedo_hospitality);

app.get('/', log.index);

/*
 * Application routes.
 */

app.post('/wedo_hospitality/read', wedo_hospitality.read);

app.post('/wedo_hospitality/create', wedo_hospitality.create);

 app.get('/now/request', now.getDatetime);


/*
 * Http server.
 */
var server = http.createServer(app).listen(config.server.port, config.server.ip, function () {
    console.log("✔ Express server listening at %s:%d ", config.server.ip, config.server.port);
});


/*
 * Https server.
 */
var privateKey  = fs.readFileSync(__dirname + '/key.pem').toString();

var certificate = fs.readFileSync(__dirname + '/cert.pem').toString();

var credentials = {key: privateKey, cert: certificate};

https.createServer(credentials, app).listen(config.server.securePort, config.server.ip, 511, function() {
    console.log("✔ Express server listening at %s:%d ", config.server.ip, config.server.securePort);
});



/*
 * Socket listener
 */
var sio = socketio.listen(server);

var messages = [];

// on connection
sio.sockets.on('connection', function (socket) {
  // on message
  socket.on('message', function (msg) {
    //console.log('Received: ', msg);

    // save message
    messages.push(msg);

    // broadcast message
    socket.broadcast.emit('message', msg);
  });

  // send messages
  messages.forEach(function(msg) {
    socket.send(msg);
  })
});



/*
 * SOAP server.
 */
// wsdl
var wsdl = readfile(path.resolve(app.get('wsdl')), 'utf8');


// replace SOAP_ADDRESS
//if (process.env.SOAP_ADDRESS) {
  //wsdl = wsdl.replace(/<SOAP_ADDRESS>/g, process.env.SOAP_ADDRESS);

//} else {
  //wsdl = wsdl.replace(/<SOAP_ADDRESS>/g, app.get('SOAP_ADDRESS'));
//}


// send message service
var toa_agent_interface = {
    'agent_service': {
        'agent_interface': {
            'send_message': function(args) {

                console.log('Received: ', args);

                message_response = [];

                // send message
                sio.sockets.send(JSON.stringify(args, null, " "));

                // save responses
                args.messages.message.forEach(function(msg) {

                message_response.push({
                    'message_id': parseFloat(msg.message_id),
                    'status': 'sent'
                  });
                });

                // send responses
                sio.sockets.send(JSON.stringify({
                  'message_response': message_response
                }, null, " "));

                // return responses
                return ({
                  'message_response': message_response
                });
            }
        }
    }
}


// soap server
var soap_server = soap.listen(server, app.get('endpoint'), toa_agent_interface, wsdl);


/*
* log start
*/
console.log(config);
