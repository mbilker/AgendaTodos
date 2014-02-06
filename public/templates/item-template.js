<div class="view">
  <div class="checkbox">
    <label>
      <input class="toggle" type="checkbox" <%= completed ? 'checked="checked"' : '' %> /><%- title %>
    </label>
  </div>
  <span class="details">Due: <%= new Date(dueDate).toDateString() %> - Priority: <%- priority %></span>
  <a class="edit-text">Edit</a>
  <span class="priority priority<%- priority %>"></span>
  <a class="destroy"></a>
</div>

<div class="modal hide fade" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3>Edit Task</h3>
  </div>
  <div class="modal-body">
    <div class="form-horizontal">
      <div class="control-group">
        <label class="control-label">Title</label>
        <div class="controls">
          <input class="title-edit span3" type="text" min="0" max="9" placeholder="<%- title %>" value="<%- title %>">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Priority</label>
        <div class="controls">
          <input class="priority-edit span3" type="number" min="0" max="9" placeholder="<%- priority %>" value="<%- priority %>">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Due Date</label>
        <div class="controls">
          <input class="dueDate-edit span3" type="date" min="<%= formatDateInput(new Date(dueDate)) %>" value="<%= formatDateInput(new Date(dueDate)) %>">
        </div>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
    <button class="btn btn-primary save-changes">Save changes</button>
  </div>
</div>
