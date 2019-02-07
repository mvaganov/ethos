var SUBMIT_ID="submit_button";

var STATE_PREFIX = "STATE_";

function strStartsWith (string, prefix) {
  return string.slice(0, prefix.length) == prefix;
}

var ByID = function(element_id) { return document.getElementById(element_id); }

var arrayContains = function(needle, arrhaystack) {
  return (arrhaystack.indexOf(needle) > -1);
}

var cleanListing = function(arr){
  var output = "";
  for(var i=0;i<arr.length;++i){
    if(i>0) { output+=", "; }
    output+=arr[i];
  }
  return output;
};

// get the category ID that is (probably) in a quality being evaluated
var CatOf = function(entry){ return entry[2]; }
//var CatMainOf = function(entry){ return entry[2][0]; }
// check to see if the given entry belongs to the given category
var CatIncludes = function(entry, cat){ return arrayContains(CatOf(entry),cat); }

var writeFieldsIntoState = function(state) {
  if(!state){console.warn("null passed in as state"); return;}
  var allElements = document.getElementsByTagName("*");
  for (var i = 0, n = allElements.length; i < n; ++i) {
    var el = allElements[i];
    if (strStartsWith(el.id, STATE_PREFIX)){
      state[el.id.slice(STATE_PREFIX.length)] = el.value;
    }
  }
}

var writeStateIntoFields = function(state) {
  //console.log([state]);
  for (var key in state) {
    if (state.hasOwnProperty(key)) {
      var el = ByID(STATE_PREFIX+key);
      if(el){
        //console.log("setting "+STATE_PREFIX+key+".value to "+state[key]);
        el.value = state[key];
      }
    }
  }
}

var loadState = function(location, existingStateToWriteInto){
//  console.log("loc "+location);
  if(!location){location = window.location.href; }
  try {
    var query = location.toString().split('#').pop();
    var decoded = decodeURIComponent(query);
    var state = JSON.parse(decoded);
    // if there is compressed data "!" and a key "*"
    console.log([state]);
    if(state["*"] && state["!"]){
      decoded = unfilter(state["*"], state["!"]);
      console.log(decoded);
      state = JSON.parse(decoded);
    }
    writeStateIntoFields(state);
    if(existingStateToWriteInto){
      for(var key in state){
        existingStateToWriteInto[key] = state[key];
      }
    }
    return state;
  } catch (err) { }
  return null;
}

var hasOverlap = function(listA, listB){
  for(var i=0;i<listA.length;++i){
    if(listB.indexOf(listA[i]) >= 0) {
      return true;
    }
  }
  return false;
}

var passesFilter = function(entry, filters){
  for(var f=0;f<filters.length;++f){
    if(!hasOverlap(entry[2], filters[f])){
      return false;
    }
  }
  return true;
};

var categorizeValuesBy = function(values, categoryListing, categoriesAllowed) {
  // copy values into a new array, which will have elements removed to prevent duplication
  var copy = new Array(values.length);
  var i = values.length;
  while(i--) { copy[i] = values[i]; }
  // do the sorting
  var categorized = new Array(categoryListing.length);
  for(i=0;i<categorized.length;++i){categorized[i]=[];}
  var checkedIndex = 0;
  var howManyChecked = 0;
  do{
    howManyChecked = 0;
    for(var cat=0;cat<categoryListing.length;++cat){
      for(var v=0;v<copy.length;++v){
        if(copy[v] != null && copy[v][2].length > checkedIndex) {
          howManyChecked++;
          if(copy[v][2][checkedIndex] == categoryListing[cat]
            //CatIncludes(copy[v], categoryListing[cat])
            ){
            if(categoriesAllowed && passesFilter(copy[v],categoriesAllowed)){
              categorized[cat].push(copy[v]);
            }
            copy[v] = null;
          }
        }
      }
    }
    checkedIndex++;
  } while(howManyChecked > 0);
  return categorized;
};

// markedCategories is an array of strings.
var filterOutQualities = function(values, markedCategories){
  var countValid = 0;
  // count
  for(var c=0;c<markedCategories.length;++c){
    for(var i=0;i<values.length;++i){
      console.log(values[i]);
      if(values[i][2].indexOf(markedCategories[c]) < 0){
        countValid++;
      }
    }
  }
  // create filtered list
  var index=0;
  var filtered = new Array(countValid);
  for(var c=0;c<markedCategories.length;++c){
    for(var i=0;i<values.length;++i){
      if(values[i][2].indexOf(markedCategories[c]) < 0){
        filtered[index] = values[i];
        index++;
      }
    }
  }
  return filtered;
};

