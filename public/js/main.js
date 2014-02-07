var AgendaTodosApp = angular.module('AgendaTodosApp', ['ngRoute', 'ngResource', 'ui.bootstrap']);

AgendaTodosApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/list.html',
    controller: 'AgendaTodosListCtl'
  });
}]);

// title: "empty assignment...",
// dueDate: new Date(),
// priority: 0,
// completed: false
AgendaTodosApp.factory('Assignment', ['$resource', function($resource) {
  return $resource('/tasks/:id', { id: '@_id' }, {
    'update': { method: 'PUT' }
  });
}]);

['login', 'register'].forEach(function(template) {
  AgendaTodosApp.directive(template, function() {
    return {
      restrict: 'E',
      templateUrl: 'partials/' + template + '.html',
      link: function() {
      }
    }
  });
});

AgendaTodosApp.directive('dateinput', ['dateFilter', function(dateFilter) {
  return {
    restrict: 'E',
    require: 'ngModel',
    template: '<input type="date"></input>',
    replace: true,
    link: function(scope, elm, attrs, ngModelCtrl) {
      ngModelCtrl.$formatters.unshift(function(modelValue) {
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

    $scope.assignments.push(assignment);
    var index = $scope.assignments.indexOf(assignment);
    assignment.$save(function(a) {
      $scope.assignments[index] = a;
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

  $scope.tasksCompleted = function() {
    var count = 0;
    angular.forEach($scope.assignments, function(assignment) {
      count += assignment.completed ? 1 : 0;
    });
    return count;
  }

  $scope.comparator = function(a) {
    return -(a.priority + 1) + new Date(a.dueDate).getTime();
  }

  $scope.updateEntry = function(entry) {
    Assignment.update({ id: entry._id }, entry);
  }

  $scope.dueDateFor = function(entry) {
    return new Date(entry.dueDate).toDateString();
  }

  $scope.editText = function(entry) {
    var modalInstance = $modal.open({
      templateUrl: 'partials/edit-assignment.html',
      controller: 'AgendaTodosEditCtl',
      resolve: {
        entry: function() {
          return entry;
        }
      }
    });

    modalInstance.result.then(function(entry) {
      Assignment.update({ id: entry._id }, entry);
      console.log(' [*] Modal edited entry', entry);
    }, function() {
      console.log(' [*] Modal cancelled');
    });
  }

  $scope.destroy = function(entry) {
    $scope.assignments.splice($scope.assignments.indexOf(entry), 1);
    Assignment.delete({ id: entry._id });
  }

  $scope.clearCompleted = function() {
    var oldAssignments = $scope.assignments;
    $scope.assignments = [];
    angular.forEach(oldAssignments, function(assignment) {
      if (assignment.completed) {
        Assignment.delete({ id: assignment._id });
      } else {
        $scope.assignments.push(assignment);
      }
    });
  }

  $scope.$watch('toggleAll', function(oldValue, newValue) {
    angular.forEach($scope.assignments, function(a) {
      a.completed = !!newValue;
      Assignment.update({ id: assignment._id }, a);
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
