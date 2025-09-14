<?php

class Arrays {
    public static function init($language) {

    }

    public static function in_iarray($needle, $haystack) {
        if (is_array($haystack)) {
            for ($i = 0; $i < count($haystack); $i++) {
                if (strtolower($haystack[$i]) === strtolower($needle)) {
                    return $haystack[$i];
                }
            }
        
            return false;
        }

        echo 'in_iarray() expects parameter 2 to be array, ' . gettype($haystack) . ' given.';
    }

    public static function stringsToNumbers($arr) {
        $rs = [];

        foreach ($arr as $value) {
            $rs[] = (int)trim($value);
        }

        return $rs;
    }

    // public static function string_ends_with($haystack, $needle, $caseSensitive = false) {
    //     foreach ($needle as $item) {
    //         if (Strings::match_string(substr($haystack, strlen($item) * -1), $item)) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }
}
