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
