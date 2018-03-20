const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const UsersService = require('./UsersService');
const userService = new UsersService();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('join', function (name) {
    userService.addUser({
      id: socket.id,
      name
    });
    io.emit('update', { //socket.emit was io.emit
      users: userService.getAllUsers()
    });
  });
  socket.on('message', function(message){
    const {name} = userService.getUserById(socket.id);
    socket.broadcast.emit('message', {
      text: message.text,
      from: name
    });
  });
  socket.on('disconnect', () => {
    userService.removeUser(socket.id);
    socket.broadcast.emit('update', {
      users: userService.getAllUsers()
    });
  });
});

server.listen(8080, function () {
  console.log('listening on *:8080');
});