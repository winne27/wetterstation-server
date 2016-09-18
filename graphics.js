var params = require('./params');
var jsdom = require('jsdom');
var funcs = require('./functions');
var events = require('./eventEmitter');
var localEmitter = events.localEmitter;
window = jsdom.jsdom().defaultView;
document = window.document;
jQuery = require('jquery');
$ = jQuery;

var graphicsBuffer = {};
var setGraphics = {};
var subfunc = {};
var graphicsBuild = 0;
var flot = require('flot');
require('flot/jquery.flot.valuelabels.js');
var placeholder = window.document.createElement('div');

for (i in params.graphicTypes) {
    subfunc[params.graphicTypes[i]] = require('./graphics' + params.graphicTypes[i]);
}
subfunc['Monats'] = require('./graphicsMonats');

function doPlot(emitMethod, values, type, name, signalInitComplete) {
    //console.log(type + ' - ' + name);
    if (!document.getElementById('grafik' + type + name)) {
        placeholder.id = 'grafik' + type + name;
        placeholder.style.width = params.width;
        placeholder.style.height = params.height;
        document.body.appendChild(placeholder);
    }

    var datum = values.special.Datum;
    if (emitMethod !== false && datum < funcs.getHeute[type]() && typeof(graphicsBuffer[type][name][datum]) != 'undefined') {
        emitMethod.emit('graphic', graphicsBuffer[type][name][datum]);
    } else {
        doPlotReal(type, name, values, datum);
        if (signalInitComplete) {
            graphicsBuild++;
            if (graphicsBuild == params.graphicsCount) {
                localEmitter.emit('initComplete');
            }
        } else {
            if (emitMethod !== false) {
                emitMethod.emit('graphic', graphicsBuffer[type][name][datum]);
            }
        }
    }
}

function doPlotReal(type, name, values, datum) {
    var plotdata = subfunc[type].set(values, name);
    var data = plotdata.data;
    var options = plotdata.options;
    plotdata.options.grid = params.grid;
    plotdata.options.xaxis.font = params.tickfont;
    plotdata.options.yaxis.font = params.tickfont;

    //jQuery('#grafik' + type + name),
    var flotplot = $.plot(
        jQuery(placeholder),
        data,
        options
    );
    var nodeCanvas = flotplot.getCanvas();

    var stream = nodeCanvas.toDataURL();
    //console.log(stream);
    if (typeof(graphicsBuffer[type]) == 'undefined') graphicsBuffer[type] = {};
    if (typeof(graphicsBuffer[type][name]) == 'undefined') graphicsBuffer[type][name] = {};

    graphicsBuffer[type][name][datum] = {
        stream: stream,
        Datum: datum,
        id: 'grafik' + type + name,
        type: type
    };
}

function doPlotAll(emitMethod, values, signalInitComplete, historyValues) {
    for (var i in params.graphicTypes) {
        var type = params.graphicTypes[i];
        graphicsBuffer[type] = {};
        var heute = funcs.getHeute[type]();
        for (var j in params.graphicNames) {
            var name = params.graphicNames[j];
            doPlot(emitMethod, values[type], type, name, signalInitComplete);
        }
    }
}

function sendAllGraphics(ios) {
    for (var type in graphicsBuffer) {
        if (type == 'Monats') continue;
        for (var name in graphicsBuffer[type]) {
            ios.sockets.emit('graphic', graphicsBuffer[type][name][funcs.getHeute[type]()]);
        }
    }
}

function sendMonatsGraph(socket, data) {
    //console.log(data);
    for (i in params.graphicNamesReduced) {
        var name = params.graphicNamesReduced[i];
        socket.emit('graphic', graphicsBuffer['Monats'][name][data.dateString]);
    }
}

function doPlotMonats(monat, historyValues, emitMethod) {
    monatExt = (monat < 10) ? '0' + monat : monat;
    var values = {};
    values.points = {};
    values.special = {};
    values.values = {};
    values.special.Datum = monatExt;
    values.values.WindMax = 0;
    values.values.TempMin = 99;
    values.values.TempMax = 0;
    values.values.Von = (monat < params.minMonat) ? +params.minJahr + 1 : params.minJahr;
    values.values.Bis = (monatExt <= funcs.getHeute.Monats()) ? funcs.getHeute.Jahr() : +funcs.getHeute.Jahr() - 1;

    for (var i in params.graphicMonats) {
        var name = params.graphicMonats[i];
        values.points[name] = [];
        for (var jahr = values.values.Von; jahr <= values.values.Bis; jahr++) {
            //console.log(jahr + ' ' + monatExt + ' ' + name);
            for (var i in historyValues.Jahr[jahr].points[name]) {
                if (historyValues.Jahr[jahr].points[name][i][0] == monat) {
                    var value = historyValues.Jahr[jahr].points[name][i][1];
                    if (name == 'windSpeedMax') {
                        values.values.WindMax = Math.max(values.values.WindMax, value)
                    }
                    if (name == 'tempOutMin') {
                        values.values.TempMin = Math.min(values.values.TempMin, value)
                    }
                    if (name == 'tempOutMax') {
                        values.values.TempMax = Math.max(values.values.TempMax, value)
                    }
                    break;
                }
            }
            values.points[name].push([jahr, value]);
        }
    }

    for (var i in params.graphicNamesReduced) {
        var name = params.graphicNamesReduced[i];
        doPlot(emitMethod, values, 'Monats', name, false);
    }
    //console.log(graphicsBuffer.Monats);
}
exports.sendAllGraphics = sendAllGraphics;
exports.doPlotAll = doPlotAll;
exports.doPlot = doPlot;
exports.sendMonatsGraph = sendMonatsGraph;
exports.doPlotMonats = doPlotMonats;
exports.graphicsBuffer = graphicsBuffer;