const express = require('express');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const bodyParser = require('body-parser');
const validation = require('./validate');

let app = express();

let http = require('http').createServer(app);

var io = require('socket.io')(http);

var sessionMiddleware = session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

app.use(sessionMiddleware);

app.post("/recoverSessionExpress", (req, res) => {
    req.session.name = req.body.name;
    req.session.points = req.body.points;
    req.session.turn = req.body.turn;
    req.session.already = req.body.already;
    req.session.roomName = req.body.roomName;
    req.session.roomID = req.body.roomID;
    res.send("");
});

app.post("/recoverSessionSocket", (req, res) => {
    res.send({
        name: req.session.name,
        points: req.session.points,
        turn: req.session.turn,
        already: req.session.already,
        roomName: req.session.roomName,
        roomID: req.session.roomID
    });
});

app.post("/validateSession", (req,res)=>{
    if(req.session.user == null || req.session.user==undefined){
        res.send("NO")
    }else{
        res.send("SI")
    }
})

app.post("/login", (req, res) => {
    try {
        validation.validateNick(req.body.user).then((resolve) => {
            if (resolve == true) {
                verifyName(req.body.user).then((resolve) => {
                    if (resolve == 0) {
                        res.send("Nombre de usuario ocupado, usa otro");
                    }
                    else {
                        req.session.user = req.body.user;
                        online.push(req.body.user)
                        res.send("");
                    }
                });
            } else {
                res.send(resolve);
            }
        })
    } catch (err) { console.log(err); }
});

function verifyName(name) {
    try {
        return new Promise((resolve, reject) => {
            var bool = false;
            online.forEach(element => {
                if (element == name) {
                    resolve(0);
                    bool = true;
                }
            });
            if (!bool) {
                resolve(1);
            }
        });
    } catch (err) { console.log(err); }
}

var online = [];
var rooms = [];
var play = [];

