var funcs    = require('./functions');
var mylog = funcs.mylog;
var setGraphicsJahreBisHeute = function(values, name) {
    var create = [];
    var options;
    var data;

    var xaxis = {
        tickSize: 1,
        tickDecimals: 0,
        min: +values.values.Von - 0.5,
        max: +values.values.Bis + 0.5
    };

    // --------------------------------------------------
    // Sonnenenergie bis heute
    // --------------------------------------------------
    create['Sonne'] = function(values) {
        data = [{
            data: values.points.sunPowerUntilToday,
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
                max: 7800
            }
        };
    }

    // --------------------------------------------------
    // Niederschlag bis heute
    // --------------------------------------------------
    create['Regen'] = function(values) {
        data = [{
            data: values.points.rainUntilToday,
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
                min: 0
            }
        };
    }
    //mylog("name = " + name);
    create[name](values);
    //console.log(JSON.stringify(options));
    return { data: data, options: options };
}
exports.set = setGraphicsJahreBisHeute;
