
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(`${__dirname}/index.html`);
});

var waitingPlayers = [];

io.on('connection', function (socket) {
  waitingPlayers.push(socket);

  // default room is "waitingPlayers"
  socket.room = 'waitingPlayers';
  socket.join(socket.room);

  io.to(socket.id).emit('chat message', `Current Room: ${socket.room}.`);

  socket.on('disconnect', function () {
    io.to(socket.room).emit('chat message', `user (${socket.id}) disconnected`);
    if (socket.room == 'waitingPlayers') {
      // delete this socket from waitingPlayers
      var index = waitingPlayers.indexOf(socket);
      waitingPlayers.splice(index, 1);
    }
  });

  socket.on('chat message', function (msg) {
    io.to(socket.room).emit('chat message', msg);
  });

  // whether 2 players are online.
  if (waitingPlayers.length >= 2) {
    var roomName = socket.id;
    waitingPlayers.splice(0, 2).map(function (socket) {
      socket.leave(socket.room); // leave from default room
      socket.room = roomName;
      socket.join(roomName); // join to new room
    });
    io.to(roomName).emit('chat message', `Current Room: ${socket.room}.`);
  }
});

http.listen(3000, function () {
  console.log('listening on :3000');
});
