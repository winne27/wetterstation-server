var http = require("http");
var url = require('url');
var io = require('socket.io');
var jsdom = require('jsdom').jsdom;
var fs = require('fs');

var html = '<!doctype html><html><head></head><body></body></html>';
document = jsdom(html);
window = document.parentWindow;

jQuery = require('jquery');
$ = jQuery;

var flot = require('flot');
require('flot/jquery.flot.valuelabels.js');

// define http server
var server = http.createServer(function(request, response) {
    var path = url.parse(request.url).pathname;
    switch (path) {
        // deliver die main html page
        case '/flotExample.html': // delivers the web page
            // read html file from disk
            fs.readFile(__dirname + '/flotExample.html', function(error, data) {
                if (error) {
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                } else {
                    // send page to browser
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.write(data, "utf8");
                }
                response.end();
            });
            break;
        default:
            response.writeHead(404);
            response.write("opps this doesn't exist - 404");
            break;
    }
});

// define socket
var ios = io(server);

// socket listener for new connection
ios.sockets.on('connection', function(socket) {
    console.log('socket connection');
    deliverDiag(socket, 'today', 1);

    // socket listener for request
    socket.on('getDiag', function(data) {
        deliverDiag(socket, data.name, 1);
    });
});

server.listen(8080);
var nextValues = 'one';

setInterval(function() {
    // broadcast to every connect socket
    deliverDiag(ios.sockets, nextValues, 2);
    if (nextValues == 'one') nextValues = 'two';
    else if (nextValues == 'two') nextValues = 'three';
    else nextValues = 'one';
}, 5000);

// create and emit the graphic
function deliverDiag(socket, name, container) {
    // define a placeholder for creating the flot graphic
    var placeholder = document.createElement('div');
    placeholder.id = 'placeholder';
    placeholder.style.width = '400px';
    placeholder.style.height = '300px';
    document.body.appendChild(placeholder);

    // define plot values
    var values = {
        today: [
            [1, 8],
            [2, 7],
            [3, 4],
            [4, 8.4],
            [5, 6],
            [6, 7.5]
        ],
        yesterday: [
            [1, 5],
            [2, 6],
            [3, 3.9],
            [4, 8.1],
            [5, 5],
            [6, 7.9]
        ],
        one: [
            [1, 8],
            [2, 7],
            [3, 4],
            [4, 8.4],
            [5, 6],
            [6, 7.5]
        ],
        two: [
            [1, 5],
            [2, 6],
            [3, 3.9],
            [4, 8.1],
            [5, 5],
            [6, 7.9]
        ],
        three: [
            [1, 6],
            [2, 6.4],
            [3, 3.7],
            [4, 8.3],
            [5, 5.9],
            [6, 7.9]
        ]
    }

    var data = [{
        data: values[name],
        color: '#FF0000',
        valueLabels: {
            show: true,
            showMinValue: true,
            showMaxValue: true,
            align: 'center',
            yoffsetMin: 19
        }
    }];

    var options = {
        series: {
            lines: {
                lineWidth: 1,
                show: true
            },
            points: { show: true, fill: false, radius: 1 }
        }
    };

    // create graphic with flot
    var flotplot = $.plot(
        $('#placeholder'),
        data,
        options
    );

    // get the data fom the graphic canvas
    var nodeCanvas = flotplot.getCanvas();
    // transform canvas data into a string
    var stream = nodeCanvas.toDataURL();

    // emit image to browser via requesting socket
    socket.emit('diag', { stream: stream, container: container });
}