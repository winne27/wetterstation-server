var funcs    = require('./functions');
var mylog = funcs.mylog;
var setGraphicsMonats = function(values, name) {
    var create = [];
    var options;
    var data;

    var xaxis = {
        tickSize: 1,
        tickDecimals: 0,
        min: values.values.Von - 0.5,
        max: values.values.Bis + 0.5
    };

    // --------------------------------------------------
    // Sonnenenergie
    // --------------------------------------------------
    create['Sonne'] = function(values) {
        data = [{
            data: values.points.sunPower,
            color: '#222222'
        }];

        options = {
            series: {
                bars: {
                    show: true
                },
                valueLabels: {
                    show: true,
                    font: "7pt 'Trebuchet MS'"
                }
            },
            bars: {
                align: "center",
                barWidth: 0.7,
                lineWidth: 1,
                fillColor: '#ffff00'
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                max: 1200
            }
        };
    }

    // --------------------------------------------------
    // Temperatur
    // --------------------------------------------------
    create['Temperatur'] = function(values) {
        data = [{
                data: values.points.tempOutMax,
                color: 'red',
                valueLabels: {
                    show: true,
                    yoffset: 1,
                    font: "7pt 'Trebuchet MS'",
                    useDecimalComma: true
                }
            },
            {
                data: values.points.tempOutAvg,
                color: 'green',
                valueLabels: {
                    show: true,
                    yoffset: 2,
                    font: "7pt 'Trebuchet MS'",
                    useDecimalComma: true,
                    decimals: 1
                }
            },
            {
                data: values.points.tempOutMin,
                color: 'blue',
                valueLabels: {
                    show: true,
                    yoffset: 2,
                    font: "7pt 'Trebuchet MS'",
                    useDecimalComma: true
                }
            }
        ];

        var yaxis = {
            tickDecimals: 0,
            tickSize: 10,
            min: Math.round(+values.values.TempMin - 1),
            max: Math.round(+values.values.TempMax + 5)
        };

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 3 }
            },
            xaxis: xaxis,
            yaxis: yaxis
        };
    }

    // --------------------------------------------------
    // Luftdruck
    // --------------------------------------------------
    create['Luftdruck'] = function(values) {
        data = [{
                data: values.points.relPressureMax,
                color: 'red',
                valueLabels: {
                    show: true,
                    valign: "below",
                    font: "7pt 'Trebuchet MS'",
                    decimals: 0
                }
            },
            {
                data: values.points.relPressureMin,
                color: 'blue',
                valueLabels: {
                    show: true,
                    font: "7pt 'Trebuchet MS'",
                    decimals: 0
                }
            }
        ];

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 3 }
            },
            xaxis: xaxis,
            yaxis: {
                tickSize: 20,
                tickDecimals: 0,
                min: 960,
                max: 1045
            }
        };
    }

    // --------------------------------------------------
    // Niederschlag
    // --------------------------------------------------
    create['Regen'] = function(values) {
        data = [{
            data: values.points.rain,
            color: '#0000ff'
        }];

        options = {
            series: {
                bars: {
                    show: true
                },
                valueLabels: {
                    show: true,
                    hideSame: false,
                    align: 'center',
                    font: "7pt 'Trebuchet MS'",
                    decimals: 0
                }
            },
            bars: {
                align: "center",
                barWidth: 0.7
            },
            xaxis: xaxis,
            yaxis: {
                tickDecimals: 0,
                min: 0,
                max: 180
            }
        };
    }

    // --------------------------------------------------
    // Wind
    // --------------------------------------------------
    create['Windmax'] = function(values) {
        data = [{
                data: values.points.windSpeedMax,
                color: 'blue'
            },
            {
                data: values.points.windgust,
                color: 'lightblue',
                label: 'Böen'
            }
        ];

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 3 },
                valueLabels: {
                    show: true,
                    hideSame: false,
                    align: 'center',
                    decimals: 0
                }
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                max: Math.max(50, +values.values.WindMax + 20)
            }
        };
    }

    //mylog("name = " + name);
    create[name](values);
    return { data: data, options: options };
}
exports.set = setGraphicsMonats;