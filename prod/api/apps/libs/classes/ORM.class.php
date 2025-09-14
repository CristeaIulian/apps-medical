<?php

class ORM {
    private $_conn = null;
    private $_query = '';
    private $_table = '';
    private $_columns = '';
    private $_join = '';
    private $_where = '';
    private $_groupBy = '';
    private $_orderBy = '';
    private $_ignoreInsert = false;

    public function __construct() {
        $this->_conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        mysqli_set_charset($this->_conn, 'utf8');
    }
    
    public function ignore_insert($ignoreInsert = true) {
        $this->_ignoreInsert = $ignoreInsert;
    }

    public function columns($columns) {
        $this->_columns = $columns;
    }

    public function join($mode = 'LEFT', $condition = '') {
        $this->_join .= ' ' . $mode . ' JOIN ' . $condition . PHP_EOL;
    }

    public function where($where) {
        $this->_where = $where;
    }

    public function groupBy($groupBy) {
        $this->_groupBy = $groupBy;
    }

    public function orderBy($orderBy) {
        $this->_orderBy = $orderBy;
    }

    public function get($table) {
        $this->_table = $table;

        $this->_build_query();

        $result = $this->_query();

        $this->_reset_query();

        return $result;
    }

    public function get_row($table) {
        $result = $this->get($table);
        if (count($result) > 1) {
            echo json_encode([
                'success' => false,
                'error' => 'There was a DB error. ' . (IS_DEBUG ? 'get_row says: Query returned more than 1 row.' : '')
            ]);
            die;
        }

        if ($result && count($result)) {
            return $result[0];
        }

        return null;
    }

    public function get_column($table) {
        $this->_table = $table;

        $this->_build_query();

        $result = $this->_query();

        $rs = [];
        foreach ($result as $value) {
            $rs[] = $value[$this->_columns];
        }

        $this->_reset_query();

        return $rs;
    }

    public function insert($table, $data) {
        $this->_table = $table;

        if (!$this->_table) {
            die('"insert" says: Table not specified.');
        }

        if (!$data || !count($data)) {
            die('"insert" says: No data passed.');
        }

        $data = $this->_secureArray($data);

        $this->_query = "
            INSERT " . ($this->_ignoreInsert ? ' IGNORE ' : '') . " INTO " . $this->secureValue($this->_table) . "
            (`" . implode("`, `", array_keys($data)) . "`)
            VALUES
            (" . $this->_build_values($data, "', '") . ")
        ";

//         echo $this->_query;
//         die;

        $this->_execute();

        return $this->_get_last_insert_id();
    }

    private function getColumnsDefinitions() {
        $query = 'DESCRIBE ' . $this->_table;
        $resource = mysqli_query($this->_conn, $query);

        $rs = [];

        while ($row = mysqli_fetch_assoc($resource)) {
            $rs[$row['Field']] = $row;
        }

        return $rs;
    }

