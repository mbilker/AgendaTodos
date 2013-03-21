function downloadTemplate(templateLocation) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var script = document.createElement('script');
      script.type = 'text/template';
      script.innerHTML = xhr.responseText;
      document.body.appendChild(script);
    }
  }
  xhr.open('GET', templateLocation, true);
  xhr.send(null);
}

downloadTemplate('/templates/stats-template');
downloadTemplate('/templates/item-template');
