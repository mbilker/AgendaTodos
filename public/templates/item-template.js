<div class="view">
  <label class="checkbox">
    <input class="toggle" type="checkbox" <%= completed ? 'checked="checked"' : '' %> /><span class="title"><%- title %></span>
  </label>
  <span class="details">Due: <%= new Date(dueDate).toDateString() %> - Priority: <%- priority %></span>
  <a class="priority priority<%- priority %>"></a>
  <a class="destroy"></a>
</div>
<input class="edit" type="text" value="<%- title %>" />
