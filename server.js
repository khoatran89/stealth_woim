var express = require('express');
var request = require('request');
var swig = require('swig');
var app = express();

var RG_LIST_URL = /name="flashvars" value=".*?(http:\/\/.*?)"/
var RG_ALL_TRACKS = /location="(http:\/\/.*?)">(.*?)<\/track>/g
var RG_WOIM_MELODY = /nhac_hieu\.mp3/


app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.set('view cache', false);
swig.setDefaults({ cache: false });

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/getTracks', function(req, res){
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

app.use('/static', express.static(__dirname + '/static'));

app.listen(3000);