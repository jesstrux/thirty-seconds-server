var app = require("express")();
var fs = require('fs');
var http = require("http").Server(app);
var io = require('socket.io')(http);

// var play = require('audio-play')
// var load = require('audio-loader')
// var lenaMp3 = require('audio-lena/mp3')
// var path = require('path')

var sounds = [];

// load(path.join(__dirname, '/buzzer.mp3')).then(function(buffer){
// 	sounds.push(buffer);
// }).catch(function(){
// 	console.log("Couldnt load buzzer");
// });


app.get("/", function(req, res) {
	res.sendFile(__dirname+'/index.html');
});

io.on("connection", function(socket){
	console.log("A user connected: " + socket.id);
	socket.emit("connected",true);
	// play(sounds(0));

	socket.on("disconnect", function(){
		console.log("User disconnected: " + socket.id);
	});

	socket.on("new_qsn", function(qsn){
		socket.broadcast.emit('new_qsn', qsn);
		setTimeout(function(){
			io.sockets.emit('open_buzzers');
		}, 200);
		console.log("New question: " + qsn);
	});

	socket.on("close_qsn", function(data){
		io.sockets.emit('qsn_closed');
		console.log("Question Closed");
	});

	socket.on("buzz", function(data){
		io.sockets.emit("play_buzzer");
		
		io.sockets.emit('qsn_pending');
		console.log("Buzzer clicked");
	});
});

http.listen(3000, function(){
	console.log("Server is listening.");
});