import React, { useEffect, useMemo, useState } from 'react';

import { Button, Dropdown, DropdownOption, InputNumber, InputText, Modal, Toast } from '@memobit/libs';

import { saveAnalysisResults } from '../../services/api';
import { Analysis, AnalysisResultSaveDTO, Clinic } from '../../types';

import './AddResultsModal.scss';

interface AnalysisResultEntry {
    analysisId: string;
    analysisName: string;
    goodReference?: string;
    id: string;
    notes?: string;
    reference?: string;
    unitId: string;
    unitName: string;
    value: number | null;
}

interface AddResultsModalProps {
    analysis: Analysis[];
    clinics: Clinic[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddResultsModal: React.FC<AddResultsModalProps> = ({ analysis, clinics, isOpen, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
    const [clinicSearch, setClinicSearch] = useState<string>('');
    const [analysisResults, setAnalysisResults] = useState<AnalysisResultEntry[]>([]);

    // Data
    const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);

    // UI State
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setAnalysisResults([]);
            setSelectedClinicId(null);
            setClinicSearch('');
            setError('');

            // is this ok??
            setFilteredClinics(clinics.slice(0, 10));
        }
    }, [clinics, isOpen]);

    useEffect(() => {
        // Filter clinics based on search
        if (clinicSearch.trim() === '') {
            setFilteredClinics(clinics.slice(0, 10)); // Show top 10 most used
        } else {
            const filtered = clinics.filter(clinic => clinic.name.toLowerCase().includes(clinicSearch.toLowerCase()));
            setFilteredClinics(filtered.slice(0, 10));
        }
    }, [clinicSearch, clinics]);

    const addAnalysisResult = () => {
        const newEntry: AnalysisResultEntry = {
            id: `temp_${Date.now()}`,
            analysisId: '',
            analysisName: '',
            value: null,
            unitId: '',
            unitName: '',
            notes: '',
        };
        setAnalysisResults(prev => [...prev, newEntry]);
    };

    const removeAnalysisResult = (id: string) => {
        setAnalysisResults(prev => prev.filter(entry => entry.id !== id));
    };

    const updateAnalysisResult = (id: string, updates: Partial<AnalysisResultEntry>) => {
        setAnalysisResults(prev => prev.map(entry => (entry.id === id ? { ...entry, ...updates } : entry)));
    };

    const handleAnalysisDropdownOnChange = (entryId: string, newSelection: DropdownOption | DropdownOption[] | null) => {
        if (typeof newSelection === 'object' && !Array.isArray(newSelection) && newSelection) {
            const analysisItem = analysis.find(a => a.analysisId === Number(newSelection.value));

            if (analysisItem) {
                updateAnalysisResult(entryId, {
                    analysisId: analysisItem.analysisId.toString(),
                    analysisName: analysisItem.analysisName,
                    unitId: analysisItem.unitId?.toString(),
                    unitName: analysisItem.unitName,
                    reference: analysisItem.reference,
                });
            }
        }
    };

    const handleClinicSelect = (newSelection: DropdownOption | DropdownOption[] | null) => {
        if (typeof newSelection === 'object' && !Array.isArray(newSelection) && newSelection) {
            setSelectedClinicId(Number(newSelection.value));
            setClinicSearch(newSelection.label);
        }
    };

    const handleClinicSearchChange = (value: string) => {
        setClinicSearch(value);
        // how you determine the id from new name?? maybe can match with existing one
        // setSelectedClinic(value);
    };

    const validateForm = (): string | null => {
        if (!selectedDate) {
            return 'Selectează data analizei';
        }

        if (!selectedClinicId) {
            return 'Introdu numele clinicii';
        }

        if (analysisResults.length === 0) {
            return 'Adaugă cel puțin o analiză';
        }

        for (const result of analysisResults) {
            if (!result.analysisId) {
                return 'Selectează tipul analizei pentru toate înregistrările';
            }
            if (result.value && result?.value < 0) {
                return 'Valorile nu pot fi negative';
            }
        }

        // Check for duplicates
        const analysisIds = analysisResults.map(r => r.analysisId);
        const duplicates = analysisIds.filter((id, index) => analysisIds.indexOf(id) !== index);

        if (duplicates.length > 0) {
            return 'Nu poți adăuga același tip de analiză de mai multe ori pentru aceeași dată';
        }

        return null;
    };

    const handleSave = async () => {
        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError('');

            const analysisResultsToSave: AnalysisResultSaveDTO[] = analysisResults.map(entry => ({
                date: selectedDate,
                clinicId: Number(selectedClinicId),
                analysisId: Number(entry.analysisId),
                ...(entry.value && { value: Number(entry.value) }),
                ...(entry.notes && { notes: entry.notes?.trim() }),
                ...(entry.reference && { reference: entry.reference?.trim() }),
            }));

            const response = await saveAnalysisResults(analysisResultsToSave);

            if (response.success) {
                setToast({
                    message: response.message || 'Analizele au fost salvate cu succes',
                    type: 'success',
                });

                // Close modal and refresh parent data after a short delay
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(response.error || 'Eroare la salvarea analizelor');
            }
        } catch (err) {
            setError('Eroare la salvarea analizelor');
            console.error('Error saving analysis results:', err);
        } finally {
            setSaving(false);
        }
    };

    const getAvailableAnalysis = () => {
        const selectedAnalysisIds = analysisResults.map(r => r.analysisId).filter(Boolean);
        return analysis.filter(a => !selectedAnalysisIds.includes(a.analysisId.toString()));
    };

    const formatAnalysisOptions = (analysisList: Analysis[]) => {
        return analysisList.map(a => {
            const label = a.unitName ? `${a.analysisName} (${a.unitName})` : a.analysisName;
            return {
                value: a.analysisId,
                label: `${a.categoryName}: ${label}`,
                searchText: `${a.analysisName}`,
            };
        });
    };

    const dropdownClinicsOptions = useMemo(
        () =>
            filteredClinics.map(clinic => ({
                value: clinic.id,
                label: clinic.name,
                searchText: clinic.name,
            })),
        [filteredClinics]
    );

    if (!isOpen) return null;

    return (
        <>
            {isOpen && (
                <Modal onClose={onClose} title="Adaugă Rezultate Analize" size="large" className="add-results-modal">
                    <div className="add-results-modal__content">
                        <>
                            {/* Error Display */}
                            {error && <div className="add-results-modal__error">{error}</div>}

                            {/* Basic Information */}
                            <div className="add-results-modal__basic-info">
                                <h3>Informații de bază</h3>
                                <div className="add-results-modal__form-row">
                                    <div className="add-results-modal__form-group">
                                        <label htmlFor="analysis-date">Data analizei *</label>
                                        <input
                                            id="analysis-date"
                                            type="date"
                                            value={selectedDate}
                                            onChange={e => setSelectedDate(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="add-results-modal__date-input"
                                        />
                                    </div>
                                    <div className="add-results-modal__form-group">
                                        <label htmlFor="clinic-name">Clinica *</label>
                                        <Dropdown
                                            name="clinic-name"
                                            options={dropdownClinicsOptions}
                                            value={selectedClinicId?.toString()}
                                            onChange={handleClinicSelect}
                                            placeholder="Caută sau selectează clinica..."
                                            searchable
                                            searchValue={clinicSearch}
                                            onSearchChange={handleClinicSearchChange}
                                            allowCustomValue
                                            className="add-results-modal__clinic-dropdown"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Results */}
                            <div className="add-results-modal__test-results">
                                <div className="add-results-modal__section-header">
                                    <h3>Rezultate analize</h3>
                                </div>
                                {analysisResults.length === 0 ? (
                                    <div className="add-results-modal__no-tests">
                                        <p>Nu ai adăugat încă nicio analiză.</p>
                                        <Button onClick={addAnalysisResult}>Adaugă prima analiză</Button>
                                    </div>
                                ) : (
                                    <div className="add-results-modal__test-list">
                                        {analysisResults.map((entry, index) => (
                                            <div key={entry.id} className="add-results-modal__test-entry">
                                                <div className="add-results-modal__test-header">
                                                    <span className="add-results-modal__test-number">#{index + 1}</span>
                                                    <Button variant="danger" size="small" onClick={() => removeAnalysisResult(entry.id)} disabled={saving}>
                                                        Șterge
                                                    </Button>
                                                </div>

                                                <div className="add-results-modal__test-fields">
                                                    <div className="add-results-modal__form-group">
                                                        <label>Tip analiză *</label>
                                                        <Dropdown
                                                            name="analysis-type"
                                                            options={formatAnalysisOptions(getAvailableAnalysis())}
                                                            value={entry.analysisId}
                                                            onChange={value => handleAnalysisDropdownOnChange(entry.id, value)}
                                                            placeholder="Caută și selectează analiza..."
                                                            searchable
                                                            disabled={saving}
                                                        />
                                                    </div>

                                                    {!entry.reference && (
                                                        <div className="add-results-modal__form-group">
                                                            <label>Valoare</label>
                                                            <div className="add-results-modal__value-input">
                                                                <InputNumber
                                                                    value={typeof entry.value === 'number' ? entry.value : undefined}
                                                                    onChange={value => updateAnalysisResult(entry.id, { value })}
                                                                    placeholder="0.00"
                                                                    step={0.01}
                                                                    min={0}
                                                                    disabled={saving}
                                                                />
                                                                <span className="add-results-modal__unit">{entry.unitName || 'unitate'}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {entry.reference && (
                                                        <div className="add-results-modal__form-group">
                                                            <label>Referință</label>
                                                            <InputText
                                                                value={entry.reference || ''}
                                                                onChange={value => updateAnalysisResult(entry.id, { reference: value })}
                                                                placeholder="Referinta pentru non-valori"
                                                                disabled={saving}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="add-results-modal__form-group">
                                                        <label>Observații</label>
                                                        <InputText
                                                            value={entry.notes || ''}
                                                            onChange={value => updateAnalysisResult(entry.id, { notes: value })}
                                                            placeholder="Observații opționale..."
                                                            disabled={saving}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ padding: '8px' }}>
                                    <Button variant="secondary" size="small" onClick={addAnalysisResult} disabled={saving}>
                                        + Adaugă log analiză
                                    </Button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="add-results-modal__actions">
                                <Button variant="secondary" onClick={onClose} disabled={saving}>
                                    Anulează
                                </Button>
                                <Button variant="primary" onClick={handleSave} disabled={saving || analysisResults.length === 0} loading={saving}>
                                    {saving ? 'Se salvează...' : `Salvează ${analysisResults.length} analize`}
                                </Button>
                            </div>
                        </>
                    </div>
                </Modal>
            )}

            {/* Toast notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default AddResultsModal;
