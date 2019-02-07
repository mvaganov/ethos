
var convertPrefilled = function(prefilledResponseURL, optionalerrorlist) {
  var expectedPrefix = "https://docs.google.com/forms/d/e/";
  if(!prefilledResponseURL.startsWith(expectedPrefix)) {
    if(optionalerrorlist){
      optionalerrorlist.push(
      "Prefilled Response URL does not conform to expected standard."+
      " Expected to start with \""+expectedPrefix+"\".\n\nPlease make"+
      " sure anyone can access the Google form, and that there are no"+
      " restrictions on how many submissions can be made.");
    }
    return null;
  }
  var startIdx = expectedPrefix.length;
  var endIdx = prefilledResponseURL.indexOf("/",startIdx);
  var uniqueID = prefilledResponseURL.substring(startIdx, endIdx);
  if(uniqueID == null || uniqueID == ""){
    if(optionalerrorlist){
      optionalerrorlist.push(
        "Prefilled Response URL must contain a unique ID for a google"+
        " form");
    }
    return null;
  }
  endIdx = prefilledResponseURL.indexOf("?",endIdx);
  var tokens = [];
  while(endIdx < prefilledResponseURL.length && endIdx >= 0){
    startIdx = endIdx+1;
    endIdx = prefilledResponseURL.indexOf("&",startIdx);
    if(endIdx < 0){
      endIdx = prefilledResponseURL.length;
    }
    var entryEnd = prefilledResponseURL.indexOf("=",startIdx);
    if(entryEnd > endIdx || entryEnd < 0){
      entryEnd = endIdx;
    }
    var token = prefilledResponseURL.substring(startIdx, entryEnd);
    tokens.push(token);
  }
//  console.log(tokens);
  if(tokens.length < 8){
    if(optionalerrorlist){
      optionalerrorlist.push(
        "The Google Form needs to have at least 8 short-answer (text)"+
        " questions at the beginning.");
    }
    return null;
  }
  var result = {id:uniqueID, tokens:tokens};
//  console.log([result]);
  return result;
};

var errorUI = function(objectOfInterest, text, duration){
  pulse(objectOfInterest, 3, 1000);
  validationPopup(objectOfInterest, text, duration);
}

var urlToEvaluation = function(state){
  if(!state.evaluated) {
    errorUI(ByID(STATE_PREFIX+"evaluated"),
      "Please enter your name", 3000);
    return null;
  }
  if(!state.projectName) {
    errorUI(ByID(STATE_PREFIX+"projectName"),
      "Please enter a project name", 3000);
    return null;
  }
//  if(!state.gform) {
//    errorUI(ByID(STATE_PREFIX+"gform"),
//      "Please enter a Pre-Filled Google Form URL.\n\n"+
//      "TODO supply instructions on how to get this...", 8000);
//    return null;
//  }
  if(state.gform) {
    var errorlist = [];
    state.gform = convertPrefilled(state.gform, errorlist, 8);
    if(!state.gform){
      errorUI(ByID(STATE_PREFIX+"gform"), errorlist[0], 8000);
      return null;
    }
  }
  //var json = JSON.stringify(state);
  var encoded = getSaveStateURL(state);//encodeURIComponent(json);
  return "eval.html"+"#"+encoded;
}

var moveElementFromAtoB = function(Element, index, A, B){
  if(A && B) {
    A.splice(index,1);
    B.push(Element);
  }
};

var ensureCategoryOrder = function(categories, scope){
  for(c in categories){
    var list = categories[c];
    for(var i=list.length-1;i>=0;--i){
      var entry = list[i];
      if(entry && entry[2].indexOf(scope.categoryListing[c]) < 0){
        var trueListIndex = -1;// = scope.categoryListing.indexOf(entry[3]);
        for(var d=0;d<categories.length;++d){
          trueListIndex = scope.categoryListing.indexOf(entry[2][d]);
          if(trueListIndex >= 0){ break; }
        }
      //  console.log(entry[3],"-----",trueListIndex, entry[2],scope.categoryListing);
      //  console.log(entry," does not belong in",scope.categoryListing[c],".... it belongs in",categories[trueListIndex],trueListIndex);
        moveElementFromAtoB(entry,i,list,categories[trueListIndex])
      }
    }
  }
};

