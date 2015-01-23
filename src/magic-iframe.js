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

  var url = currentScript.getAttribute('data-url');
  if (url == null) {
    var a = document.createElement('a');
    a.href = currentScript.src;
    
    url = window.location.protocol + '//' + a.hostname;
    if (a.port != 80) url += ':' + a.port;
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

  var _reload = iframe.reload;
  iframe.reload = function() {
    loadFrame(iframe.getAttribute('data-src'));
  };

  var frameSize = function() {
    if (!iframe.contentWindow) return false;
    iframe.height = iframe.contentWindow.document.documentElement.offsetHeight;
  };

  requestAnimationFrame(function af() {
    if (frameSize() === false) return;
    requestAnimationFrame(af);
  });

  var populateFrame = function (body) {
    iframe.contentWindow.contents = body;
    iframe.style.minHeight = 0;
    iframe.src = '';
    iframe.src = 'javascript:window["contents"]';
  };

  var loadFrame = function(url) {
    iframe.setAttribute('data-src', url);

    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            populateFrame(xhr.responseText);
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
        populateFrame(xhr.responseText);
      };
      xhr.onerror = function() {
        alert('Error loading (XDR)!');
      };
    }

    if (xhr != null) {
      populateFrame('Loading...');

      xhr.open('GET', url, true);
      xhr.send();
    }
  };

  loadFrame(url);
  
})();
