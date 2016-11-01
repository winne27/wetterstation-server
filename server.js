var http     = require('http');
var url      = require('url');
var fs       = require('fs');
var io       = require('socket.io');
var fetch    = require('./fetchDB');
var graphics = require('./graphics');
var params   = require('./params');
var funcs    = require('./functions');
var radar    = require('./radar');
var forecast = require('./forecast');
var warnService = require('./warnService');
var qs = require('querystring');
var events = require('./eventEmitter');
var localEmitter = events.localEmitter;
var initCompleteCount = 0;
//var initCompleteMax = 1;
var initCompleteMax = 4;
var mylog = funcs.mylog;

fs.watchFile('/var/lib/mysql/wetterstation/weather.ibd', (curr, prev) => {
  setTimeout(function(){fetch.fetchAllTrigger(ios)},2000);
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
   //console.log(socket.handshake.query);
   funcs.logConnectionIP(http,socket.handshake.headers['x-real-ip'],socket.handshake.query);
   if (socket.handshake.query.client && socket.handshake.query.client == 'Widget')
   {
      socket.join('widget');

      socket.on('sendActData',function(data)
      {
         mylog('sendActData requested');
         fetch.sendActData(socket);
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

      setTimeout(function()
      {
         graphics.sendAllGraphics(ios);
      },500);

      forecast.sendHourly(ios, true);
      forecast.sendTenDay(ios, true);

      setTimeout(function()
      {
         radar.sendRadar(ios);
      },1000);

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
   initCompleteCount++;
   mylog('part completed');
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
forecast.getTenDay(false);
forecast.getHourly(false);

setInterval(function()
{
   radar.getRadar(true,ios);
},900000);

setInterval(function()
{
   forecast.getTenDay(true,ios);
   forecast.getHourly(true,ios);
},3600000);