var getSaveStateURL = function(state){
  writeFieldsIntoState(state);
  var json = JSON.stringify(state);
  var compress = attemptToCompressURLData(json);
  if(compress){
    var compressor = {
      "!":compress[0], // dictionary
      "*":compress[1], // data
    };
    var containerJSON = JSON.stringify(compressor);
    var finalResult = encodeURIComponent(containerJSON);
    // var b64string = btoa(json);
    // console.log(finalResult.length+" vs "+b64string.length);
    // console.log(finalResult);
    // console.log(b64string);
    return finalResult;
  }else{
    return encodeURIComponent(json);
  }
};

var saveState = function(state){
  location.hash = getSaveStateURL(state);
};

var pulse = function(obj, times, duration){
  var count = 0;
  var delay = 100; //(duration / times) * absOpacityStep;
  var absOpacityStep = delay / (duration / (2*times));//.25;
  obj.style.opacity = 1.0;
  var opacityStep = -absOpacityStep;
  var minOpacity = 1/1024.0;
  var visibility = 1;
  var blinker = function(){
    if(obj.style.opacity <= minOpacity){ opacityStep = absOpacityStep; }
    if(obj.style.opacity >= 1){ opacityStep = -absOpacityStep; }
    visibility += opacityStep;
    obj.style.opacity = visibility;
    count+= (0.5 * absOpacityStep);
    if(count >= times){
      obj.style.opacity = "";
    } else {
      setTimeout(blinker, delay); 
    }
  };
  blinker();
};

var errorUI = function(objectOfInterest, text, duration){
  pulse(objectOfInterest, 3, 1000);
  validationPopup(objectOfInterest, text, duration);
}

var destroyLineage = function(button, parentCount){
    var offender = button;
    for(var i=0;i<parentCount;++i){
      offender = offender.parentNode;
    }
    if(offender.parentNode)
      offender.parentNode.removeChild(offender);
};
function getOffset( el ) {
  var p = el;
  var _x = 0;
  var _y = 0;
  while( p && !isNaN( p.offsetLeft ) && !isNaN( p.offsetTop ) ) {
    _x += p.offsetLeft - p.scrollLeft;
    _y += p.offsetTop - p.scrollTop;
    p = p.offsetParent;
  }
  return { left: _x, top: _y, right:_x+el.clientWidth, bottom:_y+el.clientHeight };
};

var vec_subtract=function(a,b) { return {left:a.left-b.left,top:a.top-b.top};}
var vec_magnitude=function(vec) {  return  Math.sqrt(vec.left*vec.left + vec.top*vec.top); };
var vec_divide  =function(vec, scalar){ return {left:vec.left/scalar,top:vec.top/scalar}; };
var vec_multiply=function(vec, scalar){ return {left:vec.left*scalar,top:vec.top*scalar}; };

