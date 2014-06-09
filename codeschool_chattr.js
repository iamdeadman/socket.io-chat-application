var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis=require('redis');
var redisClient=redis.createClient();
http.listen(3000, function(){
  console.log('listening on *:3000');
});
app.use('/js',express.static(__dirname+'/js'));
app.get('/', function(req, res){
	res.sendfile('codeschool_chattr.html');
});
io.on('connection', function(client){
  console.log('a user connected');
  var nick="";
  client.on('join',function(name){
  	client.nickname=name;
  	redisClient.lrange("messages",0,-1,function(err,messages){
  		messages = messages.reverse();
  		messages.forEach(function(message){
  			message = JSON.parse(message);
  			client.emit("chat message",message.name+": "+message.message);
  		});
  	});
  });
  client.on('disconnect', function(){
    console.log('user disconnected');
  });
  client.on('chat message', function(msg){
  	storeMessage(client.nickname,msg);
    io.sockets.emit('chat message', client.nickname+": "+ msg);
  });
});
var storeMessage = function(name,data){
	var message = JSON.stringify({name:name,message:data});
	redisClient.lpush("messages",message,function(err,response){
		redisClient.ltrim("messages",0,10);
	});
}
