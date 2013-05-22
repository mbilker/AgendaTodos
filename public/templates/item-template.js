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
