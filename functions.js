// Datumsberechnungen
var getHeute = {
	myHumanReadable : function() {
		var day = new Date();
		return pad((+day.getDate()), 2) + '.' + pad((+day.getMonth() + 1), 2) + '.' + day.getFullYear() + ' '
				+ pad((+day.getHours()), 2) + ':' + pad((+day.getMinutes()), 2) + ':' + pad((+day.getSeconds()), 2) + ' ';
	},

	Tag : function() {
		var trenn = '-';
		var day = new Date();
		return day.getFullYear() + trenn + pad((+day.getMonth() + 1), 2) + trenn + pad((+day.getDate()), 2);
	},

	JahreBisHeute : function() {
		return '0';
	},

	Monat : function() {
		var trenn = '-';
		var monat = new Date();
		return monat.getFullYear() + trenn + pad((+monat.getMonth() + 1), 2);
	},

	Monats : function() {
		var monat = new Date();
		return pad((+monat.getMonth() + 1), 2);
	},

	Jahr : function() {
		var jahr = new Date();
		return jahr.getFullYear();
	},

	Jahre : function() {
		var jahr = new Date();
		return jahr.getFullYear() - 1;
	}
};

var mylog = function(msg) {
	console.log(getHeute.myHumanReadable() + msg);
}

exports.logConnectionIP = function(http, ip, query, agent) {
	try {
		var url = 'http://api.ipstack.com/' + ip + '?access_key=30929e08db7443b0b50c616c481cdea6&hostname=1';
		http.get(
				url,
				function(res) {
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						try {
							var values = JSON.parse(data);
							var hostname = (ip == values.hostname) ? '' : reduceDomain(values.hostname, 2) + ", ";
							if (query.client == 'Browser') {
								mylog(query.client + ", App " + query.appver + ", " + ip + ", " + hostname
										+ values.region_code + "-" + values.zip + "-" + values.city);
							} else {
								mylog(query.client + ", " + query.model + ", " + query.platform + " " + query.version + ", App "
										+ query.appver + ", " + ip + ", " + hostname + values.region_code + "-"
										+ values.zip + "-" + values.city);
							}
						} catch (e) {
							mylog(e.message + ' at ' + ip);
						}
					});
				}).on('error', function(e) {
			mylog("Got error from freegeoip.net: " + e.message);
		});
	
		var url = 'http://localhost:6080/parseAgent.php?agent=' + encodeURI(agent);
		http.get(
				url,
				function(res) {
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						try {
							//mylog(data);
							var values = JSON.parse(data);
							mylog(values.Parent + ' on ' + values.Platform);
						} catch (e) {
							mylog(e.message + ' at ' + agent);
						}
					});
				}).on('error', function(e) {
			mylog("Got error from parse agent: " + e.message);
		});
	} catch(e) {
		// ignore
	}
}

function pad(number, length) {
	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
}

function reduceDomain(domain, count) {
	var parts = domain.split('.');
	for (var i = 0; i < parts.length - count; i++) {
		parts.shift();
	}
	return parts.join('.');
}

function getWindDir(degree) {
	var dir;
	if (degree === '') {
		dir = '';
	} else if (degree < 22.5 || degree > 337.5) {
		dir = 'N';
	} else if (degree > 22.5 && degree < 67.5) {
		dir = 'NO';
	} else if (degree > 67.5 && degree < 112.5) {
		dir = 'O';
	} else if (degree > 112.5 && degree < 157.5) {
		dir = 'SO';
	} else if (degree > 157.5 && degree < 202.5) {
		dir = 'S';
	} else if (degree > 202.5 && degree < 247.5) {
		dir = 'SW';
	} else if (degree > 247.5 && degree < 292.5) {
		dir = 'W';
	} else if (degree > 292.5 && degree < 337.5) {
		dir = 'NW';
	}
	return dir;
}

exports.getHeute = getHeute;
exports.mylog = mylog;
exports.getWindDir = getWindDir;