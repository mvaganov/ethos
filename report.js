
// when this button is selected, choose its radiobutton and make it more visible
var sel = function(button) {
  // look for the radio button child
  var radbtn = null;
  for(var i=0;i<button.childNodes.length;++i){
    var e=button.childNodes[i];
    // if there is a non-hidden radiobutton
    if(e.type === "radio" && e.style.visibility != "hidden") {
      radbtn = e;
      // check the radiobutton element
      e.checked = true;
      // and clear opacity of all sibling elements, then set this one to max
      var iter = button;
      while(iter.previousSibling) {iter = iter.previousSibling;}
      while (iter = iter.nextSibling) {if(iter.style) {iter.style.opacity = "";}}
      button.style.opacity = 1;
      // this should only need to happen once.
      break;
    }
  }
  //<div id="vis{{$index}}" style="position:absolute;opacity:0.25;"><span ng-bind-html="iconsForListing(this,text[2])"></span></div>
  // if there was a previous selection for this pair made, remove the icons
  var g = ByID("vis"+e.name);
  if(g) { g.remove(); }
  // add icons onto the currently selected radio button option.
  g = document.createElement("div");
  button.insertBefore(g, button.firstChild);
  g.id = "vis"+e.name;
  g.style.position = 'absolute';
  // g.style["border-style"] = 'solid';
  // g.style.width = '200px';
  // g.style['text-align'] = 'center';
  // g.style.height = '20px';
  g.style.opacity = 0.25;
  console.log(button);
  var params = eval(button.getAttribute("data-attributes"));
  console.log(params);
  g.innerHTML = iconsForListing(null,params);
  console.log(g.innerHTML);
  console.log(g.parentNode == button);
  console.log("("+button.width+", "+button.height+")"+button.getBoundingClientRect()+"    ("+g.width+","+g.height+")");
  // setTimeout(function() {
  //   console.log(button.getBoundingClientRect());
  //   console.log(g.getBoundingClientRect());
  // },1000);
  // CenterInParent(g);
  //<span ng-bind-html="iconsForListing(this,text[2])"></span>
  // setTimeout(function(){
  //   g.style.left = "50%";
  //   g.style.top = "50%";
  //   g.style.transform = 'translate(-50%, -50%)';
  // },50);
}

function CenterInParent(obj) {
  var mrect = obj.getBoundingClientRect();
  var prect = obj.parentNode.getBoundingClientRect();
  if(mrect.width <= 0 || mrect.height <= 0
  || prect.width <= 0 || prect.width <= 0) {
    console.log("WAITING");
    setTimeout(function(){CenterInParent(obj);},1);
  } else {
    console.log(obj.style);
    var deltaw = prect.width - mrect.width;
    var deltah = prect.height - mrect.height;
    // obj.style.position = 'floating';
    obj.style.x = 0;//mrect.x + deltaw/2;
    obj.style.y = 0;//mrect.y + deltah/2;
    console.log(obj.style);
    obj.style.display = 'none';
    setTimeout(function(){
      obj.style.display = 'block';
    },50);
    // obj.style["margin-left"] = deltaw/2;
    // obj.style["margin-top"] = deltah/2;
  }
}

// user {
//    gid:"#string",
//    vid:"#string"
// }
// eval {
//    project:"name", 
//    forwho: "#string",
//    bywho:"#string",
//    when:"timestamp",
//    data:"json" // including quality IDs
// }
// quality { 
//    modified:"unixtime",
//    process:"initiative^planning^work^test^judgement^achievement",
//    trait:"growth^understanding^empathy^leadership^craft",
//    tier:"obvious^intentional^inspired",
//    data:"json"
// }
// choiceset {
//    modified:"unixtime",
//    data:"json"
// }

// gets the value from radiobutton group N
var radioButtonValue = function(N) {
  for(var i=0;i<5;++i){
    var radButton = document.getElementById("r"+N+i);
    if(radButton && radButton.checked) { return radButton.value; }
  }
  return "0";
};

// browsers wont send a POST to another domain, but this can get the job done
var sneakyIFramePost = function(url){
  var iframe = document.createElement('iframe');
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
};

