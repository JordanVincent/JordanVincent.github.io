$(document).ready(function(){

  $('#login form').submit(function(){
    var email = $('#input-email').val();
    var password = $('#input-password').val();

    // email = 'coding_project@cogniac.co';
    // password = 'CogniacProject123';

    var cogniac = new CogniacApi(email,password);

    hideLoginPage();
    displayDetectionPage(cogniac);
    return false;
  });

  var hideLoginPage = function(argument) {
    $('#login').hide();
  };

  var displayDetectionPage = function (cogniac) {
    $('#detections-page').show();
    $('#loading').show();
    cogniac.api('getDetections', 100, function(detections){
      $('#loading').hide();
      console.log(detections);

      detections.sort(function(a, b){
        return b.detected_at - a.detected_at;
      });

      detections.forEach(function(detection){
        console.log(detection.confidence);
        displayDetection(detection, cogniac);
      });
    });
  };

  var getConfidence = function (detection){
    var confidence = 'low';
    if (detection.confidence >= 0.90){
      confidence = 'high';
    } else if (detection.confidence > 0.75){
      confidence = 'medium';
    }
    return confidence;
  };

  var getTag = function (detection){
    var tag = detection.subject_tag;
    return tag;
  };

  var displayDetection = function (detection, cogniac){
    cogniac.api('getMedia', detection.source_media.media_id, function(media){

      html = '<div class="detection" style="background-image: none;">' +
        '<span class="helper"></span>' +
        '<img src="data:image/jpeg;base64,' + media  + '"/>' +
        '<div class="meta ' + getConfidence(detection) + '">' + getTag(detection) + '</div>'
       '</div>';
      $('#detections-list').append(html);
    });
  };

});