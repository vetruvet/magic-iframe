<?php

header('Access-Control-Allow-Origin: *');

if (empty($_GET['url'])) die('No URL specified');

$ch = curl_init($_GET['url']);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    // 'Authorization: '.$_SERVER['HTTP_AUTHORIZATION'],
    // 'Cookie: '.$_SERVER['HTTP_COOKIE'],
    // 'Pragma: no-cache',
    'Referer: '.$_SERVER['HTTP_REFERER'],
    'User-Agent: '.$_SERVER['HTTP_USER_AGENT'],
));
curl_exec($ch);
curl_close($ch);