    public function update($table, $data) {
        $this->_table = $table;

        if (!$this->_table) {
            die('"update" says: Table not specified.');
        }
        if (!$this->_where) {
            die('"update" says: Where clause not specified.');
        }

        if (!$data || !count($data)) {
            die('"update" says: No data passed.');
        }

        $data = $this->_secureArray($data);

        $keyValues = [];

        $columnsDefinitions = $this->getColumnsDefinitions();

        foreach ($data as $key => $value) {
            $keyValue = '`' . $key . "` = ";

            if (is_null($value) && $columnsDefinitions[$key]['Null'] === 'YES') {
                $keyValue .= "NULL";
            } else {
                if (
                    str_contains($columnsDefinitions[$key]['Type'], 'enum') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'varchar') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'text') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'tinytext') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'date')
                ) {
                    $keyValue .= "'" . $value . "'";
                } else {
                    $keyValue .= $value;
                }
            }

            $keyValues[] = $keyValue;
        }

        $this->_query = "
            UPDATE " . $this->secureValue($this->_table) . "
            SET " . implode(", ", $keyValues) . "
            WHERE " . $this->_where . "
        ";

        $this->_execute();

        return $this->_get_affected_rows();
    }

    public function delete($table) {
        $this->_table = $table;

        if (!$this->_table) {
            die('"delete" says: Table not specified.');
        }
        if (!$this->_where) {
            die('"update" says: Where clause not specified.');
        }

        $this->_query = "
            DELETE
            FROM " . $this->secureValue($this->_table) . "
            WHERE " . $this->_where . "
        ";

        $this->_execute();

        return $this->_get_affected_rows();
    }

    public function secureValue($value) {
        return !is_null($value) ? addslashes($value) : null;
    }

    public function run($query, $multiple_rows = true) {
        $this->_query = $query;
        return $this->_query($multiple_rows);
    }

    private function _detect_error() {
        $error = mysqli_error($this->_conn) ;

        if ($error) {
            echo json_encode([
                'success' => false,
                'error' => 'There was a DB error. ' . (IS_DEBUG ? $error . ' -- Last query: ' . $this->_query : '')
            ]);
            die;
        }
    }

    private function _secureArray($arr) {
        foreach($arr as $key => $value) {
            $arr[$key] = !is_null($value) ? addslashes($value) : null;
        }
        return $arr;
    }

    private function _reset_query() {
        $this->_query = '';
        $this->_table = '';
        $this->_columns = '';
        $this->_join = '';
        $this->_where = '';
        $this->_groupBy = '';
        $this->_orderBy = '';
        $this->_ignoreInsert = false;
    }

    private function _build_query() {
        if (!$this->_table) {
            die('"get" says: Table not specified.');
        }

        $this->_query = "
            SELECT " . ($this->_columns ? $this->_columns : '*') . " 
            FROM " . $this->_table . "
        ";

        if ($this->_join) {
            $this->_query .= " " . $this->_join . " ";
        }

        if ($this->_where) {
            $this->_query .= " WHERE " . $this->_where . " ";
        }

        if ($this->_groupBy) {
            $this->_query .= " GROUP BY " . $this->secureValue($this->_groupBy) . " ";
        }

        if ($this->_orderBy) {
            $this->_query .= " ORDER BY " . $this->secureValue($this->_orderBy) . " ";
        }

        $this->_query .= ";";
    }

    private function _get_last_insert_id() {
        return mysqli_insert_id($this->_conn);
    }


    private function _get_affected_rows() {
        return mysqli_affected_rows($this->_conn);
    }

    private function _execute() {
        mysqli_query($this->_conn, $this->_query);
        $this->_detect_error();
        $this->_reset_query();
    }

    private function _query($multiple_rows = true) {
//     die($this->_query);
        $resource = mysqli_query($this->_conn, $this->_query);

        $this->_detect_error();
  
        if ($resource && $resource instanceof MySQLi_Result) {
            $columnDetails = $this->_get_column_details($resource);

            if ($multiple_rows) {
                $result = [];

                while ($row = mysqli_fetch_assoc($resource)) {
                    $result[] = $this->_castToNumberIfAny($row, $columnDetails);
                }

                $this->_detect_error();

                return $result;

            } else {
                $row = $this->_castToNumberIfAny(mysqli_fetch_assoc($resource), $columnDetails);
                $this->_detect_error();
                return $row;
            }
        }

        return null;
    }

    private function _castToNumberIfAny($row, $columnDetails) {
        foreach ($row as $key => $value) {
            if ($columnDetails[$key] === 'number') {
                $row[$key] = $value === null ? null : $value + 0; // cast to number (int/float)
            }
        }
        return $row;
    }

    private function _get_column_details($resource) {
        $result = [];

        while ($column = mysqli_fetch_field($resource)) {
            $result[$column->name] = $this->_getDataType($column->type);
        }

        return $result;
    }

    private function _getDataType($int) {
        if (in_array($int, [1, 2, 3, 4, 5, 8, 9, 16, 246])) {
            return 'number';
        }

        if (in_array($int, [7, 10, 11, 12, 13, 252, 253, 254])) {
            return 'string';
        }

        return null;
    }

    private function _build_values($arr) {
        $newValues = [];
        $columnsDefinitions = $this->getColumnsDefinitions();

        foreach ($arr as $key => $value) {
            if (is_null($value) && $columnsDefinitions[$key]['Null'] === 'YES') {
                $newValues[] = "NULL";
            } else {
                if (
                    str_contains($columnsDefinitions[$key]['Type'], 'enum') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'varchar') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'text') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'tinytext') ||
                    str_contains($columnsDefinitions[$key]['Type'], 'date')
                ) {
                    $newValues[] = "'" . $value . "'";
                } else {
                    $newValues[] = $value;
                }
            }
        }

        return join(', ', $newValues);
    }
}
