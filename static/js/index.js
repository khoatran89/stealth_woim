var audioPlayer;
var audioTracks;
var currentTrack;
var albums;

$(document).ready(function() {
  var socket = io.connect();
  socket.on('message', function(data) {
    var suffix = data.count > 1 ? ' users' : ' user';
    $('#user-viewing').text(data.count + suffix);
  });
  
  audiojs.events.ready(function() {
    var as = audiojs.createAll({
      trackEnded: function() {
        playNextTrack();
      }
    });
    audioPlayer = as[0];
  });
  
  fetchRandomAlbums();
});

function fetchRandomAlbums() {
  $.get('/getRandomAlbums', function(data) {
    albums = data;
    $('#random-albums').html(
      new EJS({ url: '/static/templates/albums.ejs' }).render({
        albums: albums
      })
    );
    $('.album').click(function() {
      loadAlbum($(this).attr('data-url'));
      $('.album').removeClass('playing');
      $(this).addClass('playing');
    });
  });
}

function loadAlbum(url) {
  var encodedUrl = encodeURIComponent(url);
  $.post('/getTracks?url=' + encodedUrl, function(data) {
      audioTracks = data;
      html = new EJS({ url: '/static/templates/track_list.ejs' }).render({
        tracks: audioTracks
      });
      $('#track-list').html(html);
      
      $('#track-list li').click(function() {
        currentTrack = $('#track-list li').index($(this)) - 1;
        playNextTrack();
      });
      
      currentTrack = -1;
      playNextTrack();
    }
  );
}

function playNextTrack() {
  currentTrack++;
  if (currentTrack >= audioTracks.length) {
    return;
  }
  audioPlayer.load(audioTracks[currentTrack][0]);
  audioPlayer.play();
  $('#track-list li').removeClass('playing').eq(currentTrack).addClass('playing');
}

function submitHandler() {
  var url = $("#album-url").val();
  loadAlbum(url);
  return false;
};