<?php
header('Access-Control-Allow-Origin: *');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IFrame Test</title>

  <style>
  @-webkit-keyframes height-anim {
      0%   { height: 0; }
      100% { height: 200px; }
    }
    @-moz-keyframes height-anim {
      0%   { height: 0; }
      100% { height: 200px; }
    }
    @-o-keyframes height-anim {
      0%   { height: 0; }
      100% { height: 200px; }
    }
    @keyframes height-anim {
      0%   { height: 0; }
      100% { height: 200px; }
    }

    body {
      border: solid 2px red;
    }

    #animate.on {
      -webkit-animation: height-anim 1.5s ease-in-out infinite alternate;
      -moz-animation:    height-anim 1.5s ease-in-out infinite alternate;
      -o-animation:      height-anim 1.5s ease-in-out infinite alternate;
      animation:         height-anim 1.5s ease-in-out infinite alternate;
    }
  </style>
</head>
<body>
  <h1>This is inside the iframe</h1>

  <h2>iframe &lt;body&gt; is outlined in red.</h2>

  <p id="lipsum">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam aliquam corrupti nisi, sapiente commodi sunt officia, recusandae blanditiis inventore pariatur. Harum aliquam consectetur amet, hic? Odio explicabo adipisci, nobis illum.</p>

  <button type="button" id="lipsum_btn">Add more lorem ipsum</button>
  <button type="button" id="animate_btn">Toggle height animation</button>

  <div id="animate"></div>

  <script>
    (function() {
      var lipsum = document.getElementById('lipsum_btn');
      var animate = document.getElementById('animate');

      document.getElementById('lipsum_btn').addEventListener('click', function() {
        var p = document.createElement('p');
        p.innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam aliquam corrupti nisi, sapiente commodi sunt officia, recusandae blanditiis inventore pariatur. Harum aliquam consectetur amet, hic? Odio explicabo adipisci, nobis illum.';
        lipsum.parentNode.insertBefore(p, lipsum);
      });

      document.getElementById('animate_btn').addEventListener('click', function() {
        if (animate.className == 'on') animate.className = '';
        else animate.className = 'on';
      });
    })()
  </script>
</body>
</html>