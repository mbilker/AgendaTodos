var App;

$(function() {
  $('#logout').click(function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
      var element = $(this),
          form = $('<form></form>');
      form
        .attr({
          method: 'POST',
          action: '/sessions'
        })
        .hide()
        .append('<input type="hidden" />')
        .find('input')
        .attr({
          'name': '_method',
          'value': 'delete'
        })
        .end()
        .appendTo('body')
        .submit();
    }
  });

  var Assignment = Backbone.Model.extend({
    defaults: {
      title: "empty assignment...",
      completed: false
    },
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    },
    toggle: function() {
      this.save({completed: !this.get("completed")});
    }
  });

  var AssignmentList = Backbone.Collection.extend({
    model: Assignment,
    url: '/assignments/sync',
    done: function() {
      return this.filter(function(assignment) { return assignment.get('completed'); });
    },
    remaining: function() {
      return this.without.apply(this, this.done());
    }
  });

  var Assignments = new AssignmentList();

  var AssignmentView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#item-template').html()),
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },
    toggleDone: function() {
      this.model.toggle();
    },
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },
    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
    clear: function() {
      this.model.destroy();
    }
  });

  var AppView = Backbone.View.extend({
    el: $("#container"),
    statsTemplate: _.template($('#stats-template').html()),
    events: {
      "keypress #new-assignment":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },
    initialize: function() {

      this.input = this.$("#new-assignment");
      this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(Assignments, 'add', this.addOne);
      this.listenTo(Assignments, 'reset', this.addAll);
      this.listenTo(Assignments, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      Assignments.fetch();
    },
    render: function() {
      var done = Assignments.done().length;
      var remaining = Assignments.remaining().length;

      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }

      this.allCheckbox.checked = !remaining;
    },
    addOne: function(assignment) {
      var view = new AssignmentView({model: assignment});
      this.$("#assignment-list").append(view.render().el);
    },
    addAll: function() {
      Todos.each(this.addOne, this);
    },
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Assignments.create({title: this.input.val()});
      this.input.val('');
    },
    clearCompleted: function() {
      _.invoke(Assignments.done(), 'destroy');
      return false;
    },
    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Assignments.each(function(assignment) { assignment.save({'completed': done}); });
    }
  });

  App = new AppView;
});
