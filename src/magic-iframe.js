(function() {
  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function (callback, element) {
               window.setTimeout(callback, 1000/60);
           };
  })();

  var currentScript = document.currentScript;
  if (currentScript == null) {
    var scripts = document.getElementsByTagName('script');
    currentScript = scripts[scripts.length - 1];
  }

  var a = document.createElement('a');
  a.href = currentScript.src;

  var url = null;
  if (currentScript.attributes['data-url'] == null) {
    var a = document.createElement('a');
    a.href = currentScript.src;
    
    url = window.location.protocol + '//' + a.hostname;
    if (a.port != 80) url += ':' + a.port;
  } else {
    url = currentScript.attributes['data-url'].value;
  }

  var iframe = document.createElement('iframe');
  iframe.src = 'about:blank';
  iframe.frameBorder = 0;
  iframe.scrolling = 'no';
  iframe.allowfullscreen = 'true';
  iframe.style.display = 'block';
  iframe.style.webkitBoxSizing = 'border-box';
  iframe.style.mozBoxSizing = 'border-box';
  iframe.style.boxSizing = 'border-box';
  iframe.style.width = '100%';
  iframe.style.minHeight = '2em';
  iframe.style.overflow = 'hidden';
  currentScript.parentNode.insertBefore(iframe, currentScript.nextSibling);

  iframe.contentWindow.loadingContents = 'Loading...';
  iframe.src = 'javascript:window["loadingContents"]';

  var frameSize = function() {
    iframe.height = iframe.contentWindow.document.documentElement.offsetHeight;
  };

  var loadFrame = function(body) {
    iframe.contentWindow.contents = body;
    iframe.style.minHeight = 0;
    iframe.src = 'javascript:window["contents"]';

    requestAnimationFrame(function af() {
      frameSize();
      requestAnimationFrame(af);
    });
  };

  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          loadFrame(xhr.responseText);
        } else if (xhr.status == 0) {
          alert('Missing access control headers!');
        } else {
          alert('Error loading (XHR)!');
        }
      }
    };
  } else if (typeof window.XDomainRequest === 'undefined') {
    iframe.src = url;
    iframe.style.minHeight = 0;
    xhr = null;
  } else {
    xhr = new XDomainRequest();
    xhr.onload = function() {
      loadFrame(xhr.responseText);
    };
    xhr.onerror = function() {
      alert('Error loading (XDR)!');
    };
  }

  if (xhr != null) {
    xhr.open('GET', url, true);
    xhr.send();
  }
})();
