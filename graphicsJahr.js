var setGraphicsJahr = function(values,name)
{
   var create = [];
   var options;
   var data;

   var xaxis =
   {
      min: 0.5,
      max: 12.5,
      tickSize: 1,
      tickDecimals: 0
   };

   // --------------------------------------------------
   // Sonnenenergie
   // --------------------------------------------------
   create['Sonne'] = function(values)
   {
      data =
      [{
         data: values.points.sunPower,
         color: '#222222'
      }];

      options =
      {
         series:
         {
            bars:
            {
               show: true
            },
            valueLabels:
            {
               show: true,
               hideSame: false,
               align: 'center',
               valign: 'top',
               font: "7pt 'Trebuchet MS'"
            }
         },
         bars:
         {
             align: "center",
             barWidth: 0.7,
             lineWidth: 1,
             fillColor: '#ffff00'
         },
         xaxis:xaxis,
         yaxis:
         {
            min: 0,
            max: 1200,
            tickSize: 250
         }
      };
   }

   // --------------------------------------------------
   // Temperatur
   // --------------------------------------------------
   create['Temperatur'] = function(values)
   {
      data =
      [
      {
         data: values.points.tempOutMax,
         color: 'red',
         valueLabels:
         {
            show: true,
            hideSame: false,
            align: 'center',
            font: "7pt 'Trebuchet MS'",
            labelFormatter: function(v)
            {
               v = Math.round(v);
               return v;
            }
         }
      },
      {
         data: values.points.tempOutAvg,
         color: 'green',
         valueLabels:
         {
            show: true,
            hideSame: false,
            align: 'center',
            font: "7pt 'Trebuchet MS'",
            labelFormatter: function(v)
            {
               v = Math.round(v);
               return v;
            }
         }
      },
      {
         data: values.points.tempOutMin,
         color: 'blue',
         valueLabels:
         {
            show: true,
            hideSame: false,
            align: 'center',
            //yoffset: 20,
            valign: 'below',
            font: "7pt 'Trebuchet MS'",
            labelFormatter: function(v)
            {
               v = Math.round(v);
               return v;
            }
         }
      }
      ];

      var yaxis =
      {
         tickDecimals: 0,
         tickSize: 10,
         min: -22,
         max: 40
      };

      options =
      {
         series:
         {
            lines:
            {
               lineWidth: 1,
               show: true
            },
            points: { show: true, fill: false, radius: 3 }
         },
         xaxis:xaxis,
         yaxis: yaxis
      };
   }

   // --------------------------------------------------
   // Luftdruck
   // --------------------------------------------------
   create['Luftdruck'] = function(values)
   {
      data =
      [
      {
         data: values.points.relPressureMax,
         color: 'red',
         valueLabels:
         {
            show: true,
            hideSame: false,
            align: 'center',
            font: "7pt 'Trebuchet MS'",
            labelFormatter: function(v)
            {
               v = Math.round(v);
               return v;
            }
         }
      },
      {
         data: values.points.relPressureMin,
         color: 'blue',
         valueLabels:
         {
            show: true,
            hideSame: false,
            align: 'center',
            yoffset: 20,
            font: "7pt 'Trebuchet MS'",
            labelFormatter: function(v)
            {
               v = Math.round(v);
               return v;
            }
         }
      }
      ];

      options =
      {
         series:
         {
            lines:
            {
               lineWidth: 1,
               show: true
            },
            points: { show: true, fill: false, radius: 3 }
         },
         xaxis:xaxis,
         yaxis:
         {
            tickSize: 10,
            tickDecimals: 0,
            min: 965,
            max: 1050
         }
      };
   }
   // --------------------------------------------------
   // Luftfeuchtigkeit
   // --------------------------------------------------
   create['Luftfeucht'] = function(values)
   {
      data =
      [
      {
         data: values.points.relHumOutMax,
         color: 'red'
      },
      {
         data: values.points.relHumOutMin,
         color: 'blue',
         valueLabels:
         {
            show: true,
            hideSame: false,
            align: 'center',
            yoffset: 20,
            font: "7pt 'Trebuchet MS'",
            labelFormatter: function(v)
            {
               v = Math.round(v);
               return v;
            }
         }
      }
      ];

      options =
      {
         series:
         {
            lines:
            {
               lineWidth: 1,
               show: true
            },
            points: { show: true, fill: false, radius: 3 }
         },
         xaxis:xaxis,
         yaxis:
         {
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
   create['Regen'] = function(values)
   {
      data =
      [{
         data: values.points.rain,
         color: '#0000ff'
      }];

      options =
      {
         series:
         {
            bars:
            {
               show: true
            } ,
            valueLabels:
            {
               show: true,
               hideSame: false,
               align: 'center',
               font: "7pt 'Trebuchet MS'",
               labelFormatter: function(v)
               {
                  v = Math.round(v);
                  return v;
               }
            }
         },
         bars:
         {
             align: "center",
             barWidth: 0.7
         },
         xaxis:xaxis,
         yaxis:
         {
            tickDecimals: 0,
            min: 0
         }
      };
   }

   // --------------------------------------------------
   // Wind
   // --------------------------------------------------
   create['Windmax'] = function(values)
   {
      data =
      [
      {
         data: values.points.windSpeedMax,
         color: 'blue'
      },
      {
         data: values.points.windgust,
         color: 'lightblue',
         label: 'Böen'
      }
      ];

      options =
      {
         series:
         {
            lines:
            {
               lineWidth: 1,
               show: true
            },
            points: { show: true, fill: false, radius: 3 },
            valueLabels:
            {
               show: true,
               hideSame: false,
               align: 'center',
               labelFormatter: function(v)
               {
                  v = Math.round(v);
                  return v;
               }
            }
         },
         xaxis:xaxis,
         yaxis:
         {
            min: 0
         }
      };
   }

   // --------------------------------------------------
   // Windrichtung
   // --------------------------------------------------
   create['Windrichtung'] = function(values)
   {
      data =
      [
      {
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

      options =
      {
         series:
         {
            lines:
            {
               show: false
            },
            points:
            {
                radius: 2,
                show: true,
                fill: true
            },
         },
         xaxis:xaxis,
         yaxis:
         {
            min: 0,
            max: 360,
            tickSize: 45,
            ticks: [[0,'N'],[45,'NO'],[90,'O'],[135,'SO'],[180,'S'],[225,'SW'],[270,'W'],[315,'NW'],[360,'N']]
         }
      };
   }
   
   create[name](values);
   return {data: data, options: options};
}
exports.set = setGraphicsJahr;