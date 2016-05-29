var MultiTap = {
  title: 'Multi-Tap',
  key: 'multiTap',

  description: 'Can you find all Coca-Cola images before they disappear off the screen?',
  instructions: 'Select all images with the Coca-Cola brand.',

  imagesFound: 0,
  timeoutID: null,

  reset: function () {
    MultiTap.imagesFound = 0;
    $('#game-running .images-container').html('');
  },

  start: function (){
    Main.displaySection('#game-running');

    var baseSpeed = 1400; // 1 row each 2 seconds
    var topSpeed = 500;

    var size = ($('#game-running .images-container').innerWidth()/2) - 23;

    Main.detections.forEach(function(detection){
      var src = 'data:image/jpeg;base64,' + detection.source_media.media_data;
      var $image = $('<div class="img">');

      $image.css({'background-image': ('url("' + src + '")'), height: size, width: size});

      $image.click(function() {
        if($(this).hasClass('active')){
          MultiTap.imagesFound--;
          Main.addPoints(-500);
          $(this).removeClass('active');
        } else {
          MultiTap.imagesFound++;
          Main.addPoints(500);
          $(this).addClass('active');
        }
      });

      $('#game-running .images-container').prepend($image);
    });

    var h = $('#game-running .images-wrapper').height();
    var th = $('#game-running .images-container').height();
    var duration = (th+h)*(baseSpeed+topSpeed)/size/2;

    $('#game-running .images-container').css({bottom: h});
    window.setTimeout(function(){
      $('#game-running .images-container').css('transition', 'bottom ' + duration + 'ms ease-in');

      window.setTimeout(function(){
        $('#game-running .images-container').css({bottom: -th});
        window.setTimeout(function () {
          $('#game-running .images-container').css('transition', 'none');
          Main.endGame(true);
        }, duration);
      }, 100);
    }, 100);
  },

  getProgress: function () {
    return 0;
  },

  getEndGameDescription: function (won) {
    if (won){
      return '<div class="lives">' + Main.lives + ' lives left</div><div class="corrections">' + MultiTap.imagesFound + ' Coca-Cola images found</div>';
    } else {
      return '<p>You used all your lives. You are almost there, try again!</p>';
    }
  },
}