var jsdom    = require('jsdom');


window = jsdom.jsdom().defaultView;
document = window.document;
jQuery = require('jquery');
$ = jQuery;
//(function($)
//{
   var flot = require('flot');

   var placeholder = document.createElement('div');
   placeholder.style.width = '500px';
   placeholder.style.height = '300px';
   document.body.appendChild(placeholder);

   var data =
   [{
      data: [[1,9],[2,7],[3,8],[4,8],[5,11.6],[6,6],[7,5],[8,7]],
      valueLabels:
      {
         show: true,
         showMaxValue: true,
         showMinValue: true,
         yoffset: 1,
         valignMin: 'bottom',
         align: 'center',
         font: "9pt 'Trebuchet MS'",
         useDecimalComma: true
      }
   }];
   var options =
   {
      series: {bars: {show: true}},
      bars:   {align: "center", barWidth: 0.7, lineWidth: 1},
      yaxis:  {min: 0, max: 14, tickSize: 2, tickDecimals: 0},
      width: 600, height: 300
   };
   var flotplot = $.plot($(placeholder), data, options);

   var nodeCanvas = flotplot.getCanvas();

   var stream = nodeCanvas.toDataURL();

   console.log(stream);
//})(jQuery);

