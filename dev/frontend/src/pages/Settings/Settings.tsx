import { FC, useCallback, useEffect, useState } from 'react';

import { Button, Card, ConfirmDialog, Dropdown, DropdownOption, InputNumber, InputText, Loading, Modal, Toast } from '@memobit/libs';
import { useNavigate } from 'react-router';

import { AppHeader } from '@components/AppHeader';
import { getCategoriesMapById } from '@helpers/medicalHelpers';

import { addAnalysis, deleteAnalysis, loadAnalysisList, loadCategories, updateAnalysis } from '../../services/api';
import { Analysis, AnalysisSaveDTO, CategoriesMapById, Category } from '../../types';

import './Settings.scss';

interface EditAnalysisModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    analysis: Partial<Analysis>;
}

interface DeleteConfirmState {
    isOpen: boolean;
    analysis: Analysis | null;
}

const Settings: FC = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesById, setCategoriesById] = useState<CategoriesMapById>({});
    const [analysisList, setAnalysisList] = useState<Analysis[]>([]);

    const [filteredAnalysis, setFilteredAnalysis] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');

    // Filters
    const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
    const [searchFilter, setSearchFilter] = useState<string>('');

    // Modals
    const [editModal, setEditModal] = useState<EditAnalysisModalState>({
        isOpen: false,
        mode: 'add',
        analysis: {},
    });
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
        isOpen: false,
        analysis: null,
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const categoryOptions = categories.map(({ id, name }) => ({
        value: id,
        label: name,
        searchText: name,
    }));

    const fetchAnalysisList = async () => {
        try {
            setLoading(true);
            setError('');

            const [categoriesResponse, analysisResponse] = await Promise.all([loadCategories(), loadAnalysisList()]);

            if (analysisResponse.success) {
                setAnalysisList(analysisResponse.data);
            } else {
                setError(analysisResponse.error);
            }

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data);
                setCategoriesById(getCategoriesMapById(categoriesResponse.data));
            } else {
                setError(categoriesResponse.error);
            }
        } catch (err) {
            setError('Eroare la încărcarea datelor');
            console.error('Error loading test types:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysisList();
    }, []);

    const filterAnalysis = useCallback(() => {
        let filtered = [...analysisList];

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(tt => tt.categoryId === categoryFilter);
        }

        // Search filter
        if (searchFilter.trim()) {
            const search = searchFilter.toLowerCase();
            filtered = filtered.filter(tt => tt.analysisName.toLowerCase().includes(search));
        }

        setFilteredAnalysis(filtered);
    }, [categoryFilter, searchFilter, analysisList]);

    useEffect(() => {
        filterAnalysis();
    }, [analysisList, categoryFilter, searchFilter, filterAnalysis]);

    const handleAddAnalysis = () => {
        setEditModal({
            isOpen: true,
            mode: 'add',
            analysis: {
                analysisName: '',
                categoryId: undefined,
                unitName: '',
                optimalRangeMin: undefined,
                optimalRangeMax: undefined,
            },
        });
    };

    const handleEditAnalysis = (analysis: Analysis) => {
        setEditModal({
            isOpen: true,
            mode: 'edit',
            analysis: { ...analysis },
        });
    };

    const handleSaveAnalysis = async () => {
        const { analysis, mode } = editModal;

        // Validation
        if (!analysis.analysisName?.trim()) {
            setToast({ message: 'Numele analizei este obligatoriu', type: 'error' });
            return;
        }

        if (analysis.optimalRangeMin && analysis.optimalRangeMax && analysis.optimalRangeMin >= analysis.optimalRangeMax) {
            setToast({ message: 'Intervalul optim este invalid', type: 'error' });
            return;
        }

        // Check for duplicate names (except when editing the same item)
        // const duplicateName = analysisList.find(
        //     a => a.analysisName.toLowerCase() === (analysis.analysisName || '').toLowerCase() && (mode === 'add' || analysis.analysisId === 0)
        // );

        try {
            setSaving(true);

            const optimalRangeMin = analysis.optimalRangeMin ? analysis.optimalRangeMin : analysis.optimalRangeMax ? 0 : undefined;
            const unitName = (analysis.unitName || '').trim();

            const saveData: AnalysisSaveDTO = {
                ...(analysis.analysisId && { id: analysis.analysisId }),
                analysisName: analysis.analysisName.trim(),
                categoryId: analysis.categoryId || 0,
                ...(unitName && { unitName }),
                ...(optimalRangeMin && { optimalRangeMin }),
                ...(analysis.optimalRangeMax && { optimalRangeMax: analysis.optimalRangeMax }),
                ...(analysis.reference && { reference: analysis.reference }),
            };

            let response;

            if (mode === 'add') {
                response = await addAnalysis(saveData);
            } else {
                if (analysis.analysisId) {
                    response = await updateAnalysis(analysis.analysisId || 0, saveData);
                } else {
                    setToast({
                        message: 'The analysis could not be update, analysisId is missing',
                        type: 'error',
                    });
                    return;
                }
            }

            if (response.success) {
                setToast({
                    message: mode === 'add' ? 'Analiza a fost adăugată' : 'Analiza a fost actualizată',
                    type: 'success',
                });
                setEditModal({ isOpen: false, mode: 'add', analysis: {} });
                await fetchAnalysisList(); // Refresh data
            } else {
                setToast({
                    message: response.error || 'Eroare la salvarea analizei',
                    type: 'error',
                });
            }
        } catch (err) {
            setToast({
                message: 'Eroare la salvarea analizei',
                type: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAnalysis = (analysis: Analysis) => {
        setDeleteConfirm({
            isOpen: true,
            analysis,
        });
    };

    const confirmDeleteAnalysis = async () => {
        const { analysis } = deleteConfirm;

        if (!analysis) {
            return;
        }

        try {
            setSaving(true);

            const response = await deleteAnalysis(analysis.analysisId);

            if (response.success) {
                setToast({
                    message: 'Analiza a fost ștearsă',
                    type: 'success',
                });
                setDeleteConfirm({ isOpen: false, analysis: null });
                await fetchAnalysisList(); // Refresh data
            } else {
                setToast({
                    message: response.error || 'Eroare la ștergerea analizei',
                    type: 'error',
                });
            }
        } catch (err) {
            setToast({
                message: 'Eroare la ștergerea analizei',
                type: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const updateEditModalField = (field: keyof Analysis, value: any) => {
        setEditModal(prev => ({
            ...prev,
            analysis: {
                ...prev.analysis,
                [field]: value,
            },
        }));
    };

    const updateOptimalRange = (field: 'min' | 'max', value?: number) => {
        setEditModal(prev => ({
            ...prev,
            analysis: {
                ...prev.analysis,
                ...(field === 'min' && { optimalRangeMin: value }),
                ...(field === 'max' && { optimalRangeMax: value }),
            },
        }));
    };

    const onBackClick = (): void => {
        navigate(`/`);
    };

    const updateCategoryFilter = (dropdownOption: DropdownOption | DropdownOption[] | null) => {
        if (!Array.isArray(dropdownOption)) {
            setCategoryFilter(dropdownOption ? Number(dropdownOption.value) : undefined);
        }
    };

    const updateCategoryState = (dropdownOption: DropdownOption | DropdownOption[] | null) => {
        if (!Array.isArray(dropdownOption)) {
            updateEditModalField('categoryId', dropdownOption ? Number(dropdownOption.value) : undefined);
        }
    };

    if (loading) {
        return (
            <div className="settings">
                <div className="settings__loading">
                    <Loading />
                    <p>Se încarcă setările...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="settings">
                <div className="settings__error">
                    <h2>Eroare</h2>
                    <p>{error}</p>
                    <Button onClick={fetchAnalysisList}>Reîncearcă</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <AppHeader />
            <div className="settings">
                {/* Header */}
                <div className="settings__header">
                    <div className="settings__header-left">
                        <Button variant="secondary" size="small" onClick={onBackClick}>
                            ← Înapoi
                        </Button>
                        <div className="settings__title">
                            <h1>Analize Medicale</h1>
                            <p>Gestionează tipurile de analize și intervalele optime</p>
                        </div>
                    </div>
                    <div className="settings__header-right">
                        <Button variant="primary" onClick={handleAddAnalysis}>
                            + Adaugă Analiză
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="settings__filters">
                    <Card>
                        <div className="settings__filters-content">
                            <div className="settings__filter-group">
                                <label>Categorie:</label>
                                <Dropdown name="settings-category" options={categoryOptions} value={categoryFilter} onChange={updateCategoryFilter} />
                            </div>

                            <div className="settings__filter-group">
                                <label>Caută:</label>
                                <InputText value={searchFilter} onChange={setSearchFilter} placeholder="Nume analiză sau cuvânt cheie..." />
                            </div>

                            <div className="settings__filter-results">
                                <span>Găsite:</span> <strong> {filteredAnalysis.length}</strong> <span>din {analysisList.length} analize</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Analysis List */}
                <div className="settings__content">
                    <Card>
                        <h3>Tipuri de Analize ({filteredAnalysis.length})</h3>

                        {filteredAnalysis.length === 0 ? (
                            <div className="settings__no-results">
                                <p>Nu au fost găsite analize care să corespundă filtrelor selectate.</p>
                                {(categoryFilter || searchFilter) && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setCategoryFilter(undefined);
                                            setSearchFilter('');
                                        }}
                                    >
                                        Resetează filtrele
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="settings__test-types">
                                {filteredAnalysis.map(a => (
                                    <div key={a.analysisId} className="settings__test-type">
                                        <div className="settings__test-type-main">
                                            <div className="settings__test-type-info">
                                                <div className="settings__test-type-header">
                                                    <h4>{a.analysisName}</h4>
                                                    <div className="settings__test-type-badges">
                                                        <span className={`settings__category-badge ${a.categoryId}`}>
                                                            {a.categoryId ? categoriesById[a.categoryId].name : undefined}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="settings__test-type-details">
                                                    {a.unitName && (
                                                        <div className="settings__detail">
                                                            <span className="settings__detail-label">Unitate:</span>
                                                            <span className="settings__detail-value">{a.unitName}</span>
                                                        </div>
                                                    )}

                                                    {(a.optimalRangeMin || a.optimalRangeMax) && (
                                                        <div className="settings__detail">
                                                            <span className="settings__detail-label">Interval optim:</span>
                                                            <span className="settings__detail-value">
                                                                {a.optimalRangeMin || 0} - {a.optimalRangeMax || '∞'} {a.unitName}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {a.reference && (
                                                        <div className="settings__detail">
                                                            <span className="settings__detail-label">Referinta:</span>
                                                            <span className="settings__detail-value">{a.reference}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="settings__test-type-actions">
                                                <Button variant="secondary" size="small" onClick={() => handleEditAnalysis(a)} disabled={saving}>
                                                    Editează
                                                </Button>
                                                <Button variant="danger" size="small" onClick={() => handleDeleteAnalysis(a)} disabled={saving}>
                                                    Șterge
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Edit/Add Modal */}
                {editModal.isOpen && (
                    <Modal
                        onClose={() => setEditModal({ isOpen: false, mode: 'add', analysis: {} })}
                        title={editModal.mode === 'add' ? 'Adaugă Analiză' : 'Editează Analiză'}
                        size="large"
                    >
                        <div className="settings__edit-modal">
                            <div className="settings__form-group">
                                <label>Nume analiză *</label>
                                <InputText
                                    value={editModal.analysis.analysisName || ''}
                                    onChange={value => updateEditModalField('analysisName', value)}
                                    placeholder="ex: Hemoglobină"
                                />
                            </div>

                            <div className="settings__form-row">
                                <div className="settings__form-group">
                                    <label>Categorie *</label>
                                    <Dropdown
                                        name="settings-category"
                                        options={categoryOptions}
                                        value={editModal.analysis.categoryId?.toString()}
                                        onChange={value => updateCategoryState(value)}
                                    />
                                </div>

                                <div className="settings__form-group">
                                    <label>Unitate măsură</label>
                                    <InputText
                                        value={editModal.analysis.unitName || ''}
                                        onChange={value => updateEditModalField('unitName', value)}
                                        placeholder="ex: g/dL, mg/dL, %"
                                    />
                                </div>
                            </div>

                            <div className="settings__form-row">
                                <div className="settings__form-group">
                                    <label>Valoare minimă optimă</label>
                                    <InputNumber
                                        value={editModal.analysis.optimalRangeMin}
                                        onChange={value => updateOptimalRange('min', value)}
                                        step={0.1}
                                        min={0}
                                    />
                                </div>

                                <div className="settings__form-group">
                                    <label>Valoare maximă optimă</label>
                                    <InputNumber
                                        value={editModal.analysis.optimalRangeMax}
                                        onChange={value => updateOptimalRange('max', value)}
                                        step={0.1}
                                        min={editModal.analysis.optimalRangeMin || 0}
                                    />
                                </div>
                            </div>

                            <div className="settings__form-group">
                                <label>Referinta (pentru non-valori)</label>
                                <InputText
                                    value={editModal.analysis.reference || ''}
                                    onChange={value => updateEditModalField('reference', value)}
                                    placeholder="ex: Normal, Transparent"
                                />
                            </div>

                            <div className="settings__form-actions">
                                <Button variant="secondary" onClick={() => setEditModal({ isOpen: false, mode: 'add', analysis: {} })} disabled={saving}>
                                    Anulează
                                </Button>
                                <Button variant="primary" onClick={handleSaveAnalysis} disabled={saving} loading={saving}>
                                    {saving ? 'Se salvează...' : editModal.mode === 'add' ? 'Adaugă' : 'Salvează'}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Delete Confirmation */}
                <ConfirmDialog
                    isOpen={deleteConfirm.isOpen}
                    title="Confirmă ștergerea"
                    message={`Ești sigur că vrei să ștergi analiza "${deleteConfirm.analysis?.analysisName}"? Această acțiune nu poate fi anulată.`}
                    confirmText="Șterge"
                    cancelText="Anulează"
                    onConfirm={confirmDeleteAnalysis}
                    onCancel={() => setDeleteConfirm({ isOpen: false, analysis: null })}
                    type="danger"
                />

                {/* Toast notifications */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </>
    );
};

export default Settings;
