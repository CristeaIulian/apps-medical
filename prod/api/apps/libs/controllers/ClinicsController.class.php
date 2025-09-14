<?php

class ClinicsController extends BaseController {
    public function index() {
        $this->orm->columns("id, name");

        $this->orm->orderBy('name');

        $result = $this->orm->get('medical_clinics AS mc');
        $this->output(['success' => true, 'data' => $result]);
    }

    public function get($route) {
        $this->orm->where('id = ' . $this->orm->secureValue($route['param']));
        $result = $this->orm->get_row('medical_clinics');
        $this->output(['success' => true, 'data' => $result]);
    }

    public function add() {
        if (!$this->is_input_valid($this->post, ['name'])) {
            die('Not all required params have been sent.');
        }

        $lastId = $this->orm->insert('medical_clinics',  $this->build_array(
            $this->post, ['name']
        ));

        $this->output(['success' => true, 'message' => 'Clinic saved successfully', 'id' => $lastId]);
    }

    public function update() {
        if (!$this->is_input_valid($this->post, ['id', 'name'])) {
            die('Not all required params have been sent.');
        }

        $this->orm->where('id = ' . $this->orm->secureValue($this->post['id']));
        $this->orm->update('medical_clinics',  $this->build_array(
            $this->post, ['name']
        ));

        $this->output(['success' => true, 'message' => 'Clinic saved successfully']);
    }

    public function delete($route) {
        $this->orm->where("id = '" . $this->orm->secureValue($route['param']) . "'");
        $this->orm->delete("medical_clinics");

        $this->output(['success' => true, 'message' => 'Clinic deleted successfully']);
    }
}
