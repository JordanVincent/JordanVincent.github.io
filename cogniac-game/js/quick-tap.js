var QuickTap = {
  title: 'Quick-Tap',
  key: 'quickTap',

  description: 'Can you find all Coca-Cola images before they disappear?',
  instructions: 'Tap on the images with the Coca-Cola brand.',

  timeoutID: null,
  currentDetectionIndex: -1,
  corrections: 0,

  roundPeriods: [1500, 1000, 800, 600], // in ms
  totalRounds: 4,
  round: 0,
  lastImageAt: null,

  reset: function () {
    QuickTap.currentDetectionIndex = -1;
    QuickTap.corrections = 0;
    QuickTap.round = 0;

    $('#game-running .image-wrapper').off('click');
    $('#game-running .card .btn-primary').off('click');
    $('#game-running .card .btn-secondary').off('click');

    $('#game-running .image-container .img').css('background-image', 'none');
  },

  start: function (){

    // Tap on image
    $('#game-running .image-wrapper').on('click', function(){
      window.clearTimeout(QuickTap.timeoutID);
      QuickTap.testDetection(true)
    });

    // card buttons
    $('#game-running .card .btn-primary').on('click', function(){
      QuickTap.closeMessage();
      Main.addPoints(500);
      QuickTap.corrections++;
    });

    $('#game-running .card .btn-secondary').on('click', function(){
      QuickTap.closeMessage();
      Main.loseLife();
    });

    Main.displaySection('#game-running');
    QuickTap.nextRound();
  },

  currentDetection: function () {
    return Main.detections[QuickTap.currentDetectionIndex];
  },

  nextDetection: function () {
    QuickTap.currentDetectionIndex++
    if (QuickTap.currentDetectionIndex >= Main.detectionsCount){
      QuickTap.currentDetectionIndex = 0;
    }
    return QuickTap.currentDetection();
  },

  displayImage: function(){
    var detection = QuickTap.nextDetection();
    var src = 'data:image/jpeg;base64,' + detection.source_media.media_data;

    var maxHeight = $('#game-running').height();
    var maxWidth = $('#game-running').width();
    var imgRatio = detection.media_width/detection.media_height;
    var h = 0;
    var w = 0;

    if (imgRatio < maxWidth/maxHeight){
      h = maxHeight;
      w = maxHeight*imgRatio;
    } else {
      h = maxWidth/imgRatio;
      w = maxWidth;
    }

    Main.updateProgress();
    $('#game-running .image-container .img').css({'background-image': ('url("' + src + '")'), 'background-size': (w + 'px ' + h + 'px')});
    $('#game-running .image-container').add('#game-running .image-container .img').css({height: h, width: w});
  },

  nextRound: function () {
    QuickTap.round++;

    var rpm = 60000/QuickTap.roundPeriods[QuickTap.round-1];
    var $popup = $('#game-running .popup').add('#game-running .overlay')

    $('#game-running .popup h1').text('Round ' + QuickTap.round + '/' + QuickTap.totalRounds);
    $('#game-running .popup p').text(rpm + ' RMP');

    $popup.fadeIn();

    $popup.on('click', function(){
      $popup.off('click');
      $popup.fadeOut(400, function () {
        QuickTap.nextImage();
      });
    });
  },

  testDetection: function (isCocaCola) {
    var detection = QuickTap.currentDetection();
    var tag = 'None'

    switch (detection.subject_tag){
      case 'coca_cola':
        tag = 'Coca-Cola';
        break;
      case 'pepsi':
        tag = 'Pepsi';
        break;
      case 'mountain_dew':
        tag = 'Mountain Dew';
        break;
    }

    // Same
    if (isCocaCola == (detection.subject_tag == 'coca_cola')){
      Main.addPoints(QuickTap.getSpeedPoints());
      QuickTap.nextImage();

    // Different
    } else {
      var title = (isCocaCola ? 'Is it a Coca-Cola image?' : 'Is it NOT a Coca-Cola image?')
      var message = 'The system tagged it as <b>' + tag + '</b> with ' + Math.round(detection.confidence*100) + '% confidence.'
      $('#game-running .card h2').text(title);
      $('#game-running .card p').html(message);

      $('#game-running .card .btn-secondary').text(isCocaCola ? 'Other' : 'Coca-Cola');
      $('#game-running .card .btn-primary').text(isCocaCola ? 'Coca-Cola' : 'Other');
      QuickTap.showMessage();
    }
  },

  getSpeedPoints: function () {
    var timeLeft = 1000 - (Date.now() - QuickTap.lastImageAt);
    if (timeLeft < 0) { timeLeft = 0; }

    return 250 + timeLeft;
  },

  nextImage: function () {

    // All images displayed
    if (QuickTap.currentDetectionIndex+1 >= Main.detectionsCount){
      return Main.endGame(true);
    }

    if ((QuickTap.currentDetectionIndex+1) >= (Main.detectionsCount/QuickTap.totalRounds)*QuickTap.round){
      return QuickTap.nextRound();
    }

    QuickTap.displayImage();

    // Set timout
    QuickTap.lastImageAt = Date.now();
    window.clearTimeout(QuickTap.timeoutID);
    QuickTap.timeoutID = window.setTimeout(QuickTap.testDetection, QuickTap.roundPeriods[QuickTap.round-1], false);
  },

  showMessage: function() {
    $('#game-running .card').css('bottom', 0);
    $('#game-running .overlay').fadeIn();
  },

  closeMessage: function (){
    $('#game-running .card').css('bottom', -350);
    $('#game-running .overlay').fadeOut(400, function () {
      QuickTap.nextImage();
    });
  },

  getProgress: function () {
    return (QuickTap.currentDetectionIndex+1)/Main.detectionsCount*100;
  },

  getEndGameDescription: function (won) {
    if (won){
      return '<div class="lives">' + Main.lives + ' lives left</div><div class="corrections">' + QuickTap.corrections + ' corrections</div>';
    } else {
      return '<p>You used all your lives. You are almost there, try again!</p>';
    }
  },

}