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

  var Config = {
    IS_FIREFOX: !!navigator.userAgent.match(/firefox/i),
    IS_IE: !!navigator.userAgent.match(/MSIE/i),
    FIREFOX_TIMEOUT: 50
  };

  var currentScript = document.currentScript;
  if (currentScript == null) {
    var scripts = document.getElementsByTagName('script');
    currentScript = scripts[scripts.length - 1];
  }

  var iframe = document.createElement('iframe');

  if (currentScript.id) {
    iframe.id = currentScript.id;
    currentScript.id = 'mif-script-' + currentScript.id;
  }

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

  var _reload = iframe.reload;
  iframe.reload = function(url, base) {
    if (url != null) {
      iframe.setAttribute('data-src', url);
    }

    if (base == null) {
      iframe.removeAttribute('data-base');
    } else {
      iframe.setAttribute('data-base', base);
    }

    loadFrame(iframe.getAttribute('data-src'));
  };

  var frameSize = function() {
    if (!iframe.contentWindow || !iframe.contentWindow.document || !iframe.contentWindow.document.documentElement) return;
    var doc = iframe.contentWindow.document.documentElement;
    iframe.height = Config.IS_IE ? doc.scrollHeight : doc.offsetHeight; // scrollHeight randomly adds 50% height in Firefox...
  };

  var frameReady = function ready(fn) {
    if (!iframe.contentWindow || !iframe.contentWindow.document || !iframe.contentWindow.document.documentElement) return;

    if (iframe.contentWindow.document.readyState != 'loading' && iframe.contentWindow.document.readyState != 'uninitialized') {
      fn();
    } else if (iframe.contentWindow.document.addEventListener) {
      iframe.contentWindow.document.addEventListener('DOMContentLoaded', fn);
    } else {
      iframe.contentWindow.document.attachEvent('onreadystatechange', function() {
        if (iframe.contentWindow.document.readyState != 'loading')
          fn();
      });
    }
  };

  var linkHandler = function (event) {
    var elem = event.target;
    if (elem.nodeName !== 'A' || !elem.attributes.href) return;

    var href = elem.attributes.href.value;
    if (href.match(/^javascript:/i)) return;
    
    event.preventDefault();

    var a = document.createElement('a');
    a.href = href;

    switch (elem.target) {
    case '_self':
      iframe.src = a.href;
      break;
    case '_blank':
      window.open(a.href);
      break;
    case '_top':
      window.top.location = a.href;
    case '_parent':
    default:
      window.parent.location = a.href;
    }
  };

  var fixFrameLinks = function () {
    var root = iframe.contentWindow.document.documentElement;

    if (root.addEventListener) {
      root.removeEventListener('click', linkHandler);
      root.addEventListener('click', linkHandler);
    } else {
      root.detachEvent('onclick', linkHandler);
      root.attachEvent('onclick', function() {
        linkHandler.call(root);
      });
    }
  };

  var content_counter = 0; // change frame content variable name so frame reloads properly
  var populateFrame = function (body, className) {
    var base = iframe.getAttribute('data-base');
    if (base != null && base != '') {
      var baseTag = '<base href="' + base + '" />';
      body = body.replace('<head>', '<head>' + baseTag);
    }

    delete iframe.contentWindow['mif_content' + content_counter];
    content_counter++;

    iframe.contentWindow['mif_content_' + content_counter] = body;

    iframe.style.minHeight = 0;
    iframe.src = 'javascript:window["mif_content_' + content_counter + '"]';
    iframe.className = className;

    /* FFFFFFFFUUUUUUUUUUUUUU CHROME ... remove this dirty shit ASAP! */
    iframe.style.display = 'inline-block';
    setTimeout(function () {
        iframe.style.display = 'block';
    }, 10);

    if (Config.IS_FIREFOX || Config.IS_IE) {
      // DOM is not ready immediately in IE/Firefox but readyState='loaded' because screw logic
      setTimeout(function() {
        frameReady(fixFrameLinks);
      }, Config.FIREFOX_TIMEOUT);
    } else {
      frameReady(fixFrameLinks);
    }
  };

  populateFrame('Loading...', 'mif-loading');

  var loadFrame = function(url) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var doPopulate = function() {
              populateFrame(xhr.responseText, 'mif-loaded');
            };

            if (Config.IS_FIREFOX) {
              setTimeout(doPopulate, Config.FIREFOX_TIMEOUT);
            } else {
              doPopulate();
            }
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
      xhr.onprogress = function(){}; // WTF IE "IE9 RTM - XDomainRequest issued requests may abort if all event handlers not specified" (http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e)
      xhr.onload = function() {
        populateFrame(xhr.responseText, 'mif-loaded');
      };
      xhr.onerror = function() {
        alert('Error loading (XDR)!');
      };
    }

    if (xhr != null) {
      populateFrame('Loading...', 'mif-loading');

      xhr.open('GET', url, true);
      if ('withCredentials' in xhr) xhr.withCredentials = true;
      xhr.send(null);
    }
  };

  var url = currentScript.getAttribute('data-url');
  if (url == null) {
    var a = document.createElement('a');
    a.href = currentScript.src;
    
    url = window.location.protocol + '//' + a.hostname;
    if (a.port != 80) url += ':' + a.port;
  }

  iframe.reload(url, currentScript.getAttribute('data-base') || url);

  requestAnimationFrame(function af() {
    frameSize();
    requestAnimationFrame(af);
  });
  
})();
