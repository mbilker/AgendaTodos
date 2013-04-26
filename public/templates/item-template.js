<div class="view">
  <label class="checkbox">
    <input class="toggle" type="checkbox" <%= completed ? 'checked="checked"' : '' %> /><%- title %>
  </label>
  <p>Due: <%= new Date(dueDate).toDateString() %> - Priority: <%- priority %></p>
  <a class="priority priority<%- priority %>"></a>
  <a class="destroy"></a>
</div>
<input class="edit" type="text" value="<%- title %>" />
