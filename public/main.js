var app = angular.module('root', []).
controller("gitHubCtrl", ["$scope","$filter","githubService", function ($scope,$filter,githubService) {
    githubService.getStatus().then(function(res) {
        console.log("got status: " + res.status);
        $scope.status = res.status;
    });
    githubService.getMessages().then(function(res) {
        if (!angular.isArray(res)) {
            console.log("res is not an array as excpected.")
        }
        else {
            $scope.messages = res;
            //create time frame string for each message. first object need special care
            $scope.messages[0].created_on = new Date($scope.messages[0].created_on);
            $scope.messages[0].timeFrame = $filter('date')($scope.messages[0].created_on,"short") + " - now";
            for(var i = 1;i<$scope.messages.length;i++) {
                $scope.messages[i].created_on = new Date($scope.messages[i].created_on);
                $scope.messages[i].timeFrame =
                    $filter('date')($scope.messages[i].created_on,"short") + " - " + $filter('date')($scope.messages[i-1].created_on,"short");
            }
        }

        $scope.messages = res;
    });
}]).
factory('githubService', function($http) {
    return {
        getStatus: function() {
            var promise = $http.get('http://localhost:8080/status').then(function(response) {
                //return the response's data.
                return response.data;
            });
            return promise;
        },

        getMessages: function() {
            var promise = $http.get('http://localhost:8080/messages').then(function(response) {
                //return the response's data.
                return response.data;
            });
            return promise;
        }
    }
});