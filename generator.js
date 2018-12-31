angular.module('vote', ['ng-sortable'])
  .controller('voteController', ['$scope', function ($scope) {
    SCOPE = $scope;
    $scope.opts = {
      group: 'choices',
      animation: 150,
    };
    $scope.state = {
      candidates: [
  // ["id0", "text", "http://icon.gif"]
          ["c0", "Choice 0", ""],
          ["c1", "Choice 1", ""],
          ["c2", "Choice 2", ""],
      ],
      choices: [],
    };
    writeFieldsIntoState($scope.state);
    loadState(window.location.href, $scope.state);
    writeStateIntoFields($scope.state);
    // Save JSON to queryString
    $scope.save = function () {
      console.log([$scope.state]);
      saveState($scope.state);
    };
    $scope.submit = function() {
      if($scope.state.id){
        var list = simplifiedListOfListsToList($scope.state.choices);
        var submissionCall = generateSaveURL($scope.state);
        console.log(submissionCall);
        window.location.href = submissionCall;
      } else {
        errorUI(ByID("STATE_id"), "enter an e-mail address");
        // TODO mail results to the given e-mail address
      }
    };
    $scope.refresh = function(){
      console.log([$scope.state]);
    };
    $scope.submit = function() {
      var errorlist = [];
      $scope.state.gform = convertPrefilled(ByID("gform").value, errorlist);
      if(!$scope.state.gform){
        errorUI(ByID("gform"), errorlist[0]);
        return;
      }
      var extrastate = ByID("extrastate").value;
      if(extrastate){
        try{
          console.log(extrastate);
          var extraStateObject = JSON.parse(extrastate);
        }catch(err){
          console.log([err]);
          return null;
        }
      }
      var submissionState = clone($scope.state);
      copyObjectProperties(extraStateObject, submissionState)
      //for(var k in extraStateObject){
      //  submissionState[k] = extraStateObject[k];
      //}
      var submissionCall = getSaveStateURL(submissionState);
      window.location.href = "vote.html#"+submissionCall;
    };
  }]);
var insertJSON = function(){
  var code = ByID("jsoninsert").value;
  console.log("insert ",[code]);
  if(code) {
    var obj = JSON.parse(code);
    copyObjectProperties(obj, SCOPE.state);
    SCOPE.$digest();
  }
};
var THINGS = function(a){
  console.log("~~~~~");
  console.log(a);
}