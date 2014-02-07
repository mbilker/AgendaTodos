var TodosApp = angular.module('TodosApp', ['ngRoute', 'ngResource']);

TodosApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/login.html'
  }).when('/list', {
    templateUrl: 'partials/list.html',
    controller: 'TodosListController'
  });
});

TodosApp.controller('MTGInvManagerCtl', ['$scope', '$modal', function($scope, $modal) {
}]);
