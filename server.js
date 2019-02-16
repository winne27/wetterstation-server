var http     = require('http');
var https    = require('https');
var url      = require('url');
var fs       = require('fs');
var io       = require('socket.io');
var fetch    = require('./fetchDB');
var graphics = require('./graphics');
var globals  = require('./globals');
var params   = require('./params');
var funcs    = require('./functions');
var radar    = require('./radar');
var forecast = require('./forecast');
var warnService = require('./warnService');
var qs = require('querystring');
var events = require('./eventEmitter');
var localEmitter = events.localEmitter;
var initCompleteCount = 0;
var initCompleteMax = 2;
//var initCompleteMax = 4;
var mylog = funcs.mylog;

fs.watchFile('/var/lib/mysql/wetterstation/weather.ibd', (curr, prev) => {
  setTimeout(function(){fetch.fetchAllTrigger(ios)},2000);
});

fs.watchFile('/var/lib/mysql/wetterstation/motd.ibd', (curr, prev) => {
    setTimeout(function(){fetch.fetchMotd(ios)},1000);
});

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
   //mylog(socket.handshake.headers['user-agent']);	
   funcs.logConnectionIP(http,socket.handshake.headers['x-real-ip'], socket.handshake.query, socket.handshake.headers['user-agent']);
   //mylog(socket.handshake.query.client + " is connecting from " + socket.handshake.headers['x-real-ip']);
   if (socket.handshake.query.client && socket.handshake.query.client == 'Widget')
   {
      socket.join('widget');

      socket.on('sendActData',function(data)
      {
         //mylog('sendActData requested');
         fetch.sendActData(socket);
         forecast.sendSomeDays(socket, true);
     });
   }
   else
   {
      socket.join('all');
      var JahreBisHeute = false;
      if (socket.handshake.query.JahreBisHeute && socket.handshake.query.JahreBisHeute == '1')  {
          //mylog('client is in room JahreBisHeute');
          socket.join('JahreBisHeute');
          JahreBisHeute = true;
      }

      fetch.sendOldData(socket);

      setTimeout(function()
      {
         graphics.sendAllGraphics(socket, JahreBisHeute);
      },500);

      forecast.sendHourly(socket, true);
      forecast.sendTenDays(socket, true);

      setTimeout(function()
      {
         radar.sendRadar(socket);
      },1000);

      socket.on('refresh', function(data)
      {
         funcs.mylog('Refresh requested');
         fetch.sendOldData(socket);
         graphics.sendAllGraphics(socket, JahreBisHeute);
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
         warnService.handleRequest(socket,data);
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
localEmitter.on('initComplete',function(tag)
{
   initCompleteCount++;
   mylog(tag + ' completed');
   if (initCompleteCount === initCompleteMax)
   {
      server.listen(params.port);
      mylog('listen startet');
   }
})

funcs.mylog('Server gestartet');

// Read data from DB into buffer
fetch.fetchAllInit(ios,true);

radar.getRadar(false);
forecast.getForecast(false);
fetch.fetchMotd(ios);

setInterval(function()
{
   radar.getRadar(true,ios.sockets.in('all'));
},900000);

setInterval(function()
{
   forecast.getForecast(true,ios.sockets.in('all'), ios.sockets.in('widget'));
},3600000);

