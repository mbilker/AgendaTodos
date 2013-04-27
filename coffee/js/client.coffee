readScript = (script) ->
  xhr = new XMLHttpRequest()
  xhr.open "GET", script, false
  xhr.send null
  x = xhr.responseText
  x

$ ->  
  #Backbone.emulateHTTP = true;
  #Backbone.emulateJSON = true;
  Assignment = Backbone.Model.extend(
    urlRoot: "/assignments/sync"
    idAttribute: "_id"
    defaults:
      title: "empty assignment..."
      dueDate: new Date()
      priority: 0
      completed: false

    initialize: ->
      @set title: @defaults().title  unless @get("title")

    toggle: ->
      @save completed: not @get("completed")
  )
  AssignmentList = Backbone.Collection.extend(
    model: Assignment
    url: "/assignments/sync"
    done: ->
      @filter (assignment) ->
        assignment.get "completed"


    remaining: ->
      @without.apply this, @done()

    comparator: (assignment) ->
      a = -(assignment.get("priority") + 1) + new Date(assignment.get("dueDate")).getTime()
      a
  )
  Assignments = new AssignmentList()
  AssignmentView = Backbone.View.extend(
    tagName: "li"
    template: _.template(readScript("/templates/item-template.js"))
    events:
      "click .toggle": "toggleDone"
      "dblclick .view": "edit"
      "click a.destroy": "clear"
      "keypress .edit": "updateOnEnter"
      "blur .edit": "close"

    initialize: ->
      @listenTo @model, "change", @render
      @listenTo @model, "destroy", @remove

    render: ->
      @$el.html @template(@model.toJSON())
      @$el.toggleClass "done", @model.get("completed")
      @input = @$(".edit")
      this

    toggleDone: ->
      @model.toggle()

    edit: ->
      @$el.addClass "editing"
      @input.focus()

    close: ->
      value = @input.val()
      unless value
        @clear()
      else
        @model.save title: value
        @$el.removeClass "editing"

    updateOnEnter: (e) ->
      @close()  if e.keyCode is 13

    clear: ->
      @model.destroy()
  )
  AppView = Backbone.View.extend(
    el: $("#app")
    statsTemplate: _.template(readScript("/templates/stats-template.js"))
    events:
      "keypress #new-assignment": "createOnEnter"
      "focus #new-assignment": "focusAssignment"
      "blur #new-assignment": "blurAssignment"
      "click #submit": "createOnEnter"
      "click #clear-completed": "clearCompleted"
      "click #toggle-all": "toggleAllComplete"

    initialize: ->
      @input = @$("#new-assignment")
      @dueDate = @$("#dueDate")
      @priority = @$("#priority")
      @allCheckbox = @$("#toggle-all")[0]
      @expand = @$("#expand")
      
      #this.listenTo(Assignments, 'add', this.addOne);
      #this.listenTo(Assignments, 'reset', this.addAll);
      @listenTo Assignments, "all", (ev) ->
        console.log "all:", ev
        @render()

      @listenTo Assignments, "reset", @sortComplete
      @listenTo Assignments, "sort", @sortComplete
      @footer = @$("footer")
      @main = $("#main")
      Assignments.fetch()

    resort: ->
      Assignments.sort silent: true

    sortComplete: ->
      @$("#assignment-list").empty()
      @addAll()

    render: ->
      done = Assignments.done().length
      remaining = Assignments.remaining().length
      if Assignments.length
        @main.show()
        @footer.show()
        @footer.html @statsTemplate(
          done: done
          remaining: remaining
        )
      else
        @main.hide()
        @footer.hide()
      @allCheckbox.checked = not remaining

    addOne: (assignment) ->
      view = new AssignmentView(model: assignment)
      @$("#assignment-list").append view.render().el

    addAll: ->
      Assignments.each @addOne, this

    createOnEnter: (e) ->
      return  if e.type is "keypress" and e.keyCode isnt 13
      unless @input.val()
        return @input.parents(".control-group").addClass("warning")
      else
        @input.parents(".control-group").removeClass "warning"
      unless @dueDate.val()
        return @dueDate.parents(".control-group").addClass("warning")
      else
        @dueDate.parents(".control-group").removeClass "warning"
      date = @dueDate.val().split("-")
      date = new Date(date[0], date[1] - 1, date[2])
      priority = Number(@priority.val()) or 0
      Assignments.create
        title: @input.val()
        dueDate: date
        priority: priority

      @input.val ""
      @priority.val ""
      @dueDate.val ""
      @expand.slideUp()

    focusAssignment: ->
      @expand.slideDown()

    blurAssignment: ->
      @expand.slideUp()  if @input.val() is ""

    clearCompleted: ->
      _.invoke Assignments.done(), "destroy"
      false

    toggleAllComplete: ->
      done = @allCheckbox.checked
      Assignments.each (assignment) ->
        assignment.save completed: done

  )
  App = new AppView
  window.App = App
  window.Assignments = Assignments
  return
