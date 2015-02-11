// Datumsberechnungen
var getHeute =
{
   myHumanReadable: function()
   {
      var day = new Date();
      return pad((+day.getDate()),2) + '.' + pad((+day.getMonth() + 1),2) + '.' + day.getFullYear() + ' ' +  pad((+day.getHours()),2) + ':' +  pad((+day.getMinutes()),2) + ':' +  pad((+day.getSeconds()),2) + ' ';
   },

   Tag: function()
   {
      var trenn = '-';
      var day = new Date();
      return day.getFullYear() + trenn + pad((+day.getMonth() + 1),2) + trenn + pad((+day.getDate()),2);
   },

   Monat: function()
   {
      var trenn = '-';
      var monat = new Date();
      return monat.getFullYear() + trenn + pad((+monat.getMonth() + 1),2);
   },

   Monats: function()
   {
      var monat = new Date();
      return pad((+monat.getMonth() + 1),2);
   },

   Jahr: function()
   {
      var jahr = new Date();
      return jahr.getFullYear();
   },

   Jahre: function()
   {
      var jahr = new Date();
      return jahr.getFullYear() - 1;
   }
};

var mylog = function(msg)
{
   console.log(getHeute.myHumanReadable() + msg);
}
 
exports.logConnectionIP = function(http,ip,query)
{
   //var url = 'http://freegeoip.net/json/' + ip;
   var url = 'http://www.telize.com/geoip/' + ip;
   http.get(url, function(res)
   {
      var data = '';
      res.on('data', function(chunk)
      {
         data += chunk;
      });
      res.on('end', function()
      {
         try
         {
            var values = JSON.parse(data);
            if (query.client == 'Browser')
            {
               mylog(query.client + " connected from " + ip + " " + values.country + " - " + values.region + " - " + values.city + " - " + values.isp);
            }
            else
            {
               mylog(query.client + " on " + query.model + " with " + query.platform + " " + query.version + " connected from " + ip + " " + values.country + " - " + values.region + " - " + values.city + " - " + values.isp);
            }
         }
         catch(e)
         {
            mylog("Error by IP location call - " + ip);
         }

      });
   })
   .on('error', function(e)
   {
      mylog("Got error from freegeoip.net: " + e.message);
   });
}

function pad(number, length)
{
    var str = '' + number;
    while (str.length < length)
    {
        str = '0' + str;
    }
    return str;
}

exports.getHeute = getHeute;
exports.mylog = mylog;
