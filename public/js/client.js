var Test;

$(function() {
  var TestModel = Backbone.Model.extend({
    initialize: function() {
      console.log('initialized new model');
    }
  });

  var TestCollection = Backbone.Collection.extend({
    model: TestModel,
    url: '/assignments.json'
  });

  Test = new TestCollection();

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
});