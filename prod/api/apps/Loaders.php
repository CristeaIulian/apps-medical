<?php

spl_autoload_register(function ($classname) {
    $paths = array(
        CLASSES_FOLDER,
        CONTROLLERS_FOLDER
    );

    foreach ($paths as $path) {
        if (file_exists($path . $classname . '.class.php')) {
            require_once($path . $classname . '.class.php');
        }       
    }
});
