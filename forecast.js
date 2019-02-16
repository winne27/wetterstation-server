var https = require('https');
var params = require('./params');
var funcs = require('./functions');
var events = require('./eventEmitter');

var localEmitter = events.localEmitter;
var mylog = funcs.mylog;

var forcastday_changed;
var forcastday_changed_somedays;
var forcastday_buffer = [];
var forcastday_buffer_somedays = [];
var forcasthourly_changed;
var forcasthourly_buffer = {};
var days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']; 
var icons = params.icons;

for (var i = 0; i < 10; i++) {
	forcastday_buffer[i] = {};
}

for (var i = 0; i < params.someDays; i++) {
	forcastday_buffer_somedays[i] = {};
}

String.prototype.lpad = function(padString, length) {
	var str = this;
	while (str.length < length) {
		str = padString + str;
	}
	return str;
}

function getForecast(doEmit, targetWeb, targetWidget) {
	https.get(params.forecastUrl, function(res) {
		var data1 = '';
		res.on('data', function(chunk) {
			data1 = data1 + chunk;
		});
		res.on('end', function() {
			try {
				var data2 = JSON.parse(data1);
				parseDays(data2.daily.data);
				parseHourly(data2.hourly.data);
				if (doEmit) {
					sendTenDays(targetWeb, false);
					sendSomeDays(targetWidget, false);
					sendHourly(targetWeb, false);
				} else {
					localEmitter.emit('initComplete', 'Forcast');
				}
			} catch (e) {
				mylog(e);
				if (!doEmit) {
					localEmitter.emit('initComplete', 'Forcast with error');
				}
			}
		})
	})	
}

function parseDays(data) {
	var dateInternal;
	var month;
	var day;
	var dateTime;
	dateTime = new Date(data[0].time * 1000);
	var dayNum = dateTime.getDay();
	var weekday_short = days[dayNum];
	var datestring = weekday_short + '.' + dateTime.getDate();
	var summary;

	if (!forcastday_buffer[0].datestring || forcastday_buffer[0].datestring != datestring) {
		for (var i = 0; i < 10; i++) {
			forcastday_buffer[i] = {};
		}
		for (var i = 0; i < params.someDays; i++) {
			forcastday_buffer_somedays[i] = {};
		}
	}

	forcastday_changed = [];
	forcastday_changed_somedays = [];
	// console.log(data.forecast.simpleforecast.forecastday[0]);
	for (var i = 0; i < 8; i++) {
		forcastday_changed[i] = {};
		if (i < params.someDays) {
			forcastday_changed_somedays[i] = {};
		}

		dateTime = new Date((data[i].time + 10000) * 1000);
		dayNum = dateTime.getDay();
		var weekday_short = days[dayNum];
		datestring = weekday_short + ' ' + dateTime.getDate() + '.';
		month = (dateTime.getMonth() + 1) + '';
		day = dateTime.getDate() + '';
		dateInternal = dateTime.getFullYear() + '-' + month.lpad('0', 2) + '-' + day.lpad('0', 2);

		if (typeof data.WindBearing == undefined) {
			data.WindBearing = '';
		}

		checkNewValueTenDay(dateInternal, 'ForecastDateInternal', i);
		checkNewValueTenDay(datestring, 'ForecastDatestring', i);
		// checkNewValueTenDay(day.avehumidity + "%",'ForecastHumidity',i);
		checkNewValueTenDay(funcs.getWindDir(data[i].windBearing), 'ForecastWindDir', i);
		checkNewValueTenDay(Math.round(data[i].windSpeed), 'ForecastWindSpeed', i);
		checkNewValueTenDay(Math.round(data[i].windGust), 'ForecastWindGust', i);
		checkNewValueTenDay(Math.round(data[i].temperatureHigh), 'ForecastTempMax', i);
		checkNewValueTenDay(Math.round(data[i].temperatureLow), 'ForecastTempMin', i);
		summary = data[i].summary;
		//summary = ucFirst(data[i].summary.replace('Den ganzen Tag lang ', ''));
		summary = summary.replace('.', '');
		//summary = summary.replace(' bis abends', '');
		checkNewValueTenDay(summary, 'ForecastConditions', i);
		checkNewValueTenDay(icons[data[i].icon].replace('nt_', ''), 'ForecastIcon', i);
		
		var precip;
		if (typeof data[i].precipType == 'undefined') {
			precip = 'trocken';
		} else {
			precip = '<b>' + params.precipType[data[i].precipType] + '</b><br>wahrscheinlich zu ' + Math.round(data[i].precipProbability * 100) + '%';
			if (typeof data[i].precipIntensity != 'undefined') {
				precip += '<br>mit maximal ' + Math.round(data[i].precipIntensity * 25.4) + ' mm/h<br> gegen ';
			} else if (typeof entry.precipAccumulation != 'undefined') {
				precip += '<br>mit maximal ' + Math.round(data[i].precipAccumulation * 254) + ' cm/h<br> gegen ';
			}
			dateTime = new Date(data[i].precipIntensityMaxTime * 1000);
			precip += dateTime.getHours() + ' Uhr';
		}
		
		checkNewValueTenDay(precip, 'ForecastPop', i);
		//checkNewValueTenDay(day.qpf_allday.mm + "mm", 'ForecastQpf', i);
	}
}

function ucFirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkNewValueTenDay(value, name, i) {
	if (forcastday_buffer[i][name] !== value && value !== '') {
		forcastday_buffer[i][name] = value;
		forcastday_changed[i][name] = value;
		//mylog(name + ' - ' + i);
		if (params.reducedEntities.indexOf(name) > -1 && i < params.someDays) {
			//mylog('is in reduced');
			forcastday_buffer_somedays[i][name] = value;
			forcastday_changed_somedays[i][name] = value;
		}
	}
}

function parseHourly(data) {

	// delete old values
	var heute = funcs.getHeute.Tag();
	
	var dateInternal;
	var year;
	var month;
	var day;
	var dateTime;
	
	for (day in forcasthourly_buffer) {
		if (day < heute) {
			delete forcasthourly_buffer[day];
		}
	}
	
	
	// parse new data
	forcasthourly_changed = {};
	for ( var i in data) {
		var entry = data[i];
		
		dateTime = new Date(entry.time * 1000);
		month = (dateTime.getMonth() + 1) + '';
		dayMonth = dateTime.getDate() + '';
		day = dateTime.getFullYear() + '-' + month.lpad('0', 2) + '-' + dayMonth.lpad('0', 2);
		
		if (!forcasthourly_buffer[day]) {
			forcasthourly_buffer[day] = [];
		}
		var hour = dateTime.getHours();

		if (!forcasthourly_buffer[day][hour]) {
			forcasthourly_buffer[day][hour] = {};
		}
		checkNewValueHourly(entry.summary, 'HourlyCondition', day, hour);

		checkNewValueHourly(icons[entry.icon], 'HourlyIcon', day, hour);
		
		var precip;
		if (typeof entry.precipType == 'undefined') {
			precip = 'trocken';
		} else {
			precip = params.precipType[entry.precipType] + ' ' + Math.round(entry.precipProbability * 100) + '%';
			/*
			if (typeof entry.precipIntensity != 'undefined') {
				precip += '<br>Menge ' + Math.round(entry.precipIntensity * 25.4) + ' mm';
			} else if (typeof entry.precipAccumulation != 'undefined') {
				precip += '<br>Höhe ' + Math.round(entry.precipAccumulation * 25.4) + ' mm';
			}
			*/
		}
		
		checkNewValueHourly(precip, 'HourlyPop', day, hour);
		//checkNewValueHourly(entry.qpf.metric, 'HourlyQpf', day, hour);
		checkNewValueHourly(Math.round(entry.temperature), 'HourlyTemp', day, hour);
		checkNewValueHourly(Math.round(entry.pressure), 'HP', day, hour);
		checkNewValueHourly(Math.round(entry.cloudCover * 100), 'HCC', day, hour);

		checkNewValueHourly(funcs.getWindDir(entry.windBearing), 'HourlyWindDir', day, hour);
		checkNewValueHourly(Math.round(entry.windGust), 'HourlyWindSpeed', day, hour);
	}
}

function checkNewValueHourly(value, name, day, hour) {
	if (!name in forcasthourly_buffer[day][hour]) {
		forcasthourly_buffer[day][hour][name] = null;
	}

	if (forcasthourly_buffer[day][hour][name] !== value) {
		forcasthourly_buffer[day][hour][name] = value;
		if (!forcasthourly_changed[day]) {
			forcasthourly_changed[day] = [];
		}
		if (!forcasthourly_changed[day][hour]) {
			forcasthourly_changed[day][hour] = {};
		}
		forcasthourly_changed[day][hour][name] = value;
	}
}

function sendTenDays(target, sendAll) {
	if (sendAll) {
		target.emit('forecastTenDay', forcastday_buffer);
	} else {
		target.emit('forecastTenDay', forcastday_changed);
	}
}

function sendSomeDays(target, sendAll) {
	//mylog("send some days");
	if (sendAll) {
		target.emit('forecastSomeDays', forcastday_buffer_somedays);
	} else {
		target.emit('forecastSomeDays', forcastday_changed_somedays);
	}
}

function sendHourly(target, sendAll) {
	if (sendAll) {
		target.emit('forecastHourly', forcasthourly_buffer);
	} else {
		target.emit('forecastHourly', forcasthourly_changed);
	}
}

exports.getForecast = getForecast; 
exports.sendHourly = sendHourly;
exports.sendTenDays = sendTenDays;
exports.sendSomeDays = sendSomeDays;
