
var Main = {
  detections: [],
  detectionsCount: 40,
  detectionsLoaded: 0,

  games: {quickTap: QuickTap, multiTap: MultiTap},
  currentGame: null,

  score: 0,
  lives: 3,
  cogniac: null,

  init: function () {
    Main.displaySection('#game-selection');

    // Cogniac API

    Main.cogniac = new CogniacApi('coding_project@cogniac.co', 'CogniacProject123');

    Main.cogniac.api('getDetections', Main.detectionsCount, function(detections){
      Main.detections = detections;
      detections.forEach(function(detection){
        Main.loadDetection(detection);
      });
    });

    // Click handlers

    $('#game-description .back-btn').click(function(){
      Main.displaySection('#game-selection');
    });

    $('#game-end').click(function() {
      Main.displayGameDescription();
    });

    $('#game-selection .game').click(function() {
      var key = $(this).attr('id');
      Main.selectGame(key);
    });
  },

  reset: function () {
    QuickTap.reset();
    MultiTap.reset();

    Main.resetScore();
    Main.resetLives();
    Main.updateProgress();
  },

  loadDetection: function (detection) {
    Main.cogniac.api('getMedia', detection.source_media.media_id, function(media){
      detection.source_media.media_data = media;
      Main.detectionsLoaded++
      if (Main.detectionsLoaded >= Main.detectionsCount){
        $('#game-description .btn-primary').text('Start');
        $('#game-description .btn-primary').click(function(){
          Main.currentGame.start();
        });
      }

      detection.media_width = detection.subject.subject_width;
      detection.media_height = detection.subject.subject_height;
    });
  },

  displaySection: function(sectionId){
    $('#game-selection').hide();
    $('#game-description').hide();
    $('#game-running').hide();
    $('#game-end').hide();
    $(sectionId).show();
  },

  selectGame: function (key) {
    Main.currentGame = Main.games[key];

    for (gameKey in Main.games) {
      $('.' + gameKey + '-only').hide();
    }

    $('.' + key + '-only').show();

    Main.displayGameDescription();
  },

  addPoints: function (points) {
    Main.score += points;
    $('#game-running .info .score-points').text(Main.formatNumber(Main.score));
    var el = $('<div>+' + Main.formatNumber(points) + '</div>')
    el.hide();
    $('#game-running .info .bonus').prepend(el);
    el.slideDown(200);
    el.fadeOut(2000, function(){
      this.remove();
    })
  },

  loseLife: function(){
    Main.lives--;

    $('#game-running .info .heart:not(.lost)').first().addClass('lost');

    if (Main.lives < 0 ){
      Main.endGame(false);
    }
  },

  resetLives: function(){
    Main.lives = 3;
    $('#game-running .info .heart').removeClass('lost');
  },

  resetScore: function(){
    Main.score = 0;
    $('#game-running .info .score-points').text(0);
  },

  updateProgress: function() {
    var progress = Main.currentGame.getProgress();
    $('#game-running .info .progress-inner').width(progress+'%');
  },

  // Formats big numbers. Ex: 15,598,898
  formatNumber: function (n){
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  // Ends the game.
  endGame: function(won){
    var localStorageKey = Main.currentGame.title;
    var prevBestScore = parseInt(localStorage.getItem(localStorageKey), 10);
    var hasPrevBestScore = !isNaN(prevBestScore);
    var isBestScore = !hasPrevBestScore || prevBestScore <= Main.score;
    var bestScoreText;

    if (isBestScore){
      localStorage.setItem(localStorageKey, Main.score);
      bestScoreText = 'Best Score!';
      if (hasPrevBestScore){
        bestScoreText += ' Prev: '+ Main.formatNumber(prevBestScore)+ ' pts';
      }
    } else {
      bestScoreText = 'Best score: ' + Main.formatNumber(prevBestScore) + ' pts';
    }

    $('#game-end h1').text(won ? 'Good job!' : 'Nice Try!');
    $('#game-end .best-score').text(bestScoreText);
    $('#game-end .score-points').text(Main.formatNumber(Main.score));

    var text = Main.currentGame.getEndGameDescription(won);
    $('#game-end .description').html(text);

    Main.displaySection('#game-end');
  },

  displayGameDescription: function () {
    Main.reset();
    Main.displaySection('#game-description');

    $('#game-description h1').text(Main.currentGame.title);
    $('#game-description .description').text(Main.currentGame.description);
    $('#game-description .instructions').text(Main.currentGame.instructions);
  },
};

$(document).ready(function(){
  Main.init();
});