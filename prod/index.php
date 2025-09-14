<?php
session_start();

// if prod - keep it only on https
if ($_SERVER['HTTP_HOST'] === 'medical.memobit.ro' && !isset($_SERVER['HTTPS'])) {
  header('location: https://medical.memobit.ro' . (isset($_SERVER['REDIRECT_URL']) ? $_SERVER['REDIRECT_URL'] : ''));
  die;
}

$message = '';
$allGood = true;

if (isset($_POST) && count($_POST)) {
  if (isset($_POST['user'], $_POST['password'])) {
    if ($_POST['user'] === 'iulian' && sha1($_POST['password'])==='ad04b275083c471fd2b2d5fc40d40690028426cf') {
      $_SESSION['ZA_SESSION'] = 'vg546wBE&^JNESB$gv544b5bg56JN&^%';

      if (isset($_POST['keep_me_logged_in']) && $_POST['keep_me_logged_in'] === 'on') {
        $token = bin2hex(random_bytes(32));
        setCookie('rt', $token, time() + (30 * 24 * 60 * 60)); // 30 days
      } else {
        setCookie('rt', '', time()); // invalidate if exists
      }

      if (isset($_SERVER['REDIRECT_URL'])) {
        header('location: ' . $_SERVER['REDIRECT_URL']);
        die;
      }
    } else {
      $message = 'Invalid credentials';
      $allGood = false;
    }
  } else {
    die('No data');
  }
}

if (isset($_GET['arg']) && $_GET['arg'] === 'logout') {
    setCookie('rt', '', time()); // invalidate
    unset($_SESSION['ZA_SESSION']);
    session_destroy();
    header('location: /');
    die;
}

$filename = (isset($_SESSION['ZA_SESSION']) && $_SESSION['ZA_SESSION'] === 'vg546wBE&^JNESB$gv544b5bg56JN&^%' || isset($_COOKIE['rt'])) ? 'admin' : 'login';

switch ($filename) {
  case 'login':
    header("Access-Control-Allow-Origin: *");
    $file = file_get_contents("api/templates/" . $filename . ".template.html");
    $file = str_replace('{{message}}', $message, $file);
    break;
  case 'admin':

    $file = file_get_contents('public/index.html');

    $tagAttributes = 'href|src';
    $fileMatch = '[^\"]+';

    $pattern = "/($tagAttributes)(\=\")($fileMatch)(\")/";
    $file = preg_replace($pattern, "$1$2./public$3$4$5$6$7$8", $file);
    break;
  default:
    break;
}

echo $file;
