// Mise en place d'un serveur avec NodeJs et utilisation des WebSockets avec Socket.io

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const messages = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index2.html');
});

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Rejoindre un salon
    socket.on('join', (room) => {
        socket.join(room);
        if (!messages[room]) {
            messages[room] = [];
        }
        socket.emit('chat message', messages[room]);
    });

    // Envoyer un message
    socket.on('chat message', (data) => {
        const { room, msg } = data;
        if (!messages[room]) {
            messages[room] = [];
        }
        messages[room].push(msg);
        // Envoie le message à tous les clients du salon
        io.to(room).emit('chat message', msg);
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
    console.log('http://localhost:3000/');
});

