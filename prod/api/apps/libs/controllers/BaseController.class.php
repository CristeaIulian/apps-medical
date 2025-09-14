<?php

class BaseController {
    protected $_posterBasePath = 'https://image.tmdb.org/t/p/w500';
    protected $post = null;
    private $_assetsFolder = null;
    protected $orm;

    public function __construct() {
        $this->_assetsFolder = $_SERVER['DOCUMENT_ROOT'] . '//data-files/';

        $this->orm = new ORM();

        $this->post = json_decode(file_get_contents('php://input'), true);

        if (!in_array(strtoupper($_SERVER['REQUEST_METHOD']), ['GET', 'POST', 'PUT', 'DELETE'])) {
            // ignore rest and give no answer to preflight
            die;
        }
    }

    protected function output($data) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        die;
    }

    protected function save_newly_list_and_get_ids($table, $column, $arr) {
        $sqlError = false;

        foreach ($arr as $key => $value) {
            if (!is_int($value)) {
                $this->orm->ignore_insert();
                $arr[$key] = $this->orm->insert($table, [$column => $value]);
            }
        }

        return $arr;
    }

    protected function is_input_valid($data, $allowedKeys) {
        foreach($allowedKeys as $key) {
            if (is_array($data)) {
                if (array_key_exists($key, $data)) {
                    unset($data[$key]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'error' => 'There was an error. ' . (IS_DEBUG ? '`' . $key . '` does not exist.' : '')
                    ]);

                    die;
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'There was an error. ' . (IS_DEBUG ? '`' . $key . '` does not exist.' : '')
                ]);
                die;
            }
        }

        return true;
    }

    protected function build_array($data, $keys) {
        $rs = [];

        foreach ($keys as $key) {
            $rs[$key] = (isset($data[$key])) ? $data[$key] : null;
        }

        return $rs;
    }

    protected function insert_nom($table, $data, $column, $foreign_key, $foreign_value, $rel_key) {
        foreach ($data as $value) {
            $this->orm->ignore_insert();

            $insertRelId = $this->orm->insert($table, [
                $foreign_key => $foreign_value,
                $rel_key => $value
            ]);
        }
    }

    protected function _packListItemPieces($item) {}

    protected function _packPieces($arr) {
        $result = [];

        foreach ($arr as $item) {
            $result[] = $this->_packListItemPieces($item);
        }

        return $result;
    }

    protected function prepare_object($obj, $columns) {
        foreach ($columns as $column) {
            $obj[$column] = array_map('intval', explode(',', $obj[$column]));
        }

        return $obj;
    }

    protected function getCurl($url, $method = 'GET') {
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method
        ]);

        $response = curl_exec($curl);

        $err = curl_error($curl);

        curl_close($curl);

        return json_decode($response);;
    }
}