// rect must have left/top. if rect does not have right/bottom, it must have width/height
var rectLerp = function(obj, rect, endopacity, duration, fps, donefunction){
  // do math to determine how the object rectangle should interpolate
  var delayBetweenFrames = 1000/fps;
  var o = getOffset(obj);
//  o.right = o.left + obj.clientWidth;
//  o.bottom = o.top + obj.clientWidth;
  var whatToDoWhenFinished = function() {
    if(donefunction){setTimeout(donefunction(), delayBetweenFrames);}
    else {
      obj.style.left = rect.left;
      obj.style.top = rect.top;
      obj.style.right = rect.right;
      obj.style.bottom = rect.bottom;
      obj.style.opacity = endopacity;
    }
  };
  if(delayBetweenFrames < duration){
    var frameCount = duration/delayBetweenFrames;
    var TLd = {left:rect.left-o.left, top:rect.top-o.top};
    var BRd = {left:rect.right-o.right, top:rect.bottom-o.bottom};
//    console.log([rect],[o],TLd, BRd);
    if(TLd.left != 0 || TLd.top != 0 || BRd.left != 0 || BRd.top != 0 || endopacity != startopacity){ 
      var TLmag = vec_magnitude(TLd);
      var TLdir = vec_divide(TLd,TLmag);
      var TLdistEachFrame = TLmag / frameCount;
//      console.log("??",TLmag)
      var TLmoveEachFrame = vec_multiply(TLdir, TLdistEachFrame);
      var BRmag = vec_magnitude(BRd);
      var BRdir = vec_divide(BRd,BRmag);
      var BRdistEachFrame = BRmag / frameCount;
      var BRmoveEachFrame = vec_multiply(BRdir, BRdistEachFrame);
      var iterations = 0;

      var startopacity = obj.style.opacity;
      var diffOp = (endopacity - startopacity);
      var opacityEachFrame = diffOp / frameCount;
//      console.log(endopacity, opacityEachFrame);
      //console.log("-------\n",TLmoveEachFrame, BRmoveEachFrame);
      var lerpMotion= function(){
//        console.log(iterations,o);
        o.left += TLmoveEachFrame.left;
        o.top += TLmoveEachFrame.top;
        o.right += BRmoveEachFrame.left;
        o.bottom += BRmoveEachFrame.top;
        obj.style.left = o.left+"px";
        obj.style.top = o.top+"px";
        obj.style.width = (o.right-o.left)+"px";
        obj.style.height = (o.bottom-o.top)+"px";
        var sum = obj.style.opacity+opacityEachFrame;
        obj.style.opacity = parseFloat(obj.style.opacity)+opacityEachFrame;
//        console.log(obj.style.opacity, " ", sum);
        iterations++;
        if(iterations < frameCount){
          setTimeout(lerpMotion, delayBetweenFrames);
        } else {
          setTimeout(whatToDoWhenFinished, delayBetweenFrames);
        }
      };
      lerpMotion();
    } else {
        setTimeout(whatToDoWhenFinished, duration);
    }
  }
};
var createPopup = function(obj, text, maxWidth){
  // TODO find an easy way to use styles from a stylesheet in code?
  var pup = document.createElement('div');
  var s = pup.style;
  s.borderStyle = "solid";
  s.borderWidth = "1px";
  s.verticalAlign = "top";
  s.backgroundColor = "#fff";
  if(maxWidth){ s.maxWidth = maxWidth+"px"; }
  var rootparent = null;
  if(obj){
    s.position = "absolute";
    s.top = (obj.offsetTop + obj.offsetHeight) + "px";
    s.left = obj.offsetLeft + "px";
    rootparent = obj.parentNode;
    while(rootparent && rootparent.parentNode != document.body
    && rootparent.style.position != "fixed"
    && rootparent.style.overflow != "scroll"){
      rootparent = rootparent.parentNode;
//      console.log([rootparent.style],[rootparent])
    }
  }
//  console.log([rootparent.style])
  if(!rootparent){
    rootparent = document.body;
    s.position = "relative";
  }
  rootparent.appendChild(pup);
  var rect = obj.getBoundingClientRect();
  var altPos = getOffset( obj );
  altPos.y += obj.clientHeight;
//objectLerp(obj,altPos,2000,20);
//console.log([obj], ":::", s.left,s.top, ";", rect.left, rect.top, rect.right, rect.bottom, ";", altPos.left, altPos.top);

  var xb = document.createElement('button');
  xb.innerText= "X";
  s = xb.style;
  s.position = "absolute";
  s.right = "2px";
  s.top = "2px";
  s.padding = "1px 4px";
  s.backgroundColor = "transparent";
  s.borderColor = "#f00";
  s.color = "#f00";
  s.borderWidth = "1px";
  s.borderRadius = "10px";
  xb.onclick = function(){destroyLineage(pup, 0);}
  pup.appendChild(xb);
  //console.log([xb]);

  if(text){
    var mbx = document.createElement('p');
    s = mbx.style;
    mbx.innerHTML= text;
    s.margin = "10px";
    s.marginTop = "0px";
    s.verticalAlign = "top";
    pup.appendChild(mbx);
    //console.log(obj.offsetTop + " " + obj.offsetLeft + " " + obj.offsetHeight);
  }
  return pup;
};

var validationPopup = function(obj, message, maxduration){
  var pup = createPopup(obj, '&#x21e7;'+"<br>"+message, 500);
  if(maxduration >= 0){
    setTimeout(function(){ if(pup){destroyLineage(pup, 0);} }, maxduration);
  }
  if(maxduration >= 500){
    setTimeout(function(){pulse(pup, 1, 1000);}, maxduration-500);
  }
  return pup;
}
var centerPopup = function(text) {
  var pup = createPopup(null, text, 500);

}

