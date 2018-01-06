var app = require("express")();
var fs = require('fs');
var http = require("http").Server(app);
var io = require('socket.io')(http);

var players = {};
var adminSocket = null;
var curGame = "";
var curGameWords = "";
var timeup = true;
var buzzed = false;

app.get("/", function(req, res) {
	res.sendFile(__dirname+'/index.html');
});

io.on("connection", function(socket){
	console.log("A user connected: " + socket.id);
	socket.emit("connected",true);
	// play(sounds(0));

  socket.on("set_name", function(name){
    console.log("User set name: " + name);
    if(name === "admin"){
      adminSocket = socket.id;
      return;
    }

    players[socket.id] = name;
    socket.emit("name_set");

    if(curGame.length)
      io.sockets.emit('game_changed', curGame);

    if(curGameWords.length && !timeup)
      socket.emit('new_words', curGameWords);
  });


	socket.on("disconnect", function(){
		console.log("User disconnected: " + socket.id);
	});

	socket.on("new_qsn", function(qsn){
		socket.broadcast.emit('new_qsn', qsn);
		io.sockets.emit('open_buzzers');
    buzzed = false;
	});

  socket.on("play_game", function(game){
    io.sockets.emit('game_changed', game);
    curGame = game;
  });

  socket.on("card_words", function(words){
    io.sockets.emit('new_words', words);
    curGameWords = words;
    // console.log("New words: " + words);
    timeup = false;

    setTimeout(function(){
      io.sockets.emit('time_up');
      timeup = true;
      console.log("Time's Up!");
    }, 30000);
  });

	socket.on("close_qsn", function(data){
    buzzed = false;
		io.sockets.emit('qsn_closed');
		console.log("Question Closed");
	});

	socket.on("buzz", function(data){
    if(!buzzed){
		  io.sockets.emit("play_buzzer", players[socket.id]);
      console.log(players[socket.id] + " Buzzed first");
      buzzed = true;
    }else{
      io.sockets.emit("play_buzzer");
    }

    setTimeout(function(){
      io.sockets.emit('qsn_pending');
    }, 500);
		console.log("Buzzer clicked");
	});
});

http.listen(3000, "localhost", function(){
	console.log("Server is listening.");
});