io.on('connection', function (socket) {

    socket.on("sendWord", (word) => {
        if (socket.handshake.session.turn == rooms[socket.handshake.session.roomID].turn) {
        }
        else {
            if (word == play[rooms[socket.handshake.session.roomID].playID].getWord()) {
                for (var i = 0; i < play[rooms[socket.handshake.session.roomID].playID].room.users.length; i++) {

                    if (play[rooms[socket.handshake.session.roomID].playID].room.users[i].name == socket.handshake.session.user && play[rooms[socket.handshake.session.roomID].playID].room.users[i].already==false) {
                        play[rooms[socket.handshake.session.roomID].playID].room.users[i].points += 60 - play[rooms[socket.handshake.session.roomID].playID].getTime();
                        play[rooms[socket.handshake.session.roomID].playID].room.users[i].already = true;
                        play[rooms[socket.handshake.session.roomID].playID].addTime();
                        play[rooms[socket.handshake.session.roomID].playID].verifyGame();
                        io.sockets.in(socket.handshake.session.roomName).emit("updateScoreboard", play[rooms[socket.handshake.session.roomID].playID].room.users);
                    }
                }
            }
            else {
            }
        }
    });

    socket.on("sendDraw", (x, y, color, bool, lineThickness) => {
        try {
            if (socket.handshake.session.turn == rooms[socket.handshake.session.roomID].turn && play[rooms[socket.handshake.session.roomID].playID].getBool() == true) {
                io.sockets.in(socket.handshake.session.roomName).emit("getDraw", x, y, color, bool, lineThickness);
            }
            else {
            }
        } catch (err) { console.log(err); }
    });

    socket.on("register", (r) => {
        try {
            socket.handshake.session.user = r;
            socket.handshake.session.save();
            socket.emit("enter");
        } catch (err) { console.log(err); }
    });

    socket.on("alertS", (r) => {
        try {

            socket.handshake.session.user = r.name;
            socket.handshake.session.points = r.points;
            socket.handshake.session.turn = r.turn;
            socket.handshake.session.roomName = r.roomName;
            socket.handshake.session.already = r.already;
            socket.handshake.session.roomID = r.roomID;
            socket.handshake.session.save();

            socket.join(socket.handshake.session.roomName);
        } catch (err) { console.log(err); }
    });

    socket.on("getRooms", () => {
        try {
            io.emit("roomAviables", rooms);
        } catch (err) { console.log(err); }
    });

    socket.on("turn?", () => {
        try {
            if (socket.handshake.session.turn == rooms[socket.handshake.session.roomID].turn) {
                socket.emit("drawCursor");
            }
            else {
                socket.emit("noCursor");
            }
        } catch (err) { console.log(err); }
    });

    socket.on("sendRequestWord", () => {
        try {
            let word = play[rooms[socket.handshake.session.roomID].playID].getWord();
            if (socket.handshake.session.turn == rooms[socket.handshake.session.roomID].turn) {
                socket.emit("getWord", word);
            }
            else {
                socket.emit("getWord", word.replace(/\w/g, "-"));
            }
        } catch (err) { console.log(err); }
    });

    socket.on("sendMessage", (message) => {
        validation.validateMessage(message).then(resolve=>{
            if(resolve){
                validation.remove(message).then(resolve2=>{
                    let user = socket.handshake.session.user;
                    io.emit("getMessage", `<b>${user}: </b>${resolve2}<br>`);
                })
            }
        })
    });

    socket.on("createRoom", (topic, players, name, user) => {
        try {
            validation.validateName(name).then(resolve => {
                if (resolve == true) {
                    validation.validateTopic(topic).then(resolve => {
                        if (resolve == true) {
                            validation.validateNumbres(players).then(resolve => {
                                if (resolve == true) {
                                    let flag = true;
                                    let flag2 = true;
                                    rooms.forEach(element => {
                                        if (element.name == name && element.finished==false) {
                                            flag2 = false;
                                        }
                                        let row = element.users;
                                        row.forEach(element1 => {
                                            if (element1.name == user && element.finished==false) {
                                                flag = false;
                                            }
                                        })
                                    })
                                    if (flag) {
                                        if (flag2) {
                                            rooms.push({
                                                room: rooms.length + 1,
                                                size: players,
                                                topic: topic,
                                                name: name,
                                                finished:false,
                                                turn: -1,
                                                playID: 0,
                                                users: [{
                                                    name: user,
                                                    points: 0,
                                                    turn: 0,
                                                    already: false
                                                }]
                                            });
                                            socket.handshake.session.roomID = rooms.length - 1;
                                            socket.handshake.session.roomName = name;
                                            socket.handshake.session.turn = 0;
                                            socket.handshake.session.user = user;
                                            socket.handshake.session.save();
                                            socket.join(name);
                                            socket.emit("wait", 0, {
                                                name: user,
                                                points: 0,
                                                turn: 0,
                                                already: false,
                                                roomName: name,
                                                roomID: (rooms.length - 1)
                                            });
                                            io.emit("roomAviables", rooms);
                                        } else {
                                            socket.emit("errorCreateRoom", "Ya existe una partida con ese nombre, por favor cambialo");
                                        }
                                    } else {
                                        socket.emit("errorCreateRoom", "Ya estas unido a una partida, no puedes crear otra");
                                    }

                                } else {
                                    socket.emit("errorCreateRoom", resolve);
                                }
                            })
                        } else {
                            socket.emit("errorCreateRoom", resolve)
                        }
                    });
                } else {
                    socket.emit("errorCreateRoom", resolve);
                }
            })
        } catch (err) { console.log(err); }
    });

    socket.on("joinRoom", (id, name, user) => {
        try {
            let flag = false;
            rooms.forEach(element => {
                if (name == element.name && id == element.room) {
                    flag = true;
                }
            })
            if (flag) {
                if (rooms[id - 1].size <= rooms[id - 1].users.length) {
                    socket.emit("errorJoin", "Esta partida ya esta llena, por favor selecciona otra o crea una");
                } else {
                    let validate = rooms[id - 1].users;
                    let flag = true;
                    validate.forEach(element => {
                        if (element.name == user) {
                            flag = false;
                        }
                    })
                    if (flag) {
                        flag = true;
                        for (var i = 0; i < rooms.length; i++) {
                            if (i != (id - 1)) {
                                let users = rooms[i].users;
                                users.forEach(element => {
                                    if (element.name == user && rooms[i].finished==false) {
                                        flag = false;
                                    }
                                })
                            }
                        }
                        if (flag) {
                            rooms[id - 1].users.push({
                                name: user,
                                points: 0,
                                turn: rooms[id - 1].users.length,
                                already: false
                            });
                            socket.join(name);
                            socket.handshake.session.roomID = id - 1;
                            socket.handshake.session.roomName = name;
                            socket.handshake.session.turn = rooms[id - 1].users.length - 1;
                            socket.handshake.session.user = user;
                            socket.handshake.session.save();
                            socket.emit("wait", (rooms[id - 1].users.length - 1), {
                                name: user,
                                points: 0,
                                turn: (rooms[id - 1].users.length - 1),
                                already: false,
                                roomName: name,
                                finished:false,
                                roomID: (id - 1)
                            });
                            io.emit("roomAviables", rooms);
                            if (rooms[id - 1].size == rooms[id - 1].users.length) {
                                io.sockets.in(rooms[id - 1].name).emit("ready");
                                let game = new Game(rooms[id - 1]);
                                game.startTimeOut();
                                rooms[id - 1].playID = play.length;
                                play.push(game);
                            }
                        } else {
                            socket.emit("errorJoin", "Ya estas en una partida, espera a que se llene");
                        }
                    } else {
                        socket.emit("errorJoin", "Ya te uniste a esa partida");
                    }
                }
            } else {
                socket.emit("errorJoin", "La partida seleccionada no existe, por favor no modifiques el script");
            }
        } catch (err) { console.log(err); }
    });

});

