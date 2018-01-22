
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var app = require('http').createServer();
var io = require('socket.io')(app);
var fs = require('fs');

//在线人员
var onLineUsers = {};
// 在线人数
var onLineCounts = 0;

var randomName = require("chinese-random-name");

app.listen(3000);


io.on('connection', function(socket) {
	
	// 监听新用户加入
    socket.on('join', function(user){
        // 将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = user.id;
        // 检查在线列表，如果不在里面就加入
        if(!onLineUsers.hasOwnProperty(user.id)) {
        	user.nickname = randomName.generate();
            onLineUsers[user.id] = user.nickname;
            // 在线人数+1
            onLineCounts++;
            
            var data = {'type':'text','content':user.nickname+'加入聊天室','user':user};
            socket.emit('reciveJoin',data);
        }
    });
	
    // 接收并处理客户端的事件
    socket.on('sendMsg', function(data,sender) {
        console.log(sender+"发送文字:"+data);
        // 触发客户端事件reciveMsg
        socket.broadcast.emit('reciveMsg',{'type':'text','content':data,'sender':sender});
    });
    
    socket.on('sendImg', function(data,sender) {
        console.log(sender+"发送图片:"+data.length);
        // 触发客户端事件reciveMsg
        socket.broadcast.emit('reciveImg',{'type':'image','content':data,'sender':sender});
    });
    
    socket.on('sendSound', function(data,sender) {
        console.log(sender+"发送语音:"+data.length);
        // 触发客户端事件reciveMsg
        socket.broadcast.emit('reciveSound',{'type':'sound','content':data,'sender':sender});
    });

    // 断开事件
    socket.on('disconnect', function(data) {
    	console.log(onLineUsers);
    	delete onLineUsers[socket.name];
    	console.log(onLineUsers);
        // 在线人数-1
        onLineCounts--;
    });
});

