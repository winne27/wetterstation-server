
var vhostManager = require("express-vhost-manager");

var config = {
  port: 81, // listen port
  "redirects": { // a simple way to make redirects
    "wernerschaefferi.de":"http://spiegel.de"
  },
  "proxies": { // a simple way to request an other server and send back the result from this server
    "wernerschaeffer.de": "http://www.kirsch-gestaltung.de",
    "beta2.example.com": "http://localhost:3000"
  }
};

vhostManager(config);
