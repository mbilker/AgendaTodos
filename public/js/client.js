var readScript;

readScript = function(script) {
  var x, xhr;

  xhr = new XMLHttpRequest();
  xhr.open("GET", script, false);
  xhr.send(null);
  x = xhr.responseText;
  return x;
};

$(function() {
  var App, AppView, Assignment, AssignmentList, AssignmentView, Assignments;

  Assignment = Backbone.Model.extend({
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
        return this.set({
          title: this.defaults().title
        });
      }
    },
    toggle: function() {
      return this.save({
        completed: !this.get("completed")
      });
    }
  });
  AssignmentList = Backbone.Collection.extend({
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
      var a;

      a = -(assignment.get("priority") + 1) + new Date(assignment.get("dueDate")).getTime();
      return a;
    }
  });
  Assignments = new AssignmentList();
  AssignmentView = Backbone.View.extend({
    tagName: "li",
    template: _.template(readScript("/templates/item-template.js")),
    events: {
      "click .toggle": "toggleDone",
      "dblclick .view": "edit",
      "click a.destroy": "clear",
      "keypress .edit": "updateOnEnter",
      "blur .edit": "close"
    },
    initialize: function() {
      this.listenTo(this.model, "change", this.render);
      return this.listenTo(this.model, "destroy", this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass("done", this.model.get("completed"));
      this.input = this.$(".edit");
      return this;
    },
    toggleDone: function() {
      return this.model.toggle();
    },
    edit: function() {
      this.$el.addClass("editing");
      return this.input.focus();
    },
    close: function() {
      var value;

      value = this.input.val();
      if (!value) {
        return this.clear();
      } else {
        this.model.save({
          title: value
        });
        return this.$el.removeClass("editing");
      }
    },
    updateOnEnter: function(e) {
      if (e.keyCode === 13) {
        return this.close();
      }
    },
    clear: function() {
      return this.model.destroy();
    }
  });
  AppView = Backbone.View.extend({
    el: $("#app"),
    statsTemplate: _.template(readScript("/templates/stats-template.js")),
    events: {
      "keypress #new-assignment": "createOnEnter",
      "focus #new-assignment": "focusAssignment",
      "blur #new-assignment": "blurAssignment",
      "click #submit": "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },
    initialize: function() {
      this.input = this.$("#new-assignment");
      this.dueDate = this.$("#dueDate");
      this.priority = this.$("#priority");
      this.allCheckbox = this.$("#toggle-all")[0];
      this.expand = this.$("#expand");
      this.listenTo(Assignments, "all", function(ev) {
        console.log("all:", ev);
        return this.render();
      });
      this.listenTo(Assignments, "reset", this.sortComplete);
      this.listenTo(Assignments, "sort", this.sortComplete);
      this.footer = this.$("footer");
      this.main = $("#main");
      return Assignments.fetch();
    },
    resort: function() {
      return Assignments.sort({
        silent: true
      });
    },
    sortComplete: function() {
      this.$("#assignment-list").empty();
      return this.addAll();
    },
    render: function() {
      var done, remaining;

      done = Assignments.done().length;
      remaining = Assignments.remaining().length;
      if (Assignments.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({
          done: done,
          remaining: remaining
        }));
      } else {
        this.main.hide();
        this.footer.hide();
      }
      return this.allCheckbox.checked = !remaining;
    },
    addOne: function(assignment) {
      var view;

      view = new AssignmentView({
        model: assignment
      });
      return this.$("#assignment-list").append(view.render().el);
    },
    addAll: function() {
      return Assignments.each(this.addOne, this);
    },
    createOnEnter: function(e) {
      var date, priority;

      if (e.type === "keypress" && e.keyCode !== 13) {
        return;
      }
      if (!this.input.val()) {
        return this.input.parents(".control-group").addClass("warning");
      } else {
        this.input.parents(".control-group").removeClass("warning");
      }
      if (!this.dueDate.val()) {
        return this.dueDate.parents(".control-group").addClass("warning");
      } else {
        this.dueDate.parents(".control-group").removeClass("warning");
      }
      date = this.dueDate.val().split("-");
      date = new Date(date[0], date[1] - 1, date[2]);
      priority = Number(this.priority.val()) || 0;
      Assignments.create({
        title: this.input.val(),
        dueDate: date,
        priority: priority
      });
      this.input.val("");
      this.priority.val("");
      this.dueDate.val("");
      return this.slide();
    },
    focusAssignment: function() {
      return this.slide();
    },
    blurAssignment: function() {
      if (this.input.val() === "") {
        return this.slide();
      }
    },
    slide: function() {
      this.expand.toggleClass("unhide");
      if (this.expand.hasClass("unhide")) {
        return this.expand.css({
          'max-height': this.expand.actual("height")
        });
      } else {
        return this.expand.css({
          'max-height': '0px'
        });
      }
    },
    clearCompleted: function() {
      _.invoke(Assignments.done(), "destroy");
      return false;
    },
    toggleAllComplete: function() {
      var done;

      done = this.allCheckbox.checked;
      return Assignments.each(function(assignment) {
        return assignment.save({
          completed: done
        });
      });
    }
  });
  App = new AppView;
  window.App = App;
  window.Assignments = Assignments;
});