var randomizedQualities = function(scope){
  // put all current qualities back
  for(var i=scope.choices.length-1;i>=0;--i){
    var entry = scope.choices[i];

    var trueListIndex = scope.categoryListing.indexOf(entry[3]);
    moveElementFromAtoB(entry,i,scope.choices,scope.categorized[trueListIndex])
  }
  // pick one at random from each category
  for(c in scope.categorized){
    var cat = scope.categorized[c];
    if(cat.length > 0){
      var randomIndex = Math.floor(Math.random()*cat.length);
      var entry = cat[randomIndex];
      moveElementFromAtoB(entry,randomIndex,cat,scope.choices);
    }
  }
};

var isDemoing = false;
var dragTutorial = function() {
  if(isDemoing || ByID("userChoices").children.length > 0) return;
  isDemoing = true;
  var hand = ByID("hand");
  var s = hand.style;
    s.left="0px";
    s.top="-100px";
    s.width="1000px";
    s.height="1000px";
    s.display="inline";
    s.opacity=0;
  var buttonStartTop = 149, buttonStartHeight=109;
  var demotag = ByID("demotag");
    s = demotag.style;
    s.left="619px";
    s.top=buttonStartTop+"px";
    s.width="241px";
    s.height="109px";
    s.opacity=
    s.display="inline";
  rectLerp(hand,{left:600,top:200,right:1000,bottom:600},.9,1000,40,function(){
      //left:619px;top:49px;width:241px;height:109px;
      var dragTime = 1000;
      setTimeout(function(){
          rectLerp(hand,{left:0,top:250,right:400,bottom:600},.9,dragTime,40,null);
          rectLerp(demotag,{left:19,top:199,right:260,bottom:308},1,dragTime,40,function(){
            rectLerp(demotag,{left:19,top:230,right:447,bottom:308},1,200,40,function(){
              rectLerp(hand,{left:-400,top:100,right:1000,bottom:1500},0,400,40,function(){
                rectLerp(demotag,{left:19,top:230,right:447,bottom:308},0,200,40,function(){
                  hand.style.display="none";
                  demotag.style.display="none";
                  isDemoing = false;
                });
              });
            });
          });
          //left:619px;top:49px;width:241px;height:119px;
        }, 500);
      rectLerp(demotag,{left:619,top:buttonStartTop,right:630,bottom:buttonStartTop+buttonStartHeight},1,400,40,null);
  });
};

var toggleDetails = function(src) {
  var menu=ByID('details').style;
  menu.display = (menu.display!='none')?'none':'inline';
}

var listOfCategories = function(entries, initial_list){
  var results = initial_list;
  if(!results){results=[];}
  for(var i=0;i<entries.length;++i){
    for(var c=0;c<entries[i][2].length;++c){
      var cat = entries[i][2][c];
      if(results.indexOf(cat) < 0){
        results.push(cat);
      }
    }
  }
  return results;
};
var removed = function(needles,haystack){
  var copy = [];
  for(i=0;i<haystack.length;++i) {
    if(needles.indexOf(haystack[i]) < 0) {
      copy.push(haystack[i]);
    }
  }
  return copy;
};

var usedCategories = [];

var resetOptions = function(scope, categoryListing, usedCategories){
//  console.log("resetting... ",usedCategories);
    scope.categorized = categorizeValuesBy(scope.validValues,categoryListing, usedCategories);
    // what the user has chosen so far
    scope.choices = [];
    ensureCategoryOrder(scope.categorized, scope);
  //  document.open();
//    document.close();
    //document.write();
//    console.log([scope]);
    existingUI = ByID("THEMAINLIST");
    if(existingUI){
      scope.$digest();
    }
};
var SCOPE;
var doresetoptions;
var __oneOfTheCheckboxes = [];