// takes a pre-filled google forms URL and parses its components
// @returns {id:uniqueGoogleFormID, tokens:questionEntryIDs}
var convertPrefilled = function(prefilledResponseURL, optionalerrorlist, minFields) {
  var expectedPrefix = "https://docs.google.com/forms/d/";
  if(!prefilledResponseURL.startsWith(expectedPrefix)){
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
  console.log(tokens);
  if(minFields && tokens.length < minFields){
    if(optionalerrorlist){
      optionalerrorlist.push(
        "The Google Form needs to have at least "+minFields+
        " short-answer (text) questions at the beginning.");
    }
    return null;
  }
  var result = {id:uniqueID, tokens:tokens};
  console.log([result]);
  return result;
};

function setStyle(property, value, element_ids) {
  for(var i=0;i<element_ids.length;++i){
    var e = ByID(element_ids[i]);
    e.style[property] = value;
  }
};

function clone(item) {
  if (!item) { return item; } // null, undefined values check
  var types = [ Number, String, Boolean ], result;
  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach(function(type) {
    if (item instanceof type) {
      result = type( item );
    }
  });
  if (typeof result == "undefined") {
    if (Object.prototype.toString.call( item ) === "[object Array]") {
      result = [];
      item.forEach(function(child, index, array) { 
        result[index] = clone( child );
      });
    } else if (typeof item == "object") {
      // testing that this is DOM
      if (item.nodeType && typeof item.cloneNode == "function") {
          var result = item.cloneNode( true );    
      } else if (!item.prototype) { // check that this is a literal
        if (item instanceof Date) {
            result = new Date(item);
        } else {
          // it is an object literal
          result = {};
          for (var i in item) {
            result[i] = clone( item[i] );
          }
        }
      } else {
        // depending what you would like here,
        // just keep the reference, or create new object
        if (false && item.constructor) {
          // would not advice to do that, reason? Read below
          result = new item.constructor();
        } else {
          result = item;
        }
      }
    } else {
      result = item;
    }
  }
  return result;
}

var zeroOut = function(arr){
  for(var i=0;i<arr.length;++i)
    arr[i]=0;
  return arr;
}

// turn a raw string into a URL safe string filtered by a simple replacement cipher
// @returns [filteredString, replacementCipher]
var attemptToCompressURLData = function(originalString) {
  var allowedSpecialCharacters = "-._!*'";
  console.log(encodeURIComponent(allowedSpecialCharacters));
  var spec = new Array(allowedSpecialCharacters.length);
  for(var i=0;i<spec.length;++i)spec[i]=allowedSpecialCharacters.charCodeAt(i);
  var lowercaseUsed=zeroOut(new Array(26)); 
  var uppercaseUsed=zeroOut(new Array(26));
  var numericUsed = zeroOut(new Array(10));
  var specialUsed = zeroOut(new Array(allowedSpecialCharacters.length));
  var unsafeChars = [];
  var unsafeUsed = [];
  var n0 = "0".charCodeAt(0), n9 = "9".charCodeAt(0), 
      na = "a".charCodeAt(0), nz = "z".charCodeAt(0),
      nA = "A".charCodeAt(0), nZ = "Z".charCodeAt(0);
  var idx;
  // generate stats on letters being used to find out what needs to be replaced with what
  for(var i=0;i<originalString.length;++i) {
    var c = originalString.charCodeAt(i);
    if (c >= n0 && c <= n9) {        numericUsed[c-n0]++; }
    else if (c >= na && c <= nz) { lowercaseUsed[c-na]++; }
    else if (c >= nA && c <= nZ) { uppercaseUsed[c-nA]++; }
    else if ( (idx = spec.indexOf(c)) >= 0) { specialUsed[idx]++; }
    else {
      idx = unsafeChars.indexOf(c);
      if(idx < 0){
        unsafeChars.push(c);
        unsafeUsed.push(1);
      } else {
        unsafeUsed[idx]++;
      }
    }
  }
  // finds unused characters and does 'whatToDo' with them
  var forEachZero = function(arr, whatToDo) {
    for(var i=0;i<arr.length;++i) { if(arr[i] === 0) { whatToDo(i); } }
  };
  var unusedCharacters = "";
  forEachZero(uppercaseUsed, function(i){unusedCharacters += String.fromCharCode(nA+i);});
  forEachZero(lowercaseUsed, function(i){unusedCharacters += String.fromCharCode(na+i);});
  forEachZero(numericUsed, function(i){unusedCharacters += String.fromCharCode(n0+i);});
  forEachZero(specialUsed, function(i){unusedCharacters += String.fromCharCode(spec[i]);});
  if(unusedCharacters.length==0) { // if there were no unused characters, this won't work...
    return null;
  }
  console.log("unused:",unusedCharacters);
  unsafeSorted = clone(unsafeChars);
  // create a histogram lookup table for unsafe characters
  var lookupTable = {};
  for(var i=0;i<unsafeChars.length;++i) {
    lookupTable[unsafeChars[i]] = unsafeUsed[i];
  }
  // sort the unacceptable characters by frequency
  unsafeSorted.sort(function(a,b) {
    return lookupTable[b]-lookupTable[a]; // most common first
  });
  for(var i=0;i<unsafeSorted.length;++i) {
    console.log("\""+String.fromCharCode(unsafeSorted[i])+"\"",lookupTable[unsafeSorted[i]]);
  }
  var delim = unusedCharacters[0];
  unusedCharacters = unusedCharacters.substring(1);
  var replacementCipher = "";
  var tokensUsed = 0;
  var searchReplace = {};
  for(var i=0; i<unusedCharacters.length && i < unsafeChars.length; ++i){
    searchReplace[unsafeChars[i]] = unusedCharacters[i];
    replacementCipher += delim + unusedCharacters[i] + 
      unsafeChars[i].toString(16).toUpperCase();
      //String.fromCharCode(unsafeChars[i]);
    tokensUsed++;
  }
  unusedCharacters = unusedCharacters.substring(tokensUsed);
  console.log(replacementCipher);
  console.log([searchReplace]);
  var filteredString = "";
  for(var i=0;i<originalString.length;++i){
    var c = originalString.charCodeAt(i);
    var r = searchReplace[c];
    if(r){
      filteredString += r;
    }else{
      filteredString += String.fromCharCode(c);
    }
  }
  return [filteredString, replacementCipher];
};

// get raw text out of URL-safe string
var unfilter = function(filter, filteredString){
  // create the lookup table from the filter
  var k = {};
  var delim = filter[0];
  for(var i=1;i<filter.length;++i){
    var c = filter[i];
    i++;
    var replacement = "";
    while(filter[i] != delim && i < filter.length){
      var hexNum = "";
      hexNum += filter[i+0];
      hexNum += filter[i+1];
      i+=2;
      replacement += String.fromCharCode(parseInt(hexNum, 16));
    }
    k[c] = replacement;
  }
  // filter the string using the lookup table
  var unfiltered = "";
  var r;
  for(var i=0;i<filteredString.length;++i) {
    r = k[filteredString[i]];
    if(r){
      unfiltered += r;
    }else{
      unfiltered += filteredString[i];
    }
  }
  return unfiltered;
};

var copyObjectProperties = function(srcObj, destObj){
  for(var k in srcObj){
    destObj[k] = srcObj[k];
  }
};

var howToMakeGoogleForm = function(idOfFormField) {
  var gforma = '<a href="https://drive.google.com/usetemplate?id=1DRloAPYHprPaaBcZWTD30oF0E_KlgFvjWWmc5oxH-tM&category=3&mode=public&type=forms&token=2dGwalIBAAA.BJezQF0pH6kGNQlnK2PRhg.PhuPCcyj9sPfzUCKD9uWBA" target="_blank">';
  var instructions = '<ol>'+
        '<li>'+gforma+'Create the google form</a>'+
        ' by clicking '+gforma+'here</a></li>'+
        '<li>Click (Use this template)'+
        '<li>At the top of the page<br><b>Responses (0)</b> &#9758; <b>Get pre-filled URL</b>'+
        //'<br>or<br>'+
        //'<b>(&#x22ee;)</b> &#9758; <b>Get pre-filled link</b></li>'+
        '<li>Scroll down & press Submit</li>'+
        '<li>Copy the given link</li>'+
        '<li>Paste the link in the input-field above</li>'+
      '</ol>';
  validationPopup(ByID(idOfFormField), instructions, 15000);
}

/**
* creates a stylesheet entry with the given text
* @param {*} str_cssEntry example: 'h1 { background: red; }'
*/
var createStyle = function(str_cssEntry){
	var css = str_cssEntry;//'h1 { background: red; }',
	head = document.head || document.getElementsByTagName('head')[0],
	style = document.createElement('style');
	style.type = 'text/css';
	if (style.styleSheet){
		// This is required for IE8 and below.
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
	head.appendChild(style);
}

/** uses DB_valueCategory from categories.js to generate icon colorization styles */
var generateStylesForCategories = function() {
	for(var k in DB_valueCategory) {
		var color = DB_valueCategory[k].color;
		var hsl = hex2hsl(color);
		hue = (360 * hsl[0]) | 0;
		var txt = ".colorize"+k+"{";
		txt += DB_valueCategory[k].iconStyle;
		txt += "}";
		//console.log(txt+"   "+DB_valueCategory[k].color+"    "+JSON.stringify(hsl)+"    "+hue);
		createStyle(txt);
	}
}

/** @return the color associated with the given catoegory name (scope is ignored) */
var colorForCategory = function(scope, name) {
	return DB_valueCategory[name].color;
}

/** @return an [r,g,b] array converted from a #ffffff hex string */
var h2r = function(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)
	] : null;
};

