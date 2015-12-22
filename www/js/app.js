var example = angular.module('starter', ['ionic']);
var localDB = new PouchDB("todos");
var remoteDB = new PouchDB("https://ishanshethstl.cloudant.com/todos", {
    skipSetup: true
});

example.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        localDB.sync(remoteDB, {
            live: true,
            retry: true
        }).on('error', console.log.bind(console));
    });
});

example.controller("ExampleController", function($scope, $ionicPopup, PouchDBListener) {

    $scope.todos = [];

    $scope.create = function() {
        $ionicPopup.prompt({
                title: 'Enter a new TODO item',
                inputType: 'text'
            })
            .then(function(result) {
                if (result !== "") {
                    if ($scope.hasOwnProperty("todos") !== true) {
                        $scope.todos = [];
                    }
                    localDB.post({
                        title: result
                    });
                } else {
                    console.log("Action not completed");
                }
            });
    }

    $scope.$on('add', function(event, todo) {
        $scope.todos.push(todo);
    });

    $scope.$on('delete', function(event, id) {
        for (var i = 0; i < $scope.todos.length; i++) {
            if ($scope.todos[i]._id === id) {
                $scope.todos.splice(i, 1);
            }
        }
    });

});

example.factory('PouchDBListener', ['$rootScope', function($rootScope) {

    localDB.changes({
        continuous: true,
        onChange: function(change) {
            if (!change.deleted) {
                $rootScope.$apply(function() {
                    localDB.get(change.id, function(err, doc) {
                        $rootScope.$apply(function() {
                            if (err) console.log(err);
                            $rootScope.$broadcast('add', doc);
                        })
                    });
                })
            } else {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('delete', change.id);
                });
            }
        }
    });

    return true;

}]);
