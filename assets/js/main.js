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
        var date = new Date(viewValue);
        date.setDate(date.getDate() + 1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        return date;
      });
    }
  }
}]);

AgendaTodosApp.controller('AgendaTodosListCtl', ['$scope', '$modal', 'Assignment', function($scope, $modal, Assignment) {
  $scope.assignments = Assignment.query();

  function setFormToDefault() {
    $scope.assignmentTitle = "";
    $scope.priority = 0;
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    $scope.dueDate = d;
  }
  setFormToDefault();

  $scope.addNew = function() {
    if (!$scope.assignmentTitle.length) {
      return;
    }

    console.log($scope.assignmentTitle);
    console.log($scope.priority);
    console.log($scope.dueDate);

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

  $scope.comparator = function(a, b) {
    console.log(a, b);
    if (!a || !b) {
      return 0;
    }

    var aVal = -(a.priority + 1) + new Date(a.dueDate).getTime();
    var bVal = -(b.priority + 1) + new Date(b.dueDate).getTime();
    if (aVal > bVal) {
      return 1;
    } else if (aVal < bVal) {
      return -1;
    } else {
      return 0;
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
