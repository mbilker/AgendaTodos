function readScript(script) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", script, false);
  xhr.send(null);
  return xhr.responseText;
}

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
  });
  AppView = Backbone.View.extend({
    el: $("#app"),
    statsTemplate: _.template(readScript("/templates/stats-template.js")),
    events: {
      "keypress #new-assignment": "createOnEnter",
      "keyup #new-assignment": "backspace",
      "blur #new-assignment": "blurAssignment",
      "click #submit": "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },
    initialize: function() {
      _.bindAll(this, 'sortComplete', 'render', 'addOne', 'addAll', 'createOnEnter', 'backspace', 'focusAssignment', 'blurAssignment', 'onTransitionEnd', 'toggleAllComplete');

      this.input = this.$("#new-assignment");
      this.dueDate = this.$("#dueDate");
      this.priority = this.$("#priority");
      this.allCheckbox = this.$("#toggle-all")[0];
      this.expand = this.$("#expand");
      this.footer = this.$("footer");
      this.main = $("#main");

      var d = new Date();
      d.setDate(d.getDate() + 1);

      this.minDate = formatDateInput(d);
      this.dueDate.attr('min', this.minDate);
      this.dueDate.val(this.minDate);

      this.listenTo(Assignments, "all", function(ev) {
        console.log("all:", ev);
        this.render();
      });
      this.listenTo(Assignments, "reset", this.sortComplete);
      this.listenTo(Assignments, "sort", this.sortComplete);
      Assignments.fetch();

      this.expand.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', this.onTransitionEnd);
    },
    resort: function() {
      Assignments.sort({ silent: true });
    },
    sortComplete: function() {
      this.$("#assignment-list").empty();
      this.addAll();
    },
    render: function() {
      var done = Assignments.done().length;
      var remaining = Assignments.remaining().length;

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
      this.allCheckbox.checked = !remaining;
    },
    addOne: function(assignment) {
      var view = new AssignmentView({
        model: assignment
      });
      this.$("#assignment-list").append(view.render().el);
    },
    addAll: function() {
      Assignments.each(this.addOne, this);
    },
    backspace: function(e) {
      if (e.type === 'keyup' && e.keyCode !== 8) {
        return;
      }
      if (this.input.val() === '') {
        return this.slide(false);
      }
    },
    createOnEnter: function(e) {
      if (!this.expand.hasClass('unhide')) this.slide(true);

      if (e.type === "keypress" && e.keyCode !== 13) {
        return;
      }

      if (!this.input.val()) return this.input.parents(".control-group").addClass("warning");
      else this.input.parents(".control-group").removeClass("warning");

      if (!this.dueDate.val()) return this.dueDate.parents(".control-group").addClass("warning");
      else this.dueDate.parents(".control-group").removeClass("warning");

      var date = this.dueDate.val().split("-");
      date = new Date(date[0], date[1] - 1, date[2]);
      var priority = parseInt(this.priority.val()) || 0;

      Assignments.create({
        title: this.input.val(),
        dueDate: date,
        priority: priority
      });
      this.input.val("");
      this.priority.val("");
      this.dueDate.val(this.minDate);
      this.slide(false);
    },
    focusAssignment: function() {
      this.slide(true);
    },
    blurAssignment: function() {
      if (this.input.val() === '') {
        this.slide(false);
      } else {
        this.slide(true);
      }
    },
    slide: function(show) {
      if (show) {
        this.expand.addClass('unhide');
        this.expand.css({
          'display': 'block',
          'height': this.expand.actual("outerHeight")
        });
      } else {
        this.expand.removeClass('unhide');
        this.expand.css({
          'height': '0px'
        });
      }
    },
    onTransitionEnd: function(e) {
      if (!this.expand.hasClass("unhide")) {
        this.expand.css({
          'display': 'none',
          'height': ''
        });
      }
    },
    clearCompleted: function() {
      _.invoke(Assignments.done(), "destroy");
      return false;
    },
    toggleAllComplete: function() {
      var done = this.allCheckbox.checked;
      Assignments.each(function(assignment) {
        return assignment.save({
          completed: done
        });
      });
    }
  });
  var App = window.App = new AppView;
});
