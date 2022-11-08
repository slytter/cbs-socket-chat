const express = require("express")
const sqlite3 = require('sqlite3').verbose();

app = express();
app.use(express.static(__dirname + '/public'))
const server = require("http").createServer(app);



// Sqlite ting
const db = new sqlite3.Database('./db.sqlite');

db.serialize(function() {
  console.log('creating databases if they don\'t exist');
  db.run('create table if not exists messages (messageid integer primary key, username text not null, message text, timestamp integer)');
});


// Tilføjer message til db `message: {username, message}`
const addMessageToDatabase = (message) => {
  db.run(
    'insert into messages (username, message, timestamp) values (?, ?, ?)', 
    [message.username, message.message, Date.now()], 
    function(err) {
      if (err) {
        console.error(err);
      }
    }
  );
}


const getAllMessages = () => {
  // Smart måde at konvertere fra callback til promise:
  return new Promise((resolve, reject) => {  
    db.all('select * from messages', (err, rows) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      return resolve(rows);
    });
  })
}



// socket IO ting
var io = require("socket.io")(server, {
    /* Handling CORS: https://socket.io/docs/v3/handling-cors/ for ngrok.io */
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});



io.on('connection', function(socket){

  // Når en ny bruger joiner
  socket.on('join', async function(name){
    socket.username = name
    io.sockets.emit("addChatter", name);
    io.sockets.emit('new_message', {username: 'Server', message: 'Velkommen ' + name + '!'});
  });

  // Når server modtager en ny besked
  socket.on('new_message', function(message){
    const username = socket.username
    console.log(username + ': ' + message);
    io.sockets.emit("new_message", {username, message});
  });
  
  // Når en bruger disconnecter
  socket.on('disconnect', function(name){
    io.sockets.emit("removeChatter", socket.username);
  });
});



// HTTP ting
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function(){
  console.log('Server started on port 3000')
});
