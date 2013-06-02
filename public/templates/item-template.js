<div class="view">
  <label class="checkbox">
    <input class="toggle" type="checkbox" <%= completed ? 'checked="checked"' : '' %> /><span class="title"><%- title %></span>
  </label>
  <span class="details">Due: <%= new Date(dueDate).toDateString() %> - Priority: <%- priority %></span>
  <a class="edit-text">Edit</a>
  <span class="priority priority<%- priority %>"></span>
  <a class="destroy"></a>
</div>
<input class="edit input-block-level" type="text" value="<%- title %>" />

<div class="modal hide fade" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3>Edit Task</h3>
  </div>
  <div class="modal-body">
    <div class="form-horizontal">
      <div class="control-group">
        <label for="priority" class="control-label">Priority</label>
        <div class="controls">
          <input id="priority" type="number" min="0" max="9" placeholder="<%- priority %>" class="span1" value="<%- priority %>">
        </div>
      </div>
      <div class="control-group">
        <label for="dueDate" class="control-label">Due Date</label>
        <div class="controls">
          <input id="dueDate" type="date" class="span2" min="<%= formatDateInput(new Date(dueDate)) %>" value="<%= formatDateInput(new Date(dueDate)) %>">
        </div>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
    <button class="btn btn-primary save-changes">Save changes</button>
  </div>
</div>
