var http     = require('http');
var async    = require('async');
var params   = require('./params');
var funcs    = require('./functions');
var events   = require('./eventEmitter');
var localEmitter = events.localEmitter;
var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(312,312)
  , ctx = canvas.getContext('2d');

var mylog = funcs.mylog;
var streamPNG;

function sendRadar(ios)
{
   ios.sockets.in('all').emit('radar',streamPNG);
}

function getRadar(doEmit,ios)
{
   async.series(
   {
      radar: function(callback)
      {
         http.get(params.radarUrl,function(res)
         {
            var data = new Buffer(parseInt(res.headers['content-length'],10));
            var pos = 0;
            res.on('data', function(chunk)
            {
              chunk.copy(data, pos);
              pos += chunk.length;
            });
            res.on('end', function()
            {
               callback(null, data);
            })
         })
      },
      sat: function(callback)
      {
         http.get(params.satUrl,function(res)
         {
            var data = new Buffer(parseInt(res.headers['content-length'],10));
            var pos = 0;
            res.on('data', function(chunk)
            {
              chunk.copy(data, pos);
              pos += chunk.length;
            });
            res.on('end', function()
            {
               callback(null, data);
            })
         })
      }
   },
   function(err, ergebnis)
   {
      var radarImg = new Image();
      var satImg = new Image();
      radarImg.src = ergebnis.radar;
      satImg.src = ergebnis.sat;

      ctx.drawImage(satImg,0,0,312,312);
      ctx.drawImage(radarImg,0,0,312,312);
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 12px Verdana';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      // Rhauderfehn
      ctx.beginPath();
      ctx.arc(156, 156, 4, 0, 2*Math.PI);
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.fillText('Rhauderfehn',156,148);
      // Amsterdam
      ctx.beginPath();
      ctx.arc(60, 208, 4, 0, 2*Math.PI);
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.fillText('Amsterdam',60,200);
      // Hannover
      ctx.beginPath();
      ctx.arc(242, 208, 4, 0, 2*Math.PI);
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.fillText('Hannover',242,200);
      // Oberhausen
      ctx.beginPath();
      ctx.arc(140, 298, 4, 0, 2*Math.PI);
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.fillText('Köln',140,290);

      streamPNG = canvas.toDataURL();
      if (doEmit)
      {
         sendRadar(ios);
      }
      else
      {
         localEmitter.emit('initComplete');
      }
   });
}

exports.getRadar = getRadar;
exports.sendRadar = sendRadar;
