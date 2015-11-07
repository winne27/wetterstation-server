exports.port = 8027;
exports.minJahr = 2009;
exports.minMonat = 6;
exports.maxLastChangeChecks = 6;

exports.sslcert =
{
   key:    '/etc/ssl/private/bundle/ssl.key',
   cert:   '/etc/ssl/private/bundle/ssl.crt',
   ca:     '/etc/ssl/private/bundle/ca-sha2.pem'
}

exports.types = ['Akt','Tag','Monat','Jahr','Jahre'];
exports.graphicNames = new Array('Sonne','Temperatur','Regen','Luftdruck','Luftfeucht','Windmax','Windrichtung');
exports.graphicNamesReduced = new Array('Sonne','Temperatur','Regen','Luftdruck','Windmax');
exports.graphicMonats = ['rain','sunPower','relPressureMin','relPressureMax','tempOutMin','tempOutAvg','tempOutMax','windSpeedMax'];
exports.graphicTypes = new Array('Tag','Monat','Jahr','Jahre');
exports.graphicsCount = this.graphicNames.length * this.graphicTypes.length;
exports.width = '307px';
exports.height = '142px';

exports.grid =
{
   borderWidth: 1,
   borderColor: '#764c24',
   backgroundColor:
   {
         colors: ["#ffffff",'#FFF4DE']
   },
   hoverable: false,
   margin:
   {
       top: 0,
       left: 0,
       bottom: 3,
       right: 10
   }
};

exports.tickfont =
{
   color: '#764c24'
}

exports.graphicsRel =
{
   rain: 'Regen',
   huminity: 'Luftfeucht',
   relHumOutMin: 'Luftfeucht',
   relHumOutMax: 'Luftfeucht',
   sunpower: 'Sonne',
   sunPower: 'Sonne',
   relPressureMin: 'Luftdruck',
   relPressureMax: 'Luftdruck',
   pressure: 'Luftdruck',
   temperature: 'Temperatur',
   tempOutMin: 'Temperatur',
   tempOutAvg: 'Temperatur',
   tempOutMax: 'Temperatur',
   windspeed: 'Windmax',
   windgust: 'Windmax',
   windSpeedMax: 'Windmax',
   windangle: 'Windrichtung',
   windangle1: 'Windrichtung',
   windangle2: 'Windrichtung',
   windangle3: 'Windrichtung'
}

exports.frostWarning =
[
   {
      dewpoint: -1,
      prob: 100,
      text: 'Es kommt heute Nacht zu Bodenfrost.',
      html: '<span style="font-weight: bold;color:lightblue;font-size:14pt">Es kommt heute Nacht zu Bodenfrost.</span>'
   },
   {
      dewpoint: 0.2,
      prob: 95,
      text: 'Fast sicher kommt es heute Nacht zu Bodenfrost.',
      html: '<span style="font-weight: bold;color:lightblue;font-size:14pt">Fast sicher kommt es heute Nacht zu Bodenfrost.</span>'
   },
   {
      dewpoint: 1,
      prob: 90,
      text: 'Es besteht große Gefahr dass es heute Nacht zu Bodenfrost kommt.',
      html: '<span style="font-weight: bold;color:lightblue;font-size:14pt">Es besteht große Gefahr dass es heute Nacht zu Bodenfrost kommt.</span>'
   },
   {
      dewpoint: 2,
      prob: 50,
      text: 'Es besteht die Gefahr dass es heute Nacht zu Bodenfrost kommt.',
      html: 'Es besteht Gefahr dass es heute Nacht zu Bodenfrost kommt.'
   },
   {
      dewpoint: 3,
      prob: 25,
      text: 'Es besteht nur eine geringe Gefahr dass es heute Nacht zu Bodenfrost kommt. Besser aber mal wachsam sein.',
      html: 'Es besteht nur eine <b>geringe</b> Gefahr dass es heute Nacht zu Bodenfrost kommt. Besser aber mal wachsam sein.'
   },
   {
      dewpoint: 4,
      prob: 10,
      text: 'Es besteht nur eine sehr geringe Gefahr dass es heute Nacht zu Bodenfrost kommt. Besser aber mal wachsam sein.',
      html: 'Es besteht nur eine <b>sehr geringe</b> Gefahr dass es heute Nacht zu Bodenfrost kommt. Besser aber mal wachsam sein.'
   },
   {
      dewpoint: 5,
      prob: 5,
      text: 'Es besteht nur eine sehr geringe Gefahr dass es heute Nacht zu Bodenfrost kommt. Besser aber mal wachsam sein.',
      html: 'Es besteht nur eine <b>sehr geringe</b> Gefahr dass es heute Nacht zu Bodenfrost kommt. Besser aber mal wachsam sein.'
   },
   {
      dewpoint: 99,
      prob: 0,
      text: 'Es besteht keine Gefahr dass es heute Nacht zu Bodenfrost kommt.',
      html: 'Es besteht <b>keine</b> Gefahr dass es heute Nacht zu Bodenfrost kommt.'
   }
];
exports.satUrl ='http://api.wunderground.com/api/0d87505114cceb6c/satellite/image.png?lat=53.15&lon=7.55&radunits=km&radius=280&width=312&height=312&key=sat_vis_bottom&basemap=1&borders=1';
exports.radarUrl = 'http://api.wunderground.com/api/0d87505114cceb6c/radar/image.png?centerlat=53.15&centerlon=7.55&radunits=km&radius=280&width=312&height=312&newmaps=0';
exports.hourlyUrl = 'http://api.wunderground.com/api/0d87505114cceb6c/hourly10day/lang:DL/q/Germany/Ostrhauderfehn.json';
exports.tenDayUrl = 'http://api.wunderground.com/api/0d87505114cceb6c/forecast10day/lang:DL/q/Germany/Ostrhauderfehn.json';

exports.nightImgs = [
"nt_clear",
"nt_mostlycloudy",
"nt_mostlysunny",
"nt_partlycloudy",
"nt_partlysunny",
"nt_sunny"
];