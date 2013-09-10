var express = require('express'),
    request = require('request'),
    swig    = require('swig'),
    app     = express(),
    http    = require('http'),
    server  = http.createServer(app),
    socket  = require('socket.io').listen(server);


var RG_LIST_URL = /name="flashvars" value=".*?(http:\/\/.*?)"/,
    RG_ALL_TRACKS = /location="(http:\/\/.*?)">(.*?)<\/track>/g,
    RG_WOIM_MELODY = /nhac_hieu\.mp3/,
    RG_ALBUMS = /href="(http:\/\/www\.woim\.net\/album\/.*?)" title="(.*?)".*?src="(.*?)"/g;

server.listen(3000);

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.set('view cache', false);
swig.setDefaults({ cache: false });

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/getTracks', function(req, res) {
  request.get(req.query.url, function (error, response, body) {
      var listUrl= body.match(RG_LIST_URL)[1];
      request.get(listUrl, function(error, response, body) {
        var tracks = [];
        while ((results = RG_ALL_TRACKS.exec(body)) !== null) {
          if (!results[1].match(RG_WOIM_MELODY)) {
            tracks.push([results[1], results[2]]);
          }
        }
        res.send(tracks);
      });
    }
  );
});

app.get('/getRandomAlbums', function(req, res) {
  request.get('http://www.woim.net/nhac-khong-loi-hay-nhat.html',
    function (error, response, body) {
      var albums = [];
      while ((results = RG_ALBUMS.exec(body)) !== null) {
        albums.push({ url: results[1], title: results[2], thumb: results[3] });
      }
      return res.json(albums);
    }
  );
});

app.use('/static', express.static(__dirname + '/static'));

var count = 0;
socket.on('connection', function(client) {
  count++;
  client.emit('message', { count: count });
  client.broadcast.emit('message', { count: count });
  client.on('disconnect', function() {
    count--;
    client.broadcast.emit('message', { count: count });
  });
});
