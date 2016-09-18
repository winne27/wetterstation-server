var zmq = require('zmq'),
    sock = zmq.socket('push');

sock.bindSync('tcp://127.0.0.1:8026');
console.log('Producer bound to port 8026');

setInterval(function() {
    console.log('sending work');
    sock.send('some work');
}, 3500);