app.use(express.static('public'));

http.listen(3000, () => {
    console.log("Escuchando al puerto 3000");
});

class Game {

    constructor(roomExt) {
        try {
            this.room = roomExt;
            this.q = 1;
            this.bool = true;
            this.i = 0;
        } catch (err) { console.log(err); }
    }

    verifyGame() {

        let aux = 0;
        for (var p = 0; p < this.room.users.length; p++) {
            if (this.room.users[p].already == true) {
                aux++;
            }
            if (aux == (this.room.users.length - 1)) {
                this.i = 60;
            }
        }

    }

    resetGame() {

        for (var p = 0; p < this.room.users.length; p++) {
            this.room.users[p].already = false;
        }

    }

    getTime() {
        return this.i;
    }

    addTime() {
        this.i += 10;
    }

    getBool() {
        try {
            return this.bool;
        } catch (err) { console.log(err); }
    }

    changeTurn() {
        try {
            this.room.turn = this.room.turn + 1;
            if (this.room.turn > (this.room.size - 1)) {
                this.room.turn = 0;
                this.q = this.q + 1;
            }
        } catch (err) { console.log(err); }
    }

    getWord() {
        try {
            return this.word;
        } catch (err) { console.log(err); }
    }

    setWord() {
        try {
            if (this.room.topic == "Música") {
                let words = require("./topics/music.json");
                let k = Math.floor(Math.random() * (words.length));
                this.word = words[k];
            }
            if (this.room.topic == "Alimentos") {
                let words = require("./topics/food.json");
                let k = Math.floor(Math.random() * (words.length));
                this.word = words[k];
            }
            if (this.room.topic == "Lugares") {
                let words = require("./topics/places.json");
                let k = Math.floor(Math.random() * (words.length));
                this.word = words[k];
            }
            if (this.room.topic == "Cine") {
                let words = require("./topics/cinema.json");
                let k = Math.floor(Math.random() * (words.length));
                this.word = words[k];
            }
            if (this.room.topic == "Cosas") {
                let words = require("./topics/things.json");
                let k = Math.floor(Math.random() * (words.length));
                this.word = words[k];
            }
            if (this.room.topic == "Videojuegos") {
                let words = require("./topics/videogames.json");
                let k = Math.floor(Math.random() * (words.length));
                this.word = words[k];
            }
        } catch (err) { console.log(err); }
    }

    getTurn() {
        try {
            return this.room.turn;
        } catch (err) { console.log(err); }
    }

    startGame() {
        try {
            let j = 0;
            var a = setInterval(() => {
                if (this.q == 3) {

                    var aux = [];
                    var k,l;

                    this.room.finished = true;

                    var aux2 = 0;   
                    var aux3 = 0;

                    rooms.forEach(element => {
                        if(rooms.roomID==this.room.roomID){
                            aux3 = aux2;
                        }
                        else{
                            aux++;
                        }
                    });

                    rooms[aux3].finished = true;

                    for (k = 1; k < this.room.users.length; k++) {
                        for (l = 0; l < (this.room.users.length - k); l++) {
                            if (this.room.users[l].points > this.room.users[l+1].points) {
                                aux = this.room.users[l];
                                this.room.users[l] = this.room.users[l+1];
                                this.room.users[l+1] = aux;
                            }
                        }
                    }

                    var m;
                    var tempU = [];

                    tempU.push(this.room.users[this.room.users.length-1]);

                    for(m=this.room.users.length-2;m>=0;m--){
                        if(this.room.users[m].points==tempU[0].points){
                            tempU.push(this.room.users[m]);
                        }
                    }

                    io.sockets.in(this.room.name).emit("finished",tempU);
                    clearInterval(a);
                }
                if (this.i == 0) {
                    io.sockets.in(this.room.name).emit("turn", this.getTurn());
                    this.setWord();
                }
                if (this.i != -1) {
                    this.i++;
                    io.sockets.in(this.room.name).emit("timeLeftGame", this.i);
                }
                else {
                    j++;
                    io.sockets.in(this.room.name).emit("timeLeftRelax", j);
                }
                if (this.i >= 60) {
                    this.bool = false;
                    this.i = -1;
                    j = 0;
                    this.resetGame();
                    this.changeTurn();
                }
                if (j == 10) {
                    this.bool = true;
                    j = -1;
                    this.i = 0;
                    io.sockets.in(this.room.name).emit("turn", this.getTurn());
                }
            }, 1000);
        } catch (err) { console.log(err); }
    }

    startTimeOut() {
        try {
            let seconds = 0;
            var a = setInterval(() => {
                seconds++;
                io.sockets.in(this.room.name).emit("timeOutTime", seconds);
                if (seconds == 5) {
                    clearInterval(a);
                    this.startGame();
                    io.sockets.in(this.room.name).emit("updateScoreboard", this.room.users);
                    this.room.turn = 0;
                }
            }, 1000);
        } catch (err) { console.log(err); }
    }

}
