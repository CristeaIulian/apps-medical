<?php

class Router {
  public static function get_route($routes) {
    foreach ($routes as $route) {
      if ($routeMatch = Router::_parse_route($route)) {
        return $routeMatch;
      }
    }

    return [
      'controller' => 'NotFoundController',
      'action' => 'index'
    ];
  }

  private static function _parse_route($route) {
    preg_match($route, $_SERVER['REDIRECT_URL'], $matches); // REQUEST_URI

    if ($matches) {
      $rs = ['full_url' => $matches[0]];
      $rs['controller'] = isset($matches[1]) ? (ucfirst($matches[1]) . 'Controller') : null;
      $rs['action'] = isset($matches[2]) ? $matches[2] : 'index';

      if (isset($matches[3])) {
        $rs['param'] = $matches[3];
      }

      return $rs;
    }

    return null;
  }
}
