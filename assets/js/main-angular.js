var AgendaTodosApp = angular.module('AgendaTodosApp', ['ngRoute', 'ngResource', 'ui.bootstrap']);

TodosApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/list.html',
    controller: 'TodosListCtl'
  }).when('/login', {
    templateUrl: 'partials/login.html'
  }).when('/register', {
    templateUrl: 'partials/register.html'
  });
}]);

// title: "empty assignment...",
// dueDate: new Date(),
// priority: 0,
// completed: false
AgendaTodosApp.factory('Assignment', ['$resource', function($resource) {
  return $resource('/tasks/:id', null, {
    'update': { method: 'PUT' }
  });
}]);

AgendaTodosApp.directive('dateInput', ['dateFilter', function(dateFilter) {
  return {
    require: 'ngModel',
    template: '<input type="date"></input>',
    replace: true,
    link: function(scope, elm, attrs, ngModelCtrl) {
      ngModelCtrl.$formatters.unshift(function (modelValue) {
        return dateFilter(modelValue, 'yyyy-MM-dd');
      });

      ngModelCtrl.$parsers.unshift(function(viewValue) {
        return new Date(viewValue);
      });
    }
  }
}]);

AgendaTodosApp.controller('AgendaTodosListCtl', ['$scope', '$modal', 'Assignment', function($scope, $modal, Assignment) {
  $scope.assignments = Assignment.query();
  $scope.expand = false;

  function setFormToDefault() {
    $scope.assignmentTitle = "";
    $scope.priority = 0;
    $scope.dueDate = new Date();
  }
  setFormToDefault();

  $scope.addNew = function() {
    if (!$scope.assignmentTitle.length) {
      return;
    }

    var assignment = new Assignment();
    assignment.title = $scope.assignmentTitle;
    assignment.priority = $scope.priority;
    assignment.dueDate = $scope.dueDate;
    assignment.completed = false;
    assignment.$save(function(a) {
      $scope.assignments.push(a);
    });

    setFormToDefault();
  }

  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.assignments, function(assignment) {
      count += assignment.completed ? 0 : 1;
    });
    return count;
  }

  $scope.comparator = function(a) {
    return -(a.priority + 1) + a.dueDate.getTime();
  }

  $scope.updateEntry = function(entry) {
    Assignment.update({ id: entry.id }, entry);
  }

  $scope.editText = function(entry) {
    var modalInstance = $modal.open({
      templateUrl: 'edit-assignment.html',
      controller: 'AgendaTodosEditCtl',
      resolve: {
        entry: function() {
          return entry;
        }
      }
    });

    modalInstance.result.then(function(entry) {
      Assignment.update({ id: entry.id }, entry);
      console.log(' [*] Modal edited entry', entry);
    }, function() {
      console.log(' [*] Modal cancelled');
    });
  }

  $scope.destroy = function(entry) {
    $scope.assignments.splice($scope.assignments.indexOf(entry), 1);
    Assignment.delete({ id: entry.id });
  }

  $scope.clearCompleted = function() {
    var oldAssignments = $scope.assignments;
    $scope.assignments = [];
    angular.forEach(oldAssignments, function(assignment) {
      if (assignment.completed) {
        Assignment.delete({ id: assignment.id });
      } else {
        $scope.assignments.push(assignment);
      }
    });
  }

  $scope.$watch('assignmentTitle', function(old, new) {
    if (!old.length && new.length) {
      $scope.expand = true;
    } else if (old.length && !new.length) {
      $scope.expand = false;
    }
  });

  $scope.$watch('toggleAll', function(old, new) {
    angular.forEach($scope.assignments, function(a) {
      a.completed = !!new;
      Assignment.update({ id: assignment.id }, a);
    });
  });
}]);

AgendaTodosApp.controller('AgendaTodosEditCtl', ['$scope', '$modalInstance', 'entry', function($scope, $modalInstance, entry) {
  $scope.entry = entry;

  $scope.ok = function() {
    $modalInstance.close($scope.entry);
  }

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  }
}]);

AgendaTodosApp.controller('AgendaTodosCtl', ['$scope', function($scope) {
  console.log(' [*] Initialized AgendaTodosCtl');
}]);