var http     = require('http');
var url      = require('url');
var fs       = require('fs');
var io       = require('socket.io');
var fetch    = require('./fetchDB');
var graphics = require('./graphics');
var params   = require('./params');
var funcs    = require('./functions');
var warnService = require('./warnService');
var qs = require('querystring');
var events = require('./eventEmitter');
var localEmitter = events.localEmitter;

var server = http.createServer(function(request, response)
{
   var path = url.parse(request.url).pathname;
   var uri = url.parse(request.url);
   switch(path)
   {
      case '/trigger':
         //funcs.mylog("trigger received");
         response.writeHead(200, {'Content-Type': 'text/plain'});
         response.end();
         setTimeout(function(){fetch.fetchAllTrigger(ios)},5000);
         break;
      case '/vars':
         var varshow = url.parse(request.url).search.substr(1);
         console.log(varshow + ': ');
         console.log(eval(varshow));
         response.writeHead(200, {'Content-Type': 'text/plain'});
         response.end();
         break;
      case '/warncheck':
         funcs.mylog('warncheck startet');
         response.writeHead(200, {'Content-Type': 'text/plain'});
         response.end();
         warnService.checkDewpoint();
         break;
      case '/confirm':
         warnService.confirmRequest(response, qs.parse(uri.query));
         break;
      default:
         response.writeHead(404);
         response.write("opps this doesn't exist - 404");
         break;
   }
});

var ios = io(server);

// handle for the websocket connection from browser
ios.sockets.on('connection', function(socket)
{
   //console.log(socket.handshake.query);
   funcs.logConnectionIP(http,socket.handshake.headers['x-real-ip'],socket.handshake.query);
   if (socket.handshake.query.client && socket.handshake.query.client == 'Widget')
   {
      socket.join('widget');

      socket.on('sendActData',function(data)
      {
         fetch.sendActData(ios);
      });
/*
      socket.on('disconnect',function(data)
      {
         funcs.mylog('disconnected widget');
      });
*/
   }
   else
   {
      socket.join('all');
      fetch.sendOldData(ios);
      graphics.sendAllGraphics(ios);

      socket.on('refresh', function(data)
      {
         funcs.mylog('Refresh requested');
         fetch.sendOldData(ios);
         graphics.sendAllGraphics(ios);
      });

      socket.on('getSpecificData', function(data)
      {
         if (data.type == 'Monats')
         {
           graphics.sendMonatsGraph(socket,data);
         }
         else
         {
           fetch.sendSpecificData(socket,data,false);
         }
      });

      socket.on('requestWarningEntry',function(data)
      {
         warnService.handleRequest(ios,data);
      });
/*
      socket.on('disconnect',function(data)
      {
         funcs.mylog('disconnected');
      });
*/
   }
});

// start listening after all buffers are initialised
// to avoid incomplete data delivering
localEmitter.on('initComplete',function()
{
   server.listen(params.port);
})

funcs.mylog('Server gestartet');

// Read data from DB into buffer
fetch.fetchAllInit(ios,true);



