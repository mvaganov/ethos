var SCOPE;

var simplifiedListOfListsToList = function(listOfLists) {
  var result = new Array(listOfLists.length);
  for(var i=0;i<listOfLists.length;++i){
    result[i]=listOfLists[i][0];
  }
  return result;
};

var errorUI = function(objectOfInterest, text, duration){
  pulse(objectOfInterest, 3, 1000);
  validationPopup(objectOfInterest, text, duration);
}

var generateSubmissionCall = function(gform, answers){
  var formID = gform.id;
  var answerID = gform.tokens;
  var submissionType="formResponse";// submit=formResponse, prefilled=viewform
  var postOrigin = "https://docs.google.com/"
  var submitHead = postOrigin+"forms/d/"+formID+"/"+submissionType+"?";
  var submitBody = "";
  for(var i=0;i<answers.length;++i){
    if(i > 0){submitBody += "&";}
    var value = answers[i];
    if(typeof value != "string"){
      value = JSON.stringify(value);
    }
    value = encodeURIComponent(value);
    submitBody += answerID[i]+"="+value;
  }
  return (submitHead+submitBody);
}

var moveElementFromAtoB = function(Element, index, A, B){
  A.splice(index,1);
  B.push(Element);
};
var putBackEscapees = function(listOfRestricted, imprisoned, allOthers){
  //$scope.required, $scope.state.choices, [$scope.state.candidates]
  var escapeesDiscovered = 0;
  for(var c=0;c<allOthers.length;++c){
    var inspectedLocation = allOthers[c];
    for(var i=0;i<inspectedLocation.length;++i){
      var interviewee = inspectedLocation[i];
      if(listOfRestricted.indexOf(interviewee) >= 0){
        moveElementFromAtoB(interviewee,i,inspectedLocation,imprisoned);
        --i;
        escapeesDiscovered++;
      }
    }
  }
  return escapeesDiscovered;
};

var shallowArrayCopy = function(arr) {
  var copy = new Array(arr.length); var i=arr.length;
  while(i--){ copy[i]=arr[i]; }
  return copy;
};

angular.module('vote', ['ng-sortable'])
  .controller('voteController', ['$scope', function ($scope) {
    SCOPE = $scope;
    $scope.opts = {
      group: 'choices',
      animation: 150,
      onEnd: function(evt){
        if(putBackEscapees($scope.required, $scope.state.choices, [$scope.state.candidates]) > 0){
          setTimeout(function(){
            var list = ByID("userChoices");
            target = list.children[list.children.length-1];
            console.log("bringing back ",[target])
            errorUI(target, "required.", 2000);
          }, .01);
        }
      }
    };
    $scope.state = state;
    loadState(window.location.href, $scope.state);
    writeStateIntoFields($scope.state);
    $scope.required = shallowArrayCopy($scope.state.choices);
    console.log("state at init: ",[$scope.state]);
    // Save JSON to queryString
    $scope.save = function () {
      console.log([$scope.state]);
      saveState($scope.state);
    };
    $scope.submit = function() {
      var minchoices = $scope.state.minchoices;
      if(minchoices != null && minchoices != undefined){
        var countChoices = $scope.state.choices.length;
        if(countChoices < minchoices){
          var errorMsg = "";
          if(minchoices == $scope.state.candidates.length){
            errorMsg = "You must sort all candidates!";
          } else {
            errorMsg = "You must choose at least "+minchoices+" candidate"+
            ((minchoices>1)?"s":"")+"!";
          }
          errorUI(ByID("userChoices"),errorMsg,5000);
          return;
        }
      }
      saveState($scope.state);
      if($scope.state.id){
        var list = simplifiedListOfListsToList($scope.state.choices);
        var submissionCall = generateSubmissionCall($scope.state.gform, [
          $scope.state.electionID,$scope.state.id,list]);
        console.log(submissionCall);
        window.location.href = submissionCall;
      } else {
        errorUI(ByID("STATE_id"), "enter an e-mail address");
        // TODO mail results to the given e-mail address
      }
    }
//    %22id%22%3A%22nobody%22%2C
    if($scope.state.candidates.length > 0){      
      dragTutorial();
    } else {

    }
  }]);
