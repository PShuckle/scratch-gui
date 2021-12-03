const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
    cors: {
        origin: "*",
    }
});

const Room = require('./room.js');

const rooms = {};

io.on("connection", socket => {
    socket.on('create room', roomID => {
        // create room with creator set as the teacher
        rooms[roomID] = new Room(socket.id);
    });

    socket.on('join room', joinRequest => {
        // let student join a room
        const roomID = joinRequest.roomID;
        const name = joinRequest.name;

        var room = rooms[roomID];

        // check if room with roomID entered exists
        if (room) {
            room.addUser(socket.id, name);

            const teacher = room.getTeacher();

            socket.emit('teacher', teacher);
            socket.to(teacher).emit('user joined', {id: socket.id, name: name});
            
        } else {
            console.error('room does not exist');

        }
    });

    // establish connection between student and teacher

    socket.on('offer', payload => {
        io.to(payload.target).emit('offer', payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit('answer', payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    });

    socket.on('click', clickEvent => {
        io.to(clickEvent.studentID).emit('click', {x: clickEvent.x, y: clickEvent.y});
    })

    socket.on('dragStart', clickEvent => {
        io.to(clickEvent.studentID).emit('dragStart', {x: clickEvent.x, y: clickEvent.y});
    })

    socket.on('key', keyEvent => {
        io.to(keyEvent.studentID).emit('key', {key: keyEvent.key, code: keyEvent.code});
    })
});

server.listen(8000, () => console.log('server is running on port 8000'));
