//THIS IS THE SERVER SIDE FILE

//DEPENDENTS
const instanceJS = require('engine.io/lib/server.js')
const mainLoopInstance = require('mainloop.js/build/mainloop.min.js')


const canvas = {width: 800, height: 800}

const paddleSpeed = 0.15
const ballSpeed = 0.3


const paddleWidth = 200
const paddleHeight = 15

const ballRaidus = 10

//EXTENTION OF SERVER.JS

const PORT = process.env.PORT || 5000
// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', PORT);
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(PORT, function() {
	console.log('Starting server on port ' +  PORT);
});

//SERVER SIDE VARS

var dataPackage = function(paddleTop,paddleBottom,ball,score){
	this.paddleTop = {x: paddleTop.x, y: paddleTop.y }
	this.paddleBottom = {x: paddleBottom.x, y: paddleBottom.y }
	this.ball = {x: ball.x, y: ball.y }
	this.score = {top: score.top, bottom: score.bottom}
}

var paddleTop
var paddleBottom
var ball
var score

var users

//SERVER OBSERVERS
io.on('connection', function(socket) {
	
	
	if(users.length<2){ 
		io.to(socket.id).emit('gameFull', {isFull: false});

	}else{
		io.to(socket.id).emit('gameFull', {isFull: true});
	}

	socket.on('new user', function(data){
		addUser(socket.id) //adding a user
		socket.broadcast.emit('someone joined', "")
		verbose("someone joined " + users.length + " players now")
	})

	socket.on('disconnect', function() {
		if(removeUser(socket.id)){
		socket.broadcast.emit('someone left', "")
		verbose("someone left " + users.length + " players left")
		}
	})

	socket.on('moveX', function(data) {
		//finding right paddle and moving if possible
		if(!data.release){
			users[getUserIndex(socket.id)].dx = (!data.positive) ? -1 : 1
		}else{ 
			users[getUserIndex(socket.id)].dx = 0
		}
	})

})




function addUser(id){
	users.push({id: id, dx : 0, dy : 0})
}

function getUserIndex(id){
	for(var i = 0; i < users.length; i++){
		if(users[i].id == id){
			return i;
		}
	}
}


function removeUser(id){
	for(var i = 0; i < users.length; i++){
		if(users[i].id == id){
			users.splice(i,1)
			return true;
		}
	}
	return false
}

function update(delta){
	//verbose(users)
	//moving sprites (id:1 = top, id:2 = bottom)
	if(users.length > 0 && !(users[0].dx < 0 && paddleTop.x < 0 || users[0].dx > 0 && paddleTop.x + paddleWidth  > canvas.width)){
		if(users[0].dx != 0)
			paddleTop.x += (users[0].dx < 0) ? -delta * paddleSpeed : delta * paddleSpeed

	}
	if(users.length > 1 && !(users[1].dx < 0 && paddleBottom.x < 0 || users[1].dx > 0 && paddleBottom.x + paddleWidth > canvas.width)){

		if(users[1].dx != 0)
			paddleBottom.x += (users[1].dx < 0) ? -delta * paddleSpeed : delta * paddleSpeed

	}

	if(ball.dx !=0 )
		ball.x += (ball.dx < 0) ? -delta * ballSpeed : delta * ballSpeed
	if(ball.dy !=0 )
		ball.y += (ball.dy < 0) ? -delta * ballSpeed : delta * ballSpeed



	//Ball physics

	if(ball.x < 0 || ball.x > canvas.width){
		ball.dx *= -1
	}

	if(paddleTop.x < ball.x + ballRaidus && paddleTop.x + paddleWidth > ball.x && paddleTop.y < ball.y + ballRaidus && paddleTop.y + paddleHeight > ball.y){
		ball.dy *= -1
	}

	if(paddleBottom.x < ball.x + ballRaidus && paddleBottom.x + paddleWidth > ball.x && paddleBottom.y < ball.y + ballRaidus && paddleBottom.y + paddleHeight > ball.y){
		ball.dy *= -1
	}




	//checking for goal
	if(ball.y < 0){
		//bottom scored
		score.bottom++

		//reset ball
		ball.x = paddleBottom.x + paddleWidth/2
		ball.y = paddleBottom.y - ballRaidus

		ball.dx = ballSpeed
		ball.dy = -ballSpeed
	}

	if(ball.y > canvas.height){
		//bottom scored
		score.top++

		//reset ball
		ball.x = paddleTop.x + paddleWidth/2
		ball.y = paddleTop.y + ballRaidus + paddleHeight

		ball.dx = ballSpeed
		ball.dy = ballSpeed
	}

	if(score.top == 10 || score.bottom == 10){
		paddleTop = {x: canvas.width*.4, y: canvas.height*.01}
		paddleBottom = {x: canvas.width*.4, y: canvas.height*.97}
		ball = {x: canvas.width/2, y: canvas.height/2, dx: ballSpeed, dy: ballSpeed}
		score = {top: 0, bottom: 0}
	}

	//updating clients
	io.sockets.emit('update', packageData());
}



function start(){
	//initalize vars
	paddleTop = {x: canvas.width*.4, y: canvas.height*.01}
	paddleBottom = {x: canvas.width*.4, y: canvas.height*.97}
	ball = {x: canvas.width/2, y: canvas.height/2, dx: ballSpeed, dy: ballSpeed}
	score = {top: 0, bottom: 0}

	users = []

	mainLoopInstance.setUpdate(update).start(); //load mainloop
}


function packageData(){
	return new dataPackage(paddleTop,paddleBottom,ball,score)
}



start()


//MISC FUNCTIONS

function verbose(args){ //simplification of console.log
	console.log(args)
}