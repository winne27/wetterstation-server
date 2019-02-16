var setGraphicsTag = function(values, name) {

    var create = {};
    var xaxis = {
        min: 0,
        max: 24,
        ticks: 12
    };
    var options;
    var data;
    // --------------------------------------------------
    // Sonnenenergie
    // --------------------------------------------------
    create['Sonne'] = function(values) {
        data = [{
            data: values.points.sunpower,
            color: '#222222'
        }];

        options = {
            series: {
                lines: {
                    fill: true,
                    lineWidth: 1,
                    fillColor: '#ffff00'
                }
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                max: 100
            }
        };
    }

    // --------------------------------------------------
    // Temperatur
    // --------------------------------------------------
    create['Temperatur'] = function(values) {
        data = [{
            data: values.points.temperature,
            color: '#0000ff',
            valueLabels: {
                show: true,
                showMinValue: true,
                showMaxValue: true,
                font: "7pt san-serif",
                useDecimalComma: true
            }
        }];

        if (values.values.TempMax < 0) {
            var yaxis = {
                tickSize: 2,
                tickDecimals: 0,
                max: 0,
                min: Math.round(values.values.TempMin.replace(',', '.')) - 2
            };
        } else {
            var yaxis = {
                tickDecimals: 0,
                tickSize: 2,
                min: Math.round(values.values.TempMin.replace(',', '.')) - 2,
                max: Math.round(values.values.TempMax.replace(',', '.')) + 2
            };
        }

        options = {
            series: {
                lines: {
                    lineWidth: 1,
                    show: true
                }
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
            data: values.points.pressure,
            color: '#0000ff',
            valueLabels: {
                show: true,
                showMinValue: true,
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
                }
            },
            xaxis: xaxis,
            yaxis: {
                tickSize: 5,
                tickDecimals: 0,
                min: Math.floor((+values.values.PressMin - 5) / 10) * 10,
                max: Math.ceil((+values.values.PressMax + 5) / 10) * 10
            }
        };
    }

    // --------------------------------------------------
    // Luftfeuchtigkeit
    // --------------------------------------------------
    create['Luftfeucht'] = function(values) {
            data = [{
                data: values.points.huminity,
                color: '#0000ff'
            }];

            options = {
                series: {
                    lines: {
                        fill: true,
                        lineWidth: 1,
                        fillColor: {
                            colors: ['#CC9C33', '#7F96CC', "#221C82"]
                        },
                    }
                },
                xaxis: xaxis,
                yaxis: {
                    tickSize: 20,
                    tickDecimals: 0,
                    max: 100,
                    min: 0
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
                    hoverable: true
                },
                bars: {
                    align: "left",
                    barWidth: 1
                },
                xaxis: xaxis,
                yaxis: {
                    tickDecimals: 0,
                    min: 0
                }
            };
        }
        // --------------------------------------------------
        // Wind
        // --------------------------------------------------
    create['Windmax'] = function(values) {
        data = [{
                data: values.points.windspeed,
                color: 'blue'
            },
            {
                data: values.points.windgust,
                color: 'lightblue',
                label: 'Böen',
                valueLabels: {
                    show: true,
                    showMaxValue: true,
                    yoffsetMax: 4,
                    align: 'center',
                    font: "7pt san-serif",
                    labelFormatter: function(v) {
                        return Math.round(v);
                    }
                }
            }
        ];

        options = {
            series: {
                lines: {
                    fill: false,
                    lineWidth: 1,
                    show: true
                }
            },
            xaxis: xaxis,
            yaxis: {
                min: 0,
                max: (Math.floor((Math.round(values.values.WindMax.replace(',', '.')) + 3) / 5) + 1) * 5
            }
        };
    }

    // --------------------------------------------------
    // Windrichtung
    // --------------------------------------------------
    create['Windrichtung'] = function(values) {
        data = [{
            data: values.points.windangle,
            color: 'blue'
        }];

        options = {
            series: {
                lines: {
                    show: false
                },
                points: {
                    radius: 1,
                    show: true,
                    fill: true
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
                data: values.points.Feinstaub.pm10,
                color: 'blue'
            },
            {
                data: values.points.Feinstaub.pm25,
                color: 'red'
            }
        ];

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
exports.set = setGraphicsTag;