# Magic IFrame

Easy, responsive IFrames - Magic!

## What is this "magic" IFrame?

Magic IFrame is a script to make `iframe`s responsive.

## Supported Browsers

This script relies on `window.postMessage` for communication between the parent and child pages. It also uses `requestAnimationFrame` but has a `setTimout`-based fallback for it. Currently, this works in all modern browsers and IE8+.

It requires JavaScript to work and there is no non-JavaScript fallback. Put down your tinfoil hats.

## Usage — Inside IFrame

Include the following `script` tag inside the `iframe`:

```
<script src="magic-iframe.min.js" data-role="child"></script>
```

## Usage — Embedding the IFrame

There are three ways to embed the responsive `iframe` in your page:

### 1. No existing IFrame tag

```
<script src="magic-iframe.min.js" data-role="parent" data-url="{{IFRAME_URL}}"></script>
<noscript><iframe src="{{IFRAME_URL}}" frameborder="0" style="width:100%;height:{{IFRAME_HEIGHT}}"></iframe></noscript>
```

The script will automatically write the `iframe` tag for you in its place.

If id or class attributes are present on the `script` tag, they will be transferred to the generated `iframe` tag. If an `id` is specified, the script will assign itself an ID in the format `mif-script-{{ORIGINAL_ID}}`.

### 2. Existing IFrame tag, method 1

```
<iframe id="{{IFRAME_ID}}" src="{{IFRAME_URL}}" frameborder="0" style="width:100%;height:{{IFRAME_HEIGHT}}"></iframe>
<script src="magic-iframe.min.js" data-role="parent" data-target="#{{IFRAME_ID}}"></script>
```

The `data-target` attribute can accept a selector that can be passed to `document.querySelectorAll` (jQuery will be used as a fallback). If the browser does not support `document.querySelectorAll` and jQuery is not present, only simple ID selectors are allowed.

If both the `data-target` and `data-url` attributes are present, both behaviors will be executed.

### 3. Existing IFrame tag, method 2

```
<iframe id="{{IFRAME_ID}}" src="{{IFRAME_URL}}" frameborder="0" style="width:100%;height:{{IFRAME_HEIGHT}}"></iframe>
<script src="magic-iframe.min.js"></script>
<script>
  MagicIframe.parent('#{{IFRAME_ID}}').init();
  // ... or ...
  MagicIframe.parent('[selector]').init();
  // ... or ...
  MagicIframe.parent(document.querySelector('[selector]')).init();
  // ... or ... (with jQuery)
  $('[selector]').magicIframe();
</script>
```

The selector rules above apply here. This method may be used alongside the two other methods without any conflicts.

If the `iframe` tag is not present on the page when the script is loaded (when loaded with AJAX for example), this method can be used to enable magic IFrame support on it.

## Questions/Comments/Issues

Please submit an issue on this GitHub project. Pull requests are welcome!

## Contributing

Clone, modify, use grunt to build, pull request. Thanks!