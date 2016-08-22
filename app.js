
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var photos = require('./routes/photos');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var watch = require('watch');
var common    = require('./routes/common')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/photos' }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var photoDir = "./photos/"
var photoExtensions = ['png', 'jpg', 'gif'];

app.get('/', routes.index);

app.get('/photos', function(req, res){
    var photoList = new photos.list(photoDir, photoExtensions);
    res.json(photoList.list());
});

app.get('/photos/:path', function(req, res){
    res.sendfile(photoDir + '/' + req.param('path'));
});

app.get('/upload', common.imageForm);
app.post('/upload', common.uploadImage);

server = http.createServer(app);

io = io.listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  watch.createMonitor(photoDir, function (monitor) {
    monitor.on("created", function (f, stat) {
        var regex = new RegExp('\.(' + photoExtensions.join('|') + ')$', 'i');
        if (regex.test(f)) {
            socket.emit('newPhoto', { path: f.replace(photoDir, '') });
        }
    })
  });
});
