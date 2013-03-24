function downloadTemplate(template) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var script = document.createElement('script');
      script.type = 'text/template';
      script.id = template;
      script.innerHTML = xhr.responseText;
      document.body.appendChild(script);
    }
  }
  xhr.open('GET', '/templates/' + template, true);
  xhr.send(null);
}

downloadTemplate('stats-template');
downloadTemplate('item-template');
