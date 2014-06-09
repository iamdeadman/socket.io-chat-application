var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
app.use('/js',express.static(__dirname+'/js'));
app.get('/:file', function(req, res){
	res.set('Content-Type', 'text/html');
	res.sendfile('shrib.html');
});
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('update message', function(msg){
  	var data="";
  	var writeStream = fs.createWriteStream('data/'+msg["fileName"]);
  	writeStream.write(msg["msg"],function(err){
  		if(err) throw err;
		socket.emit('update message', msg["msg"]);
  	});
  });
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});
