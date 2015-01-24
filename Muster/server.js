var http = require("http");
var url  = require('url');
var fs   = require('fs');
var io   = require('socket.io');

var server = http.createServer(function(request, response)
{
    console.log('Connection http');
    var path = url.parse(request.url).pathname;
    console.log('Path: ' + path);
    console.log("Received request type:" + request.method);
    switch(path)
    {
        // catch http put request send by mysql trigger
        case '/trigger':
            request.on('data', function(chunk)
            {
               console.log(chunk.toString());
               // only the header with no data is send back to mysql trigger
               response.writeHead(200, {'Content-Type': 'text/plain'});
               response.end();
               // the data send by put request from mysql trigger is send to all websocket clients
               ios.sockets.emit('newdata', {'newValues': new Date() + ' ' + chunk.toString()});
            });
            break;
        // deliver website weather to browser
        case '/weather.html':
            console.log('request for weather.html');
            fs.readFile(__dirname + path, function(error, data)
            {
                if (error)
                {
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                }
                else
                {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
        default:
            response.writeHead(404);
            response.write("opps this doesn't exist - 404");
            break;
    }
});

server.listen(8027);
var ios = io(server);

// handle for the websocket connection from browser
ios.sockets.on('connection', function(socket)
{
    console.log('Connection by websocket');
    socket.emit('newdata', {'newValues': 'websocket startet'});
});
