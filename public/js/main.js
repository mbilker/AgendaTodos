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
        var d = new Date(viewValue);
        d.setDate(d.getDate() + 1);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
      });
    }
  }
}]);

AgendaTodosApp.controller('AgendaTodosListCtl', ['$scope', '$modal', 'Assignment', function($scope, $modal, Assignment) {
  $scope.assignments = Assignment.query(function() {
    //$scope.assignments.sort($scope.comparator);
  });

  function setFormToDefault() {
    $scope.assignmentTitle = "";
    $scope.priority = 0;
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    $scope.dueDate = d;
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
    //$scope.assignments.sort($scope.comparator);
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

  $scope.comparator = function(a, b) {
    if (!a || !b) return false;
    var date = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (date == 0) {
      var priority = b.priority - a.priority;
      console.log(a, b, date, priority);
      return priority;
    } else {
      console.log(a, b, date);
      return date;
    }
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
      //$scope.assignments.sort($scope.comparator);
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

  $scope.$watch('toggleAll', function(newValue, oldValue) {
    console.log(newValue, oldValue);
    angular.forEach($scope.assignments, function(a) {
      a.completed = !!newValue;
      Assignment.update({ id: a._id }, a);
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
