
//THIS IS THE CLIENT SIDE FILE
window.onload = function(){ //onload guard


	const canvas = document.getElementById('window')
	const context = canvas.getContext('2d')


	const paddleWidth = 200
	const paddleHeight = 15


	const ballRaidus = 10

	var paddleTop
	var paddleBottom
	var ball
	var score

	var isSpectator 

	//CLIENT OBSERVERS
	var socket = io()
	socket.on('gameFull', function(data) {
		if(!data.isFull){ //game not full
			isSpectator = false
		}else{
			//game is full
			isSpectator = true
			alert('game is full so yea')
		}
		startClient()
	})


	socket.on('update', function(data) {
		//deconstructing server data
		paddleTop = data.paddleTop
		paddleBottom = data.paddleBottom
		ball = data.ball
		score = data.score
	})

	socket.on('someone joined', function(){
		alert("someone joined")
	})

	socket.on('someone left', function(){
		alert("someone left")
	})

	//KEYS
	window.addEventListener("keydown", function (event) {
		if (event.defaultPrevented) {
    //return; 
}

if(isSpectator){ return }

	switch(event.key){
		case "a":
		socket.emit('moveX', {release: false, positive: false})
		break;
		case "d":
		socket.emit('moveX', {release: false, positive: true})
		break;
		default:
		break;
	}


	event.preventDefault();
}, true);


	window.addEventListener("keyup", function (event) {
		if (event.defaultPrevented) {
    //return; 
}

if(isSpectator){ return }
	switch(event.key){
		case "a":
		socket.emit('moveX', {release: true, positive: false})
		break;
		case "d":
		socket.emit('moveX', {release: true, positive: false})
		break;
		default:
		break;
	}


	event.preventDefault();
}, true);



	function update(delta){
		//verbose('logging')
	}


	function draw(){

    	//redrawing 
    	context.fillStyle="#000000"; //prompting for a new paint over
		//coloring backgrounds
		context.fillRect(0,0,canvas.width,canvas.height)

		if(paddleTop == null || paddleBottom == null || ball == null || score == null){ return }


		//drawing paddles
		context.fillStyle="#FFFFFF"; //prompting for a new paint over
		context.fillRect(paddleTop.x,paddleTop.y, paddleWidth, paddleHeight)
		context.fillRect(paddleBottom.x,paddleBottom.y, paddleWidth, paddleHeight)
		context.beginPath();
		context.arc(ball.x, ball.y, ballRaidus, 0, 2 * Math.PI);
		context.fill();


		//drawing score
		context.font = "26px Comic Sans MS";
		context.fillText(score.top + "           " + score.bottom,canvas.width*.42,canvas.height/2);	
	}


	function startClient(){
		if(!isSpectator){
			var r = confirm("Do you want to join game");
			if(r){
				socket.emit('new user', "")
			}

		}
    	//initializing
      	MainLoop.setUpdate(update).setDraw(draw).start(); //load mainloop
      }



    //MISC FUNCITONS
    function verbose(args){
    	console.log(args)
    }

}