var docheckbox = function(cbx){
//  console.log([cbx]+cbx.name);
  if(cbx.type === 'checkbox'){
    var whichCategoryGroup = parseInt(cbx.name,10);
    var listing = usedCategories[whichCategoryGroup];
    var v = cbx.value;
//    console.log(whichCategoryGroup, usedCategories);
    if(cbx.checked && listing.indexOf(v) < 0){
        listing.push(v);
    } else if (listing.indexOf(v) >= 0){
      usedCategories[whichCategoryGroup] = removed([v],listing);
    }
    // find all the checkboxes with the same name and value and make sure they share the same checked state
    for(var i = 0; i < __oneOfTheCheckboxes.length; ++i) {
      var o = __oneOfTheCheckboxes[i];
      if(o.type === 'checkbox' && o.name == cbx.name && o.value == cbx.value) {
        o.checked = cbx.checked;
      }
    }
  } else if(cbx.type === 'radio') {
    var idx = parseInt(cbx.value,10);
//    console.log("doing radio "+cbx.name+" "+idx+" "+SCOPE.allCategoryListing[idx]);
    SCOPE.categoryListing = SCOPE.allCategoryListing[idx];
  }
//  console.log(usedCategories);
  doresetoptions();
};

var generateCategoryChooser = function(scope, nameOfChooserDiv="categoryoptions",categoriesToList = undefined) {
  var div = ByID(nameOfChooserDiv);
  if(categoriesToList == undefined) {
    categoriesToList = scope.allCategoryListing;
  }
  var innerhtml = "<form>";
  var includeRadioButtonForSort = false;
  var countSortTypes = 0;
  for(var c=0;c<categoriesToList.length;++c) {
    if(categoriesToList[c].length > 0) {
      countSortTypes++;
      if(countSortTypes > 1) {
        includeRadioButtonForSort = true;
      }
    }
  }
  for(var c=0;c<categoriesToList.length;++c) {
    if(categoriesToList[c].length > 0) {
      if(c > 0) innerhtml += "<br>\n";
      if(includeRadioButtonForSort) {
        innerhtml += "[";
        innerhtml += "<input type='radio' value=\""+c+"\" name=categories";
        if(categoriesToList[c] == scope.categoryListing) { innerhtml += " checked"; }
        innerhtml += " onclick=\"docheckbox(this)\"></input>";
        innerhtml += "] ";
      }
      for(var i=0;i<categoriesToList[c].length;++i){
        var cat = categoriesToList[c][i];
        var checked = scope.categories[c].indexOf(cat) >= 0;
        innerhtml += "<input type='checkbox' value='"+cat+"' name="+c;
        if(checked){ innerhtml += " checked"; }
        innerhtml += " onclick=\"docheckbox(this)\">"+cat+"</input> ";
      }
    }
  }
  innerhtml += "</form>";
  div.innerHTML = innerhtml;
  // remember the checkboxes, so they can update each other correctly
  var objects = div.childNodes[0].childNodes;
  for(var i = 0; i < objects.length; ++i) {
    var o = objects[i];
    if(o.type && (o.type === 'checkbox' || o.type === 'radio')) {
      __oneOfTheCheckboxes.push(o);
    }
  }
};

var toggleDetailedCategories = function (scope, button) {
  scope.showC= (scope.showC=='')?'none':'';
  scope.$digest();
  button.value=(SCOPE.showC=='')?'Hide [Category Options]':'[Category Options]';
  D=ByID('categoryoptions');
  D.style.display=(D.style.display)?'':'none';
  E=ByID('fastcategoryoptions');
  E.style.display=(D.style.display)?'':'none';
}

