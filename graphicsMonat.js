var setGraphicsMonat = function(values, name) {
    var create = [];
    var options;
    var data;

    var xaxis = {
        min: 0.5,
        max: +values.special.anzTage + 0.5,
        tickSize: 2,
        tickDecimals: 0
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
                max: 50
            }
        };
    };

    // --------------------------------------------------
    // Temperatur
    // --------------------------------------------------
    create['Temperatur'] = function(values) {
        data = [{
                data: values.points.tempOutMax,
                color: 'red',
                valueLabels: {
                    show: true,
                    showMaxValue: true,
                    font: "7pt san-serif",
                    useDecimalComma: true
                }
            },
            {
                data: values.points.tempOutAvg,
                color: 'green'
            },
            {
                data: values.points.tempOutMin,
                color: 'blue',
                valueLabels: {
                    show: true,
                    showMinValue: true,
                    font: "7pt san-serif",
                    useDecimalComma: true
                }
            }
        ];

        var yaxis = {
            tickDecimals: 0,
            tickSize: 5,
            min: Math.round(values.values.TempMin.replace(',', '.')) - 3,
            max: Math.round(values.values.TempMax.replace(',', '.')) + 3
        };

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 1 }
            },
            xaxis: xaxis,
            yaxis: yaxis
        };
    };

    // --------------------------------------------------
    // Luftdruck
    // --------------------------------------------------
    create['Luftdruck'] = function(values) {
        data = [{
                data: values.points.relPressureMax,
                color: 'red',
                valueLabels: {
                    show: true,
                    showMaxValue: true,
                    font: "7pt san-serif"
                }
            },
            {
                data: values.points.relPressureMin,
                color: 'blue',
                valueLabels: {
                    show: true,
                    showMinValue: true,
                    font: "7pt san-serif"
                }
            }
        ];

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 1 }
            },
            xaxis: xaxis,
            yaxis: {
                tickSize: 10,
                tickDecimals: 0,
                min: Math.floor((+values.values.PressMin) / 5) * 5,
                max: Math.ceil((+values.values.PressMax) / 5) * 5
            }
        };
    };

    // --------------------------------------------------
    // Luftfeuchtigkeit
    // --------------------------------------------------
    create['Luftfeucht'] = function(values) {
        data = [{
                data: values.points.relHumOutMax,
                color: 'red'
            },
            {
                data: values.points.relHumOutMin,
                color: 'blue',
                valueLabels: {
                    show: true,
                    showMinValue: true,
                    font: "7pt san-serif"
                }
            }
        ];

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 1 }
            },
            xaxis: xaxis,
            yaxis: {
                tickSize: 20,
                tickDecimals: 0,
                max: 100,
                min: 0
            }
        };
    };

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
                }
            },
            bars: {
                align: "center",
                barWidth: 0.8
            },
            xaxis: xaxis,
            yaxis: {
                tickDecimals: 0,
                min: 0,
                max: Math.max(30, Math.floor(+values.values.RainMax / 10) * 10)
            }
        };
    };
    // --------------------------------------------------
    // Wind
    // --------------------------------------------------
    create['Windmax'] = function(values) {
        data = [{
            data: values.points.windSpeedMax,
            color: 'blue',
            valueLabels: {
                show: true,
                showMaxValue: true,
                font: "7pt san-serif",
                decimals: 0
            }
        }];
        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                },
                points: { show: true, fill: false, radius: 1 }
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                max: Math.max(50, +values.values.WindMax + 10)
            }
        };
    }

    // --------------------------------------------------
    // Windrichtung
    // --------------------------------------------------
    create['Windrichtung'] = function(values) {

        data = [{
                data: values.points.windangle1,
                color: 'black'
            },
            {
                data: values.points.windangle2,
                color: 'blue'
            },
            {
                data: values.points.windangle3,
                color: 'lightblue'
            }
        ];

        options = {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true,
                    fill: true,
                    radius: 2
                }
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                max: 360,
                tickSize: 45,
                ticks: [
                    [0, 'N'],
                    [45, 'NO'],
                    [90, 'O'],
                    [135, 'SO'],
                    [180, 'S'],
                    [225, 'SW'],
                    [270, 'W'],
                    [315, 'NW'],
                    [360, 'N']
                ]
            }
        };
    }
 
    // --------------------------------------------------
    // Feinstaub
    // --------------------------------------------------
    create['Feinstaub'] = function(values) {
        data = [{
                data: values.points.Feinstaub.pm10_max,
                color: 'blue'
            },{
		    	data: values.points.Feinstaub.pm25_max,
		    	color: 'red'
			}];

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                }
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                tickDecimals: 0
            }
        };
    };
    
    if (typeof create[name] === 'undefined') {
    	return false;
    } else {
	    create[name](values);
	    return { data: data, options: options };
    }
}
exports.set = setGraphicsMonat;