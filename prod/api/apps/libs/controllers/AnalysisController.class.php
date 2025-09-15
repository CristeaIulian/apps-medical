<?php

class AnalysisController extends BaseController {
    public function index() {
        $this->orm->columns("
            ma.id as analysisId, analysisName, categoryId, unitId, optimalRangeMin, optimalRangeMax,
            mc.name as categoryName, mu.name as unitName, reference
        ");

        $this->orm->join('LEFT', 'medical_categories mc ON ma.categoryId = mc.id');
        $this->orm->join('LEFT', 'medical_units mu ON ma.unitId = mu.id');

        $this->orm->orderBy('analysisName ASC');

        $result = $this->orm->get('medical_analysis AS ma');

        $result = $this->_packPieces($result);

        $this->output(['success' => true, 'data' => $result]);
    }

    public function add() {
        $postObject = $this->post;

        $fields = ['analysisName', 'categoryId', 'unitId', 'optimalRangeMin', 'optimalRangeMax', 'reference'];

        $unitId = isset($postObject['unitId']) ? $postObject['unitId'] : null;

        // try getting potential saved unitId
        if (!$unitId && isset($postObject['unitName'])) {
            $this->orm->columns("id");
            $this->orm->where("name = '" . $this->orm->secureValue($postObject['unitName']) . "'");
            $result = $this->orm->get_row('medical_units');

            if ($result) {
               $unitId = $result['id'];
            }
        }

        if (!$unitId && isset($postObject['unitName'])) {
            $unitId = $this->orm->insert('medical_units', $this->build_array( ["name" => $postObject["unitName"]], ['name'] ));
        }

        $postObject['unitId'] = $unitId;

        $analysisId = [];

        $this->orm->insert('medical_analysis',  $this->build_array( $postObject, $fields ));

        $this->output(['success' => true, 'message' => 'Analysis saved successfully', 'id' => $analysisId]);
    }

    public function update($route) {
        $postObject = $this->post;

        $fields = ['analysisName', 'categoryId', 'unitId', 'optimalRangeMin', 'optimalRangeMax', 'reference'];


        $unitId = isset($postObject['unitId']) ? $postObject['unitId'] : null;

        // try getting potential saved unitId
        if (!$unitId && isset($postObject['unitName'])) {
            $this->orm->columns("id");
            $this->orm->where("name = '" . $this->orm->secureValue($postObject['unitName']) . "'");
            $result = $this->orm->get_row('medical_units');

            if ($result) {
               $unitId = $result['id'];
            }
        }

        if (!$unitId && isset($postObject['unitName'])) {
            $unitId = $this->orm->insert('medical_units', $this->build_array( ["name" => $postObject["unitName"]], ['name'] ));
        }

        $postObject['unitId'] = $unitId;

        $analysisId = [];

        $this->orm->where('id = ' . $this->orm->secureValue($route['param']));

        $this->orm->update('medical_analysis',  $this->build_array( $postObject, $fields ));

        $this->output(['success' => true, 'message' => 'Analysis updated successfully']);
    }

    public function delete($route) {
        $this->orm->where("id = '" . $this->orm->secureValue($route['param']) . "'");
        $this->orm->delete("medical_analysis");

        $this->output(['success' => true, 'message' => 'Analysis deleted successfully']);
    }

    protected function _packListItemPieces($item) {
        $itemToAdd = [];

        $keys = ['analysisId', 'analysisName', 'categoryId', 'unitId', 'optimalRangeMin', 'optimalRangeMax', 'categoryName', 'unitName', 'reference'];

        foreach ($keys as $key) {
            if (isset($item[$key]) && $item[$key]) {
                $itemToAdd[$key] = $item[$key];
            }
        }

        return $itemToAdd;
    }

//     private function _formatData($mode) {
//         $this->post['publishingYear'] = isset($this->post['publishingYear']) ? (int)$this->post['publishingYear'] : null;
//         $this->post['readingCompletionYear'] = isset($this->post['readingCompletionYear']) ? (int)$this->post['readingCompletionYear'] : null;
//         $this->post['language_id'] = isset($this->post['language_id']) ? (int)$this->post['language_id'] : null;
//         $this->post['pages'] = isset($this->post['pages']) ? (int)$this->post['pages'] : null;
//         $this->post['stars'] = isset($this->post['stars']) ? (int)$this->post['stars'] : null;
//         $this->post['bookmark'] = isset($this->post['bookmark']) ? (int)$this->post['bookmark'] : null;
//         $this->post['lowest_price'] = isset($this->post['lowest_price']) ? (int)$this->post['lowest_price'] : null;
//         $this->post['lowest_price_url'] = isset($this->post['lowest_price_url']) ? $this->post['lowest_price_url'] : null;
//
//         if ($mode === 'add') {
//             $this->post['date_added'] = isset($this->post['date_added']) ? date('Y-m-d') : null;
//         }
//
//         if (!isset($this->post['categories_ids'])) {
//             $this->post['categories_ids'] = [];
//         }
//         if (!isset($this->post['authors_ids'])) {
//             $this->post['authors_ids'] = [];
//         }
//     }
}
