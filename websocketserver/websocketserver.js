import { Server } from 'socket.io';
import express from 'express';

const PORT = process.env.PORT || 8000;

const app = express();

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const server = app.listen(PORT, () => {
    console.log(`WebSocket Server running on port: ${PORT} ...`);
});

io.attach(server);

let connectedSockets = {};

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('register', (username) => {
        connectedSockets[username] = socket.id;
        io.emit('clients-total', Object.keys(connectedSockets).length);
        console.log(`Client registered: ${username}. Total clients: ${Object.keys(connectedSockets).length}`);
    });

    socket.on('disconnect', () => {
        for (let username in connectedSockets) {
            if (connectedSockets[username] === socket.id) {
                delete connectedSockets[username];
                break;
            }
        }
        io.emit('clients-total', Object.keys(connectedSockets).length);
        console.log(`Client disconnected: ${socket.id}. Total clients: ${Object.keys(connectedSockets).length}`);
    });

    socket.on('connected-clients', (username) => {
        const otherUsers = Object.keys(connectedSockets).filter((user) => user !== username && user !== 'guest');
        console.log(`Other users (excluding ${username}): ${otherUsers}`);
        socket.emit('connected-clients', otherUsers);
    });

    socket.on('message', (data) => {
        socket.broadcast.emit('chatMessage', data);
    });

    socket.on('privateMessage', (data) => {
        const destSocket = connectedSockets[data.to];
        if (destSocket) {
            io.to(destSocket).emit('privateChatMessage', data);
        } else {
            console.log('User not connected');
        }
    });
});
