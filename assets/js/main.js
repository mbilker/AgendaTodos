var TodosApp = angular.module('TodosApp', ['ngRoute', 'ngResource']);

<<<<<<< HEAD
function formatDateInput(d) {
  var m = (d.getMonth() < 9 ? "0" : "") + (d.getMonth() + 1);
  var d = (d.getDate() < 10 ? "0" : "") + d.getDate();

  return d.getFullYear() + "-" + m + "-" + d;
}

$(function() {
  var Assignment = Backbone.Model.extend({
    urlRoot: "/assignments/sync",
    idAttribute: "_id",
    defaults: {
      title: "empty assignment...",
      dueDate: new Date(),
      priority: 0,
      completed: false
    },
    initialize: function() {
      if (!this.get("title")) {
        this.set({
          title: this.defaults().title
        });
      }
    },
    toggle: function() {
      this.save({
        completed: !this.get("completed")
      });
    }
  });

  var AssignmentList = Backbone.Collection.extend({
    model: Assignment,
    url: "/assignments/sync",
    done: function() {
      return this.filter(function(assignment) {
        return assignment.get("completed");
      });
    },
    remaining: function() {
      return this.without.apply(this, this.done());
    },
    comparator: function(assignment) {
      return -(assignment.get("priority") + 1) + new Date(assignment.get("dueDate")).getTime();
    }
  });

  var Assignments = window.Assignments = new AssignmentList();
  var AssignmentView = Backbone.View.extend({
    tagName: "li",
    template: _.template(readScript("/templates/item-template.js")),
    events: {
      "click .toggle": "toggleDone",
      "click .edit-text": "edit",
      "click a.destroy": "clear",
      "click .save-changes": "dueDateEdited"
    },
    initialize: function() {
      _.bindAll(this, 'render', 'saveModel', 'toggleDone', 'edit', 'dueDateEdited', 'clear');

      this.listenTo(this.model, "change", this.render);
      this.listenTo(this.model, "destroy", this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass("done", this.model.get("completed"));

      this.titleEdit = this.$(".title-edit");
      this.dueDateEdit = this.$(".dueDate-edit");
      this.priorityEdit = this.$(".priority-edit");
      this.modal = this.$(".modal");
      this.modal.on('hidden', this.saveModel);

      return this;
    },
    saveModel: function () {
      var date = this.dueDateEdit.val().split("-");
      date = new Date(date[0], date[1] - 1, date[2]);
      var priority = parseInt(this.priorityEdit.val()) || 0;

      this.model.save({
        title: this.titleEdit.val(),
        dueDate: date,
        priority: priority
      });
    },
    toggleDone: function() {
      this.model.toggle();
    },
    edit: function(e) {
      e.preventDefault();
      this.modal.modal();
      return false;
    },
    dueDateEdited: function() {
      this.modal.modal('hide');
    },
    clear: function() {
      this.model.destroy();
    }
=======
TodosApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/login.html'
  }).when('/list', {
    templateUrl: 'partials/list.html',
    controller: 'TodosListController'
>>>>>>> 8916cf86b93341f7fca80a23a50fb66db6474c09
  });
});

TodosApp.controller('MTGInvManagerCtl', ['$scope', '$modal', function($scope, $modal) {
}]);