angular.module('valueResolution', ['ng-sortable', 'ngSanitize'])
  .controller('valuesController', ['$scope', '$sce', function ($scope) {
    SCOPE = $scope;
    $scope.opts = {
      group: 'students',
      animation: 150,
//      onAdd: function (evt){ console.log('onAdd:', [evt]); },
//      onUpdate: function (evt){ console.log('onUpdate:', [evt]); },
//      onRemove: function (evt){ console.log('onRemove:', [evt]); },
//      onStart:function(evt){ console.log('onStart:', [evt]);},
//      onSort:function(evt){ console.log('onStart:', [evt]);},
      onEnd: function(evt){
        ensureCategoryOrder($scope.categorized, $scope);
      }
    };
    doresetoptions = function(){ resetOptions($scope,$scope.categoryListing,$scope.categories); }
    $scope.sugD='none';
    $scope.iconForListing = iconForListing;
    $scope.iconsForListing = iconsForListing;
    $scope.hex2hsl = hex2hsl;
    // all of the vlaues
    $scope.allValues = qualityValues;//filterOutQualities(qualityValues,["tier2"]);
    // add color field to qualityValues
    for(var i = 0; i < qualityValues.length; ++i) {
      var qualityColor = colorForListing($scope, qualityValues[i][2]);
      qualityValues[i].push(qualityColor);
    }
    // filtered values (default to all of them shown)
    $scope.validValues = $scope.allValues;
    // all of the categories of the values, organized by category grouping
    $scope.allCategoryListing = allCategoryListing;
    $scope.fastCategoryListing = fastCategoryListing;
    // which category to list the values by, including the order
    $scope.categoryListing = $scope.allCategoryListing[0];
    $scope.categories = defaultCategoryListing; //clone(allCategoryListing);
    resetOptions($scope,$scope.categoryListing,$scope.categories);
    usedCategories = $scope.categories;
    var colorCat = {};
    for(var i in DB_valueCategory) {
      colorCat[i] = DB_valueCategory[i].color;
    }
    $scope.colorOfCategory = colorCat;
    //console.log($scope.colorOfCategory);

    // make a clean place to save the state, which can be easily serialized into the URL
    // load data from the URL, possibly overwriting default categories
    $scope.state = loadState();
    generateCategoryChooser($scope, "categoryoptions", $scope.allCategoryListing);
    generateCategoryChooser($scope, "fastcategoryoptions", $scope.fastCategoryListing);
    generateStylesForCategories();
    if($scope.state) {
      var state = $scope.state;
      // if there are categories or choices from the loaded state, use those.
      if(state.categorized){ $scope.categorized = state.categorized; }
      if(state.choices){ $scope.choices = state.choices; }
    } else {
      $scope.state = {};
    }
    // add a category marker to each grouped category
    if($scope.categorized){
      for(k in $scope.categorized){
        var list = $scope.categorized[k];
        for(var i=0;i<list.length;++i){
          entry = list[i];
          if(entry.length < 2){ console.log("entries need positive and negative text, and categories!");}
          if(entry.length < 4){
            entry.push($scope.categoryListing[k]);
          }
        }
      }
    }
    // Save JSON to queryString
    $scope.save = function () {
      $scope.state.categorized = $scope.categorized;
      $scope.state.choices = $scope.choices;
      console.log([$scope.state]);
      saveState($scope.state);
    };
    $scope.doEvaluation = function () {
      // give the state the most updated values, including user choices
      writeFieldsIntoState($scope.state);
      $scope.state.choices = $scope.choices;
      // but don't include ALL the categories, the choices alone will be sufficient.
      delete $scope.state.categorized;
      var nextLoc = urlToEvaluation($scope.state);
      if(nextLoc){
        ByID("evalLinkArea").style.display="";
        var evallink = ByID("evalLink");
        var url = ""+window.location;
        url = url.substring(0, url.lastIndexOf("/") + 1);
        evallink.value = url+nextLoc;
        evallink.focus();
        evalLink.select();
        ByID("evalLinkButton").onclick = function(){
          window.location.href = nextLoc;
        }
      }
    };
    $scope.randomizedQ = function(){
      randomizedQualities($scope);
    };
    dragTutorial();
//    console.log(window.location);
    //validationPopup(ByID("userChoice"), "Drag elemets from the right into the white box",10000);
  }]);

