var http     = require('http');
var params   = require('./params');
var funcs    = require('./functions');
var events   = require('./eventEmitter');

var localEmitter = events.localEmitter;
var mylog = funcs.mylog;

var forcastday_changed;
var forcastday_buffer = [];
var forcasthourly_changed;
var forcasthourly_buffer = {};

for (var i = 0; i < 10; i++)
{
   forcastday_buffer[i] = {};
}

String.prototype.lpad = function(padString, length)
{
   var str = this;
   while (str.length < length)
   {
      str = padString + str;
   }
   return str;
}

function getTenDay(doEmit,ios)
{
   mylog('getTenDay started');
   http.get(params.tenDayUrl,function(res)
   {
      var data1 = '';
      res.on('data', function(chunk)
      {
        data1 = data1 + chunk;
      });
      res.on('end', function()
      {
         parseTenDay(JSON.parse(data1));
         if (doEmit)
         {
            sendTenDay(ios,false);
         }
         else
         {
            localEmitter.emit('initComplete');
         }
      })
   })
}

function parseTenDay(data)
{
   var day = data.forecast.simpleforecast.forecastday[0];
   var datestring = day.date.weekday_short + '.' +  day.date.day;

   if (!forcastday_buffer[0].datestring || forcastday_buffer[0].datestring != datestring)
   {
      for (var i = 0; i < 10; i++)
      {
         forcastday_buffer[i] = {};
      }
   }

   forcastday_changed = {};
   //console.log(data.forecast.simpleforecast.forecastday[0]);
   for (var i = 0; i < 10; i++)
   {
      forcastday_changed[i] = {};
      var day = data.forecast.simpleforecast.forecastday[i];
      var dateInternal = day.date.year + '-' + day.date.month.toString().lpad('0',2) + '-' + day.date.day.toString().lpad('0',2);
      var datestring = day.date.weekday_short + '.' +  day.date.day;
      day.avewind.dir = day.avewind.dir.replace('Südwest','SW');

      checkNewValueTenDay(dateInternal,'ForecastDateInternal',i);
      checkNewValueTenDay(datestring,'ForecastDatestring',i);
      //checkNewValueTenDay(day.avehumidity + "%",'ForecastHumidity',i);
      day.avewind.dir = day.avewind.dir.replace('Südwest','SW');
      day.avewind.dir = day.avewind.dir.replace('Ost-Südost','OSO');
      checkNewValueTenDay(day.avewind.dir,'ForecastWindDir',i);
      checkNewValueTenDay(day.avewind.kph,'ForecastWindSpeed',i);
      checkNewValueTenDay(day.maxwind.kph,'ForecastWindGust',i);
      checkNewValueTenDay(day.high.celsius,'ForecastTempMax',i);
      checkNewValueTenDay(day.low.celsius,'ForecastTempMin',i);
      checkNewValueTenDay(day.pop + "%",'ForecastPop',i);
      checkNewValueTenDay(day.conditions,'ForecastConditions',i);
      checkNewValueTenDay(day.icon,'ForecastIcon',i);
      checkNewValueTenDay(day.qpf_allday.mm + "mm",'ForecastQpf',i);

   }
}

function checkNewValueTenDay(value,name,i)
{
   if (!name in forcastday_buffer[i])
   {
      forcastday_buffer[i][name] = null;
   }

   if (forcastday_buffer[i][name] !== value)
   {
      forcastday_buffer[i][name] = value;
      forcastday_changed[i][name] = value;
   }
}

function getHourly(doEmit,ios)
{
   mylog('getHourly started');
   http.get(params.hourlyUrl,function(res)
   {
      var data = '';
      res.on('data', function(chunk)
      {
        data = data + chunk;
      });
      res.on('end', function()
      {
         parseHourly(JSON.parse(data));
         if (doEmit)
         {
            sendHourly(ios,false);
         }
         else
         {
            localEmitter.emit('initComplete');
         }
      })
   })
}

function parseHourly(data)
{
   // delete old values
   var heute = funcs.getHeute.Tag();
   for (var day in forcasthourly_buffer)
   {
      if (day < heute)
      {
         delete forcasthourly_buffer[day];
      }
   }
   // parse new data
   forcasthourly_changed = {};
   var warr = data.hourly_forecast;
   for (var i in warr)
   {
      var entry = warr[i];
      var day = entry.FCTTIME.year + '-' + entry.FCTTIME.mon_padded + '-' + entry.FCTTIME.mday_padded;
      if (!forcasthourly_buffer[day])
      {
         forcasthourly_buffer[day] = [];
      }
      var hour = entry.FCTTIME.hour;

      if (!forcasthourly_buffer[day][hour])
      {
         forcasthourly_buffer[day][hour] = {};
      }
      checkNewValueHourly(entry.condition,'HourlyCondition',day,hour);
      var icon = entry.icon_url.split('/').pop().split('.')[0];

      if (icon.substr(0,3) === 'nt_')
      {
         var imgExists = false;
         for (var i in params.nightImgs)
         {
            if (params.nightImgs[i] === icon)
            {
               imgExists = true;
               break;
            }
         }
         if (!imgExists)
         {
            icon = icon.substr(3);
         }
      }

      checkNewValueHourly(icon,'HourlyIcon',day,hour);
      checkNewValueHourly(entry.pop,'HourlyPop',day,hour);
      checkNewValueHourly(entry.qpf.metric,'HourlyQpf',day,hour);
      checkNewValueHourly(entry.temp.metric,'HourlyTemp',day,hour);

      entry.wdir.dir = entry.wdir.dir.replace('Südwest','SW');
      entry.wdir.dir = entry.wdir.dir.replace('Ost-Südost','OSO');

      checkNewValueHourly(entry.wdir.dir,'HourlyWindDir',day,hour);
      checkNewValueHourly(entry.wspd.metric,'HourlyWindSpeed',day,hour);
   }
}

function checkNewValueHourly(value,name,day,hour)
{
   if (!name in forcasthourly_buffer[day][hour])
   {
      forcasthourly_buffer[day][hour][name] = null;
   }

   if (forcasthourly_buffer[day][hour][name] !== value)
   {
      forcasthourly_buffer[day][hour][name] = value;
      if (!forcasthourly_changed[day])
      {
         forcasthourly_changed[day] = [];
      }
      if (!forcasthourly_changed[day][hour])
      {
         forcasthourly_changed[day][hour] = {};
      }
      forcasthourly_changed[day][hour][name] = value;
   }
}

function sendTenDay(ios,sendAll)
{
   if (sendAll)
   {
      ios.sockets.in('all').emit('forecastTenDay',forcastday_buffer);
   }
   else
   {
      ios.sockets.in('all').emit('forecastTenDay',forcastday_changed);
   }
}

function sendHourly(ios,sendAll)
{
   if (sendAll)
   {
      ios.sockets.in('all').emit('forecastHourly',forcasthourly_buffer);
   }
   else
   {
      ios.sockets.in('all').emit('forecastHourly',forcasthourly_changed);
   }
}

exports.getHourly = getHourly;
exports.getTenDay = getTenDay;
exports.sendHourly = sendHourly;
exports.sendTenDay = sendTenDay;
