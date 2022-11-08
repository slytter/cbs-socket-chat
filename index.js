const express = require("express"),

app = express();
app.use(express.static(__dirname + '/public'))

var server = require("http").createServer(app);









var io = require("socket.io")(server, {
    /* Handling CORS: https://socket.io/docs/v3/handling-cors/ for ngrok.io */
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

io.on('connection', function(socket){
  socket.on('join', function(name){
    socket.username = name
    io.sockets.emit("addChatter", name);

    io.sockets.emit("messages", {username: 'din far', message: 'tak'});

  });

  socket.on('messages', function(message){
    username = socket.username
    io.sockets.emit("messages", {username, message});
  });

  socket.on('disconnect', function(name){
    io.sockets.emit("removeChatter", socket.username);
  });
});





app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function(){
  console.log('Server started on port 3000')
});
