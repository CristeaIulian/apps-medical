<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('Europe/Bucharest');

if (!isset($_SESSION['ZA_SESSION']) && !isset($_COOKIE['rt']) && $_SERVER['REMOTE_ADDR'] !== '127.0.0.1') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Session expired. Please re-login.'
    ]);
    die;
}

require(__DIR__ . '/config.php');

require(APPS_FOLDER . 'Loaders.php');

require(__DIR__ . '/routes.php');

$route = Router::get_route($routes);

function outputHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=utf-8");
    header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT,DELETE");
    header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
}
// echo $route['controller'];
// die;
if ($route) {
    if (isset($route['controller']) && $route['controller']) {

        if (class_exists($route['controller'])) {
            $controller = new $route['controller'];

            if (method_exists($controller, $route['action'])) {
                $controller->{$route['action']}($route);
            } else {
                die('Action <strong>' . $route['action'] . '</strong> does not exist.');
            }
        } else {
            die('<strong>Route cannot be found</strong>.');
        }
    }
}
