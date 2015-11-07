require('jsdom').env(
{
   html: '<html><body></body></html>', // URL or markup required
   scripts: [
     // can't use jQuery 1.7+, atm, b/c of https://github.com/NV/CSSOM/issues/29
     'http://code.jquery.com/jquery-1.6.4.min.js',
     // Flot 0.7 patched to support node-canvas
     'https://raw.github.com/gist/1364155/8d9161159d1e2bbed1a34aad90dd6d7af07a7ccf/jquery.flot-on-node.js'
   ],
   done: function (errors, window)
   {
      if (errors) { /* do something */ }

      // no `window` in node
      var $ = window.$, jQuery = window.jQuery;
      exports.$ = $;
      // differences from typical flot usage
      // jQuery (loaded via jsdom) can't determine element dimensions, so:
      // width and height options are required
      var options = { width: 600, height: 300 };
      // we can just use a stub jQuery object
      var $placeholder = $('');
      exports.$placeholder = $placeholder;
   }
});