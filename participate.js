angular.module('participate', ['ng-sortable'])
  .controller('participateController', ['$scope', function ($scope) {
    $scope.opts = {
      group: 'students',
      animation: 150,
//      onAdd: function (evt){ console.log('onAdd:', [evt]); },
//      onUpdate: function (evt){ console.log('onUpdate:', [evt]); },
//      onRemove: function (evt){ console.log('onRemove:', [evt]); },
//      onStart:function(evt){ console.log('onStart:', [evt]);},
//      onSort:function(evt){ console.log('onStart:', [evt]);},
      onEnd: function(evt){ ensureCategoryOrder($scope.categories); }
    };
    // get the default categories and choices first
    $scope.categories = valuesCategories;
    $scope.state = loadState();
    // add a category marker to each grouped category
    if($scope.categories){
      for(k in $scope.categories){
        var list = $scope.categories[k];
        for(var i=0;i<list.length;++i){
          entry = list[i];
          console.log(entry);
          if(entry.length < 2){ console.log("entries need positive and negative text!");}
          if(entry.length < 3){
            entry.push([]);
          }
          if(entry[2].length == 0 || entry[2].indexOf(k) < 0) {
            entry[2].unshift(k);
            //console.log("added to ",[entry]);
          }
          if(entry.length < 4){
            entry.push(cleanListing(entry[2]));
          }
        }
      }
    }
  }]);
