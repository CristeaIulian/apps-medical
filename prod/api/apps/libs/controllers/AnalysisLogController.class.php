<?php

class AnalysisLogController extends BaseController {
    public function index() {
        $this->orm->columns("
            mal.id as analysisLogId, analysisId, date, analysisName, categoryId, clinicId, value, unitId, optimalRangeMin, optimalRangeMax,
            mc.name as categoryName, mu.name as unitName, mcl.name as clinicName, mal.reference as userReference, ma.reference as optimalReference, notes
        ");

        $this->orm->join('LEFT', 'medical_analysis ma ON mal.analysisId = ma.id');
        $this->orm->join('LEFT', 'medical_categories mc ON ma.categoryId = mc.id');
        $this->orm->join('LEFT', 'medical_units mu ON ma.unitId = mu.id');
        $this->orm->join('LEFT', 'medical_clinics mcl ON mal.clinicId = mcl.id');

        $this->orm->orderBy('date DESC');

        $result = $this->orm->get('medical_analysis_log AS mal');

        $result = $this->_packPieces($result);

        $this->output(['success' => true, 'data' => $result]);
    }

//     public function getAnalysisList() {
//         $this->orm->columns("
//             ma.id as analysisLogId, ma.id as analysisId, analysisName, categoryId, unitId, optimalRangeMin, optimalRangeMax, mc.name as categoryName, mu.name as unitName, reference
//         ");
//
//         $this->orm->join('LEFT', 'medical_categories mc ON ma.categoryId = mc.id');
//         $this->orm->join('LEFT', 'medical_units mu ON ma.unitId = mu.id');
//
//         $this->orm->orderBy('analysisName ASC');
//
//         $result = $this->orm->get('medical_analysis AS ma');
//
//         $result = $this->_packPieces($result);
//
//         $this->output(['success' => true, 'data' => $result]);
//     }
//
//     public function get($route) {
//             $this->orm->columns("
//                 mal.id as analysisLogId, analysisId, date, analysisName, categoryId, clinicId, value, unitId, optimalRangeMin, optimalRangeMax, mc.name as categoryName, mu.name as unitName, mcl.name as clinicName, mal.reference as userReference, ma.reference as optimalReference, notes
//             ");
//
//             $this->orm->join('LEFT', 'medical_analysis ma ON mal.analysisId = ma.id');
//             $this->orm->join('LEFT', 'medical_categories mc ON ma.categoryId = mc.id');
//             $this->orm->join('LEFT', 'medical_units mu ON ma.unitId = mu.id');
//             $this->orm->join('LEFT', 'medical_clinics mcl ON mal.clinicId = mcl.id');
//
//             $this->orm->where('mal.id = ' . $this->orm->secureValue($route['param']));
//
//             $result = $this->orm->get('medical_analysis_log AS mal');
//
//             $result = $this->_packPieces($result);
//
//             $this->output(['success' => true, 'data' => $result[0]]);
//     }

    public function getByType($route) {
            $this->orm->columns("
                mal.id as analysisLogId, analysisId, date, analysisName, categoryId, clinicId, value, unitId, optimalRangeMin, optimalRangeMax,
                mc.name as categoryName, mu.name as unitName, mcl.name as clinicName, mal.reference as userReference, ma.reference as optimalReference, notes
            ");

            $this->orm->join('LEFT', 'medical_analysis ma ON mal.analysisId = ma.id');
            $this->orm->join('LEFT', 'medical_categories mc ON ma.categoryId = mc.id');
            $this->orm->join('LEFT', 'medical_units mu ON ma.unitId = mu.id');
            $this->orm->join('LEFT', 'medical_clinics mcl ON mal.clinicId = mcl.id');

            $this->orm->where('ma.id = ' . $this->orm->secureValue($route['param']));

            $result = $this->orm->get('medical_analysis_log AS mal');

            $result = $this->_packPieces($result);

            $this->output(['success' => true, 'data' => $result]);
    }

    public function add() {
        $postObjects = $this->post;

        $fields = ['analysisId', 'date', 'clinicId', 'value', 'reference', 'notes'];

         $analysisIds = [];

        foreach ($postObjects as $postObject) {
            $analysisIds[] = $this->orm->insert('medical_analysis_log',  $this->build_array( $postObject, $fields ));
        }

        $this->output(['success' => true, 'message' => 'Analysis log saved successfully', 'id' => $analysisIds]);
    }

    public function delete($route) {
        $this->orm->where("id = '" . $this->orm->secureValue($route['param']) . "'");
        $this->orm->delete("medical_analysis_log");

        $this->output(['success' => true, 'message' => 'Analysis log deleted successfully']);
    }

    protected function _packListItemPieces($item) {
        $itemToAdd = [];

        $keys = [
            'analysisLogId', 'analysisId', 'analysisName', 'categoryId', 'clinicId', 'date', 'unitId', 'optimalRangeMin', 'optimalRangeMax', 'categoryName',
            'unitName', 'clinicName', 'value', 'name', 'notes', 'reference', 'userReference', 'optimalReference'];

        foreach ($keys as $key) {
            if (isset($item[$key]) && $item[$key] !== null) {
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