var suggestEdit = function(button){
  var sugP = false;
  var sugN = false;
  var sugC = false;
//  console.log("suggest edit for",button.name);
  button.style.display = 'none';
  var coord = JSON.parse(button.name);
  var pn = button.parentNode;
//  console.log([coord]);
//  console.log([SCOPE.categorized[coord[0]][coord[1]]]);
  // TODO make this more modular, so other things can be 
  // commented on, or more general feedback can be given
  // with the same mechanism.
  var data = SCOPE.categorized[coord[0]][coord[1]];
  var numcols = 16;
  var numrows = 3;
  var positive = document.createElement('textarea');
  positive.placeholder = "alternate positive text...";
  positive.rows=numrows;
  positive.cols=numcols;
  positive.value = data[0];
  positive.oninput=function(){sugP=true;}
  var negative = document.createElement('textarea');
  negative.placeholder = "alternate negative text...";
  negative.rows=numrows;
  negative.cols=numcols;
  negative.value = data[1];
  negative.oninput=function(){sugN=true;}
  var comment = document.createElement('textarea');
  comment.placeholder = "other comments...";
  comment.rows=2;
  comment.cols=negative.cols*2;
  comment.oninput=function(){sugC=true;}
  var author = document.createElement('input');
  author.placeholder = "your e-mail address...";
  var suggest = document.createElement('input');
  var cancel = document.createElement('input');
  suggest.type = 'button';
  cancel.type = 'button';
  suggest.value="Make Suggestion";
  cancel.value="Nevermind"
  var linebreak0 = document.createElement('br');
  var linebreak1 = document.createElement('br');
  var linebreak2 = document.createElement('br');
  var newUI = [
    author,linebreak0,
    positive,negative,linebreak1,
    comment,linebreak2,
    suggest,cancel
  ];
  var removeEditUI = function(){
    for(var i=0;i<newUI.length;++i){
      pn.removeChild(newUI[i]);
    }
    button.style.display='';
  } 
  suggest.onclick = function(){
    if(author.value && (sugP || sugN || sugC)){
      var info = "";
      if(sugP) info += "P";
      if(sugN) info += "N";
      if(sugC) info += "C";
      button.disabled=true;
      button.value="Thank you for your feedback!";
      sendEditSuggestion(data,
        positive.value,negative.value,comment.value,author.value,info);
      removeEditUI();
    } else {
      if(!author.value) errorUI(author,"Please include your e-mail address!", 3000);
      else {
        errorUI(suggest,"Please make an actual suggestion!", 3000);
      }
    }
  };
  cancel.onclick = function(){removeEditUI();};
  for(var i=0;i<newUI.length;++i){
    pn.appendChild(newUI[i]);
  }
}

var sendEditSuggestion = function(entry, newpos, newneg, comment, author, info){
  var gform = {
  //https://docs.google.com/forms/d/e/
    // id: "1hCZWiPQfjtch8MCB-UNT2LH8zaauOLziF2xOWnqFhUk", // mvaganov@shschools.org
    // tokens:["entry.814950460","entry.1237083921","entry.2073350883",
    // "entry.1376135293","entry.1711808146","entry.973987883","entry.1850534778",
    // "entry.1279235413","entry.856284048"]
    id: "1FAIpQLSczAuwPF-WjKHwpGvHn8M8f_WnOpu1iVixOqQhDE1zUI3GgMA", // michael.vaganov@gmail.com
    tokens:["entry.948797990", "entry.1719623574","entry.1127778923",
    "entry.494616863","entry.52833480","entry.2049913893","entry.1097716330",
    "entry.2064015176","entry.427225244"]
  };
  var answer = gform.tokens;
  var formID = gform.id;
  var submissionType="formResponse";// submit=formResponse, prefilled=viewform
  var postOrigin = "https://docs.google.com/"
  var submitHead = postOrigin+"forms/d/e/"+formID+"/"+submissionType+"?";
  var submitBody =
    answer[0]+"=suggest"+info+"&"+ // 
    answer[1]+"="+encodeURIComponent(author)+"&"+ // who's idea is it?
    answer[2]+"="+encodeURIComponent(cleanListing(entry[2]))+"&"+ // categories
    answer[3]+"="+encodeURIComponent(comment)+"&"+ // comment for discussion
    answer[4]+"="+encodeURIComponent(entry[0])+"&"+ // positive text
    answer[5]+"="+encodeURIComponent(entry[1])+"&"+ // negative text
    answer[6]+"="+encodeURIComponent(newpos)+"&"+ // adjusted positive
    answer[7]+"="+encodeURIComponent(newneg)+"&output=embed"; // adjusted negative
  var sendSuggestion = submitHead+submitBody;
  console.log(sendSuggestion);
  // sneaky iframe post
  var iframe = document.createElement('iframe');
  iframe.style.display = "none";
  iframe.src = sendSuggestion;
  document.body.appendChild(iframe);
};