/** Inverse of h2r */
var r2h = function(rgb) {
	return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
};

/**
* Converts an RGB color value to HSL. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes r, g, and b are contained in the set [0, 255] and
* returns h, s, and l in the set [0, 1].
*
* @param   Number  r       The red color value
* @param   Number  g       The green color value
* @param   Number  b       The blue color value
* @return  Array           The HSL representation
*/
function rgbToHsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;
	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return [ h, s, l ];
}
/** @return an [h,s,l] array converted from a #ffffff hex string */
function hex2hsl(str_hexcode) {
	var rgbs = h2r(str_hexcode);
	return rgbToHsl(rgbs[0],rgbs[1],rgbs[2]);
}

/** Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
* Taken from the awesome ROT.js roguelike dev library at
* https://github.com/ondras/rot.js
*/ 
var _interpolateColor = function(color1, color2, factor) {
	if (arguments.length < 3) { factor = 0.5; }
	var result = color1.slice();
	for (var i=0;i<3;i++) {
		result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
	}
	return result;
};

var colorForListing = function(scope, listing) {
	// pick-apart the RGB values
	var rgb = [];
	for(var i = 0; i < listing.length; ++i) {
		var colorString = colorForCategory(scope, listing[i]);
		rgb[i] = h2r(colorString);
	}
	// // average the colors
	// var avg = [0,0,0];
	// for(var c = 0; c < avg.length; ++c) {
	// 	for(var i = 0; i < rgb.length; ++i) {
	// 		avg[c] += rgb[i][c];
	// 	}
	// 	avg[c] /= rgb.length;
	// 	avg[c] = (avg[c]) | 0; // force number to integer
  // }
  // weight the first categories differently, to make unique colors
  avg = _interpolateColor(rgb[0],rgb[1], 0.4);
  avg = _interpolateColor(avg, rgb[2], 0.6);
	return r2h(avg);
}

/**
* @param categoryName which category to get the icon for
* @param class_style the name of the category to recolor the icon to
* @param iconHeight if given, sets the img's height property
* @return HTML code for the <img> for the given categoryName 
*/
var iconForListing = function(scope, categoryName, class_style, iconHeight = undefined) {
	var output = "";
	var img = DB_valueCategory[categoryName].icon;
	if(img) { output += "<img src='"+img+"'";
		if(class_style != null && class_style != undefined) {
			output += " class='colorize"+class_style+"'";
		}
		if(iconHeight != undefined) { output += " height="+iconHeight; }
		output += " alt='"+categoryName+"'>";
		// console.log(output);
	}
	return output;
}

/**
* @param scope
* @param iconheight how tall to make the icons (in pixels)
* @return the <img> icons for each category in listing
*/
var iconsForListing = function(scope, listing, iconHeight=32) {
	var output = "";
	if(listing && listing.length && listing.length > 0) {
		for(var i = 0; i < listing.length; ++i) {
			output += iconForListing(scope, listing[i], listing[i], iconHeight);
		}
	}
	return output;
}