// hides all of the radio buttons (to prevent changing values)
var hideRadioButtons = function(state){
  if(state && state.choices){
    for(var i=0;i<state.choices.length;++i){
      for(var n=0;n<5;++n){
        var radButton = document.getElementById("r"+i+n);
        if(radButton != null){
          radButton.style.visibility = "hidden";
        }
      }
    }
  }
}
var generateSubmissionCalls = function(state, gform){
  var answer = gform.tokens;
  var formID = gform.id;
  var submissionType="formResponse";// submit=formResponse, prefilled=viewform
  var postOrigin = "https://docs.google.com/"
  var submitHead = postOrigin+"forms/d/"+formID+"/"+submissionType+"?";
  var submissions = [];
  if(state && state.choices){
    for(var i=0;i<state.choices.length;++i){
      var submitBody =
        answer[0]+"="+i+"&"+ // question ID on the form
        answer[1]+"="+state.projectName+"&"+ // project name
        answer[2]+"="+encodeURIComponent(cleanListing(state.choices[i][2]))+"&"+ // categories
        answer[3]+"="+encodeURIComponent(radioButtonValue(i))+"&"+ // score
        answer[4]+"="+encodeURIComponent(state.choices[i][0])+"&"+ // positive text
        answer[5]+"="+encodeURIComponent(state.choices[i][1])+"&"+ // negative text
        answer[6]+"="+state.evaluated+"&"+ // evaluated name
        answer[7]+"="+state.evaluator; // evaluator name
      submissions.push(submitHead+submitBody);
    }
  } else {
    console.warn("nothing to send");
  }
  return submissions;
}

var rootGForm = {
//https://docs.google.com/forms/d/
  id: "1hCZWiPQfjtch8MCB-UNT2LH8zaauOLziF2xOWnqFhUk",
  tokens:["entry.814950460","entry.1237083921","entry.2073350883",
  "entry.1376135293","entry.1711808146","entry.973987883","entry.1850534778",
  "entry.1279235413","entry.856284048"]
};
// @returns true if everything was submitted correctly
var submitGForm = function(state){
  // load data from fields for the last time, before making the final submission
  writeFieldsIntoState(state);
  // get the list of google forms to submit to
  var gformList = [];
  var userGform = ByID("gform").value;
  if(userGform) {
    var errorlist = [];
    userGform = convertPrefilled(userGform, errorlist, 8);
    if(userGform){
      gformList.push(userGform);
    } else {
      errorUI(ByID("gform"), errorlist[0], 8000);
      return false;
    }
  }
  if(state){
    if(state.gform && state.gform.id){ gformList.push(state.gform); }
    if(rootGForm.id){ gformList.push(rootGForm); }
  }
  // remove duplicates
  for(var n=0;n<gformList.length;++n){
    if(gformList[i]){
      var needle = gformList[i].id;
      for(var h=n+1;h<gformList.length;++h){
        if(gformList[h].id == needle){
          gformList.splice(h,1);
          h--;
        }
      }
    }
  }
  // make the submissions
  var calls = [];
  //if(state.gform && state.gform.id){ calls.push.apply(calls, generateSubmissionCalls(state, state.gform)); }
  //if(rootGForm.id != state.gform.id){calls.push.apply(calls, generateSubmissionCalls(state, rootGForm)); }
  for(var i=0;i<gformList.length;++i){
    // add the list of submission calls for each form into the master list of calls
    calls.push.apply(calls, generateSubmissionCalls(state, gformList[i]));
  }
  for(var i=0;i<calls.length;++i){
    sneakyIFramePost(calls[i]);
  }
  // disable the form
  hideRadioButtons(state);
  var submitButton = document.getElementById(SUBMIT_ID);
  submitButton.value = "Thank you for your feedback!";
  submitButton.innerHTML = submitButton.value;
  submitButton.disabled = true;
  return true;
};

angular.module('evaluate', ['ng-sortable', 'ngSanitize'])
  .controller('evalController', ['$scope', '$sce', function ($scope) {
    $scope.state = loadState();
    //console.log($scope.state);
    //var list = $scope.state.choices;
    $scope.iconsForListing = iconsForListing;
    $scope.submit = function () {
      var raterName = ByID("STATE_evaluator");
      if(!raterName.value){
        pulse(raterName, 3, 1000);
        validationPopup(raterName, "Please enter a name!", 3000);
      } else {
        submitGForm($scope.state);
      }
    };
  }]);

setTimeout(function(){
  var randomSubject = chance.character()
  ByID("testData").innerHTML = JSON.stringify(randomSubject);
}, 100);