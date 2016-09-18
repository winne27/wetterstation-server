var https = require("https");
var params = require('./params');
var graphics = require('./graphics');
var funcs = require('./functions');

var oldValues = {};
var newValues = {};
var historyValues = {};

for (var i in params.types) {
    historyValues[params.types[i]] = {};
}

var fetchCalls = params.types.length;
var fetchFinished = 0;
var anzJahre;

function fetchAllInit(ios, signalInitComplete) {
    fetchFinished = 0;
    for (var index in params.types) {
        httpsGet(params.types[index], ios, true, signalInitComplete);
    }
    var maxJahr = funcs.getHeute.Jahr();
    anzJahre = maxJahr - params.minJahr + 1;
    for (var jahr = params.minJahr; jahr <= maxJahr; jahr++) {
        var data = {
            dateString: jahr,
            type: 'Jahr'
        }
        sendSpecificData(false, data, true);
    }
}

function fetchAllTrigger(ios) {
    //funcs.mylog('trigger startet');
    for (var index in params.types) {
        httpsGet(params.types[index], ios, false, false);
    }
}

function httpsGet(type, ios, initBuffer, signalInitComplete) {
    var url = 'https://fehngarten.de/weather/wetter' + type + '.php';

    https.get(url, function(res) {
        if (res.statusCode != 200) {
            funcs.mylog(type + "request statusCode: " + res.statusCode);
        } else {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                if (initBuffer) {
                    oldValues[type] = JSON.parse(data);
                    newValues[type] = JSON.parse(data);

                    if (type == 'Akt') {
                        var dewpoint = newValues.Akt.values.Dewpoint.replace(',', '.');
                        for (var i = 0; i < params.frostWarning.length; i++) {
                            if (dewpoint < params.frostWarning[i].dewpoint) {
                                break;
                            }
                        }
                        newValues.Akt.special.soilfrostProb = params.frostWarning[i].prob;
                        oldValues.Akt.special.soilfrostProb = params.frostWarning[i].prob;
                        newValues.Akt.special.soilfrostHtml = params.frostWarning[i].html;
                        oldValues.Akt.special.soilfrostHtml = params.frostWarning[i].html;
                    }

                    if (type == 'Jahr') {
                        var jahr = funcs.getHeute.Jahr();
                        historyValues[type][jahr] = JSON.parse(JSON.stringify(newValues[type]));
                    }
                    fetchFinished++;
                    if (fetchFinished == fetchCalls) {
                        graphics.doPlotAll(ios.sockets.in('all'), newValues, signalInitComplete, historyValues);
                    }
                } else {
                    newValues[type] = JSON.parse(data);

                    if (type == 'Akt') {
                        for (var i = 0; i < params.frostWarning.length; i++) {
                            if (newValues.Akt.values.Dewpoint.replace(',', '.') < params.frostWarning[i].dewpoint) {
                                break;
                            }
                        }
                        newValues.Akt.special.soilfrostProb = params.frostWarning[i].prob;
                        newValues.Akt.special.soilfrostHtml = params.frostWarning[i].html;
                    }

                    sendData(ios, type);
                }
            });
        }
    }).on('error', function(e) {
        funcs.mylog(type + " Got error (/wetter" + type + "): " + e.message);
    });
}

function sendSpecificData(socket, data, doMonats) {
    var type = data.type;

    if (type == 'Jahr' && typeof(historyValues[type][data.dateString]) != 'undefined') {
        var emitdata = {};
        emitdata[type] = {};
        emitdata[type].values = historyValues[type][data.dateString].values;
        emitdata[type].special = historyValues[type][data.dateString].special;
        if (socket) socket.emit('data', emitdata);
        emitdata[type].points = historyValues[type][data.dateString].points;
        for (index in params.graphicNames) {
            graphics.doPlot(socket, emitdata[type], type, params.graphicNames[index], false);
        }
    } else {
        var postData = 'datum=' + data.dateString;
        var options = {
            host: 'fehngarten.de',
            port: 443,
            path: '/weather/wetter' + data.type + '.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length // 157 in web
            }
        };

        var specificRequest = https.request(options, function(res) {
                if (res.statusCode != 200) {
                    //console.log(type + " request statusCode: " + res.statusCode);
                } else {
                    var data = '';

                    res.on('data', function(chunk) {
                        data += chunk;
                    });
                    res.on('end', function() {
                        var response = {};
                        var emitdata = {};
                        emitdata[type] = {};
                        response[type] = JSON.parse(data);
                        emitdata[type].values = response[type].values;
                        emitdata[type].special = response[type].special;
                        if (type == 'Jahr') {
                            historyValues[type][response[type].special.Datum] = JSON.parse(data);
                            if (doMonats) {
                                anzJahre--;
                                if (anzJahre == 0) {
                                    for (var i = 1; i < 13; i++) {
                                        graphics.doPlotMonats(i, historyValues, false);
                                    }
                                }
                            }
                        }
                        if (socket) socket.emit('data', emitdata);
                        for (index in params.graphicNames) {
                            graphics.doPlot(socket, response[type], type, params.graphicNames[index], false);
                        }
                    });
                }
            })
            .on('error', function(e) {
                funcs.mylog("Got error (specific Request): " + e.message);
            });

        specificRequest.write(postData);
        specificRequest.end();
    }
}

function sendData(ios, type) {
    var graphicsChanged = {};
    var valuesChanged = {};
    // Tageswechsel, Monatwechsel, Jahreswechsel
    if (type == 'Tag' && newValues[type]['special']['Datum'] > oldValues[type]['special']['Datum']) {
        funcs.mylog('Datumswechsel ' + type);
        setTimeout(function() { fetchAllInit(ios, false) }, 10000);
    }

    for (var index2 in newValues[type]) {
        for (var index3 in newValues[type][index2]) {
            if (index2 == 'points') {
                for (var index4 in newValues[type][index2][index3]) {
                    if (typeof(oldValues[type][index2][index3][index4]) == 'undefined' || newValues[type][index2][index3][index4][1] != oldValues[type][index2][index3][index4][1]) {
                        graphicsChanged[params.graphicsRel[index3]] = true;
                        if (type == 'Jahr') {
                            var jahr = funcs.getHeute.Jahr();
                            historyValues.Jahr[jahr].points[index3][index4] = newValues.Jahr.points[index3][index4];
                        }
                    }
                }
            } else {
                if (typeof(oldValues[type][index2][index3]) == 'undefined' || newValues[type][index2][index3] != oldValues[type][index2][index3] || index3 == 'Datum') {
                    if (!(index2 in valuesChanged)) valuesChanged[index2] = {};
                    valuesChanged[index2][index3] = newValues[type][index2][index3];

                    if (type == 'Jahr') {
                        var jahr = funcs.getHeute.Jahr();
                        if (!(index2 in historyValues[type][jahr])) historyValues[type][jahr][index2] = {};
                        historyValues[type][jahr][index2][index3] = newValues[type][index2][index3];
                    }
                }
            }
        }
    }
    var newValuesExist = false;
    if (typeof(valuesChanged['values']) != 'undefined') {
        newValuesExist = true;
        var valuesEmit = {};
        valuesEmit[type] = valuesChanged;
    }
    if (type == 'Akt') {
        ios.sockets.in('all').emit('data', valuesEmit);
        ios.sockets.in('widget').emit('data', valuesChanged.values);
    } else if (newValuesExist) {
        ios.sockets.in('all').emit('data', valuesEmit);
    }

    var graphicChanged = false;
    for (name in graphicsChanged) {
        graphics.doPlot(ios.to('all'), newValues[type], type, name, false);
        graphicChanged = true;
    }

    if (graphicChanged && type == 'Jahr') {
        var monat = new Date().getMonth() + 1;
        graphics.doPlotMonats(monat, historyValues, ios.sockets.in('all'));
    }
    oldValues[type] = JSON.parse(JSON.stringify(newValues[type]));
}

function sendOldData(ios) {
    ios.sockets.in('all').emit('data', oldValues);
}

function sendActData(socket) {
    //ios.sockets.in('widget').emit('data',oldValues.Akt.values);
    socket.emit('data', oldValues.Akt.values);
}

var createPlots = function(ios) {
    graphics.doPlotAll(ios.to('all'), newValues, false, historyValues);
}

exports.fetchAllInit = fetchAllInit;
exports.fetchAllTrigger = fetchAllTrigger;
exports.sendOldData = sendOldData;
exports.sendActData = sendActData;
exports.sendSpecificData = sendSpecificData;
//exports.pollNewData = pollNewData;
exports.historyValues = historyValues;
exports.newValues = newValues;