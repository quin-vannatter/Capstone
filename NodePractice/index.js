var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Set port to listen on.
var port = 3700;

// Serve index.html for GET requests.
app.get('/', function (req, res) {
    console.log('Trying to load index.html');

    res.sendFile(__dirname + '/index.html');
});

// Setup static directory (js/css/etc).
app.use(express.static(__dirname + '/public'));

// Set server to listen on specified port.
http.listen(port, function () {
    console.log('Listening on port ' + port);
});

var users = {};

// Setup socket on-connect.
io.on('connection', function (socket) {
    console.log('\t User connected.');
    console.log(socket.conn.id);

    // Disconnect.
    socket.on('disconnect', function () {
        console.log('\t User disconnected.');
    });

	socket.on('set name', function (name) {
		users[socket.conn.id] = name;
	});
	
    // Chat message.
    socket.on('chat message', function (message) {
        console.log('\t User sent message: ' + message);

        var response = {
			user: users[socket.conn.id],
            message: message
        };

        io.emit('chat message', response);
    });
});