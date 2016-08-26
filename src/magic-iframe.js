(function() {
  'use strict';
  
  if (!window.postMessage) {
    if (window.console) {
      var error = 'MIF: no postMessage support. MIF terminating.';

      if (console.error) console.error(error);
      else if (console.warn) console.warn(error);
      else if (console.log) console.log(error);
    }
    return;
  }

  var requestAnimationFrame = (function() {
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function (callback) {
          window.setTimeout(callback, 1000/60);
        };
  })();

  var currentScript = document.currentScript;
  if (currentScript == null) {
    var scripts = document.getElementsByTagName('script');
    currentScript = scripts[scripts.length - 1];
  }

  var _registeredParentListeners = false;
  var registerParentListeners = function () {
    if (_registeredParentListeners) return;

    if (window.addEventListener) {
      window.addEventListener('message', function(e) {
        handleMessage(e);
      }, false);
    } else if (window.attachEvent) {
      window.attachEvent('onmessage', function(e) {
        handleMessage(e);
      });
    }

    _registeredParentListeners = true;
  };

  var registeredIframes = [];
  var initParent = function (element) {
    if (element.length) {
      for (var q = 0; q < element.length; q++) {
        initParent(element[q]);
      }
      return;
    }

    registerParentListeners();

    registeredIframes.push(element);
  };

  var encodeMessage = function (message) {
    var messageStr = '';

    if (message == null || (typeof message) !== 'object') return messageStr;

    for (var key in message) {
      if (!message.hasOwnProperty(key)) continue;

      if (messageStr.length) messageStr += '&';
      messageStr += key;
      messageStr += '=';
      messageStr += encodeURIComponent(message[key]);
    }

    return messageStr;
  };

  var decodeMessage = function (messageStr) {
    var message = {};

    messageStr += ''; // force to string
    if (!messageStr.length) return message;

    var messageParts = messageStr.split('&');

    for (var q = 0; q < messageParts.length; q++) {
      var part = messageParts[q].split('=', 2);
      message[part[0]] = decodeURIComponent(part[1]);
    }

    return message;
  };

  var getFullHeight = function () {
    return Math.max(
        document.documentElement.offsetHeight,
        document.documentElement.scrollHeight
    );
  };

  var _childInitialized = false;
  var initChild = function () {
    if (window === top) {
      // console.warn('MIF: not running in iframe. MIF init skipped');
      return;
    }

    if (_childInitialized) return;

    var messageParent = function () {
      var message = encodeMessage({
        h: getFullHeight()
      });

      parent.postMessage(message, '*');
    };

    requestAnimationFrame(function af() {
      messageParent();
      requestAnimationFrame(af);
    });

    _childInitialized = true;
  };

  var getSourceIframe = function (event) {
    var frames = document.getElementsByTagName('iframe');

    for (var q = 0; q < frames.length; q++) {
      if (frames[q].contentWindow === event.source) {
        return frames[q];
      }
    }

    return null;
  };

  var handleMessage = function (event) {
    var iframe = getSourceIframe(event);
    var message = decodeMessage(event.data);

    if (!message.h) return;

    setHeight(iframe, message.h);
  };

  var setHeight = function (iframe, height) {
    iframe.height = height;
    iframe.style.height = height + 'px';
  };

  var initParentBySelector = function (selector) {
    var elem;

    if (document.querySelectorAll) {
      elem = document.querySelectorAll(selector);
    } else if (window.jQuery) {
      elem = jQuery(selector);
    } else if (selector.match(/^#[a-z0-9_-]+$/i)) {
      elem = [document.getElementById(selector.substring(1))];
    } else {
      if (window.console) {
        var error = 'MIF: no querySelectorAll, jQuery, or simple selector. MIF target ignored.';

        if (console.error) console.error(error);
        else if (console.warn) console.warn(error);
        else if (console.log) console.log(error);
      }

      return;
    }

    for (var q = 0; q < elem.length; q++) {
      MagicIframe.parent(elem[q]).init();
    }
  };

  var initParentByURL = function (url) {
    var iframe = document.createElement('iframe');

    if (currentScript.id) {
      iframe.id = currentScript.id;
      currentScript.id = 'mif-script-' + currentScript.id;
    }
    if (currentScript.className) {
      iframe.className = currentScript.className;
      currentScript.className = '';
    }

    iframe.src = url;
    iframe.frameBorder = 0;
    iframe.scrolling = 'no';
    iframe.allowFullscreen = 'true';
    iframe.style.display = 'block';
    iframe.style.webkitBoxSizing = 'border-box';
    iframe.style.mozBoxSizing = 'border-box';
    iframe.style.boxSizing = 'border-box';
    iframe.style.width = '100%';
    iframe.style.overflow = 'hidden';
    currentScript.parentNode.insertBefore(iframe, currentScript.nextSibling);

    MagicIframe.parent(iframe).init();
  };

  var MagicIframe = window.MagicIframe = {
    child: function () {
      return {
        init: initChild
      }
    },

    parent: function (element) {
      return {
        init: function () { initParent(element); }
      }
    },

    init: function () {
      return {
        parent: initParent,
        child: initChild
      }
    }
  };

  if (window.jQuery) {
    jQuery.fn.magicIframe = function() {
      this.each(function() {
        MagicIframe.parent(this).init();
      });

      return this;
    };
  }

  var role = currentScript.getAttribute('data-role');
  role = (role || '').toLowerCase();

  if (role === 'child') {
    MagicIframe.child().init();
  } else if (role === 'parent') {
    var target = currentScript.getAttribute('data-target');
    target = target || '';

    if (target.length) {
      initParentBySelector(target);
    }

    var url = currentScript.getAttribute('data-url');
    url = url || '';

    if (url.length) {
      initParentByURL(url);
    }
  }
})();
