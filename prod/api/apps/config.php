<?php

define('APPS_FOLDER', __DIR__ . DIRECTORY_SEPARATOR);
define('LIBS_FOLDER', APPS_FOLDER . 'libs' . DIRECTORY_SEPARATOR);
define('CLASSES_FOLDER', LIBS_FOLDER . 'classes' . DIRECTORY_SEPARATOR);
define('CONTROLLERS_FOLDER', LIBS_FOLDER . 'controllers' . DIRECTORY_SEPARATOR);
define('ASSETS_FOLDER', __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data-files' . DIRECTORY_SEPARATOR);

define('LOCALHOST_IP', '127.0.0.1');
define('DB_HOST', LOCALHOST_IP);
define('IS_DEBUG', TRUE);

if ($_SERVER['SERVER_ADDR'] === LOCALHOST_IP) {
    define('DB_NAME', 'memobit_apps');
    define('DB_USER', 'memobit_apps');
    define('DB_PASS', 'eOuD$94cMb9Hu@$s3@XE');
} else {
    define('DB_NAME', 'memobit_apps');
    define('DB_USER', 'memobit_apps');
    define('DB_PASS', 'eOuD$94cMb9Hu@$s3@XE');
}
