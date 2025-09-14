import React, { FC, useEffect, useState } from 'react';

import { Button, Card, Loading } from '@memobit/libs';
import { useNavigate } from 'react-router';

import AddResultsModal from '@components/AddResultsModal/AddResultsModal';
import { AppHeader } from '@components/AppHeader';
import { getCategoriesMapById, getClinicsMapById, getProblematicData, prepareDashboardData } from '@helpers/medicalHelpers';
import { DashboardMiniCard } from '@pages/Dashboard/components/DashboardMiniCard';
import { DashboardPeriod } from '@pages/Dashboard/components/DashboardPeriod';
import { ProblematicValues } from '@pages/Dashboard/components/ProblematicValues';
import { getStorageContent, updateStorageFilterCategories } from '@pages/Dashboard/helpers/storage';

import { loadAnalysisList, loadAnalysisResults, loadCategories, loadClinics } from '../../services/api';
import { Analysis, AnalysisResults, CategoriesMapById, Category, Clinic, ClinicsMapById } from '../../types';

import './Dashboard.scss';

export type DashboardData = {
    [key in number]: {
        analysisResults: AnalysisResults[];
    };
};

export interface CategoryFilter {
    [key: string]: boolean;
}

export interface DateFilter {
    type: 'preset' | 'specific';
    preset?: string;
    specificDate?: string;
}

const storageContent = getStorageContent();

const getCategoriesFiltersFromStorage = () => {
    const rs: Record<number, boolean> = {};
    storageContent.activeCategories.forEach(ac => {
        rs[ac] = true;
    });
    return rs;
};

export const Dashboard: FC = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesById, setCategoriesById] = useState<CategoriesMapById>({});
    const [clinicsById, setClinicsById] = useState<ClinicsMapById>({});
    const [analysis, setAnalysis] = useState<Analysis[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilter>(getCategoriesFiltersFromStorage);
    const [showAddModal, setShowAddModal] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateFilter>({
        type: 'preset',
        preset: 'all',
    });

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [analysisResultsResponse, categoriesResponse, clinicsResponse, analysisResponse] = await Promise.all([
                loadAnalysisResults(),
                loadCategories(),
                loadClinics(),
                loadAnalysisList(),
            ]);

            if (analysisResultsResponse.success) {
                setAnalysisResults(analysisResultsResponse.data);
            } else {
                setError(analysisResultsResponse.error);
            }

            if (analysisResponse.success) {
                setAnalysis(analysisResponse.data);
            } else {
                setError(analysisResponse.error);
            }

            if (clinicsResponse.success) {
                setClinics(clinicsResponse.data);
                setClinicsById(getClinicsMapById(clinicsResponse.data));
            } else {
                setError(clinicsResponse.error);
            }

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data);
                setCategoriesById(getCategoriesMapById(categoriesResponse.data));
            } else {
                setError(categoriesResponse.error);
            }

            const preparedDashboardData = prepareDashboardData(analysisResultsResponse.data, categoriesResponse.data);
            setDashboardData(preparedDashboardData);
        } catch (err) {
            setError('Eroare la încărcarea datelor');
            console.error('DashboardMiniCard loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const toggleCategoryFilter = (categoryId: number) => {
        setCategoryFilters(prev => {
            updateStorageFilterCategories(categoryId, prev[categoryId] ? 'remove' : 'add');

            return {
                ...prev,
                [categoryId]: !prev[categoryId],
            };
        });
    };

    const onChartClick = (analysisId: number): void => {
        navigate(`/analysisId/${analysisId}`);
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="dashboard__loading">
                    <Loading />
                    <p>Se încarcă datele medicale...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="dashboard__error">
                    <h2>Eroare</h2>
                    <p>{error}</p>
                    <Button onClick={loadDashboardData}>Reîncearcă</Button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="dashboard">
                <div className="dashboard__no-data">
                    <h2>Nu sunt date disponibile</h2>
                    <p>Adaugă primele tale analize medicale pentru a începe monitorizarea.</p>
                    <Button onClick={() => setShowAddModal(true)}>Adaugă Analize</Button>
                </div>
            </div>
        );
    }

    const problematicValues = getProblematicData(analysisResults);

    return (
        <>
            <AppHeader />
            <div className="dashboard">
                {/* Header */}
                <div className="dashboard__header">
                    <div className="dashboard__title">
                        <h1>Dashboard Medical</h1>
                        <p>Monitorizarea analizelor medicale pe termen lung</p>
                    </div>
                    <div className="dashboard__actions">
                        <Button variant="primary" onClick={() => setShowAddModal(true)}>
                            + Adaugă Rezultate
                        </Button>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="dashboard__filters">
                    <h3>Categorii</h3>
                    <div className="dashboard__category-filters">
                        {categories.map(({ name: categoryName, id: categoryId }) => (
                            <button
                                key={categoryId}
                                className={`dashboard__category-filter ${categoryFilters[categoryId] ? 'active' : ''}`}
                                onClick={() => toggleCategoryFilter(categoryId)}
                            >
                                {categoryName}
                                {dashboardData[categoryId]?.analysisResults.length > 0 && (
                                    <span className="dashboard__category-count">{dashboardData[categoryId].analysisResults.length}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <DashboardPeriod dateFilter={dateFilter} setDateFilter={setDateFilter} analysisResults={analysisResults} />

                {/* Quick Stats */}
                <div className="dashboard__stats">
                    <Card className="dashboard__stat">
                        <h4>Total Analize</h4>
                        <span className="dashboard__stat-value">{analysisResults.length}</span>
                    </Card>
                    <Card className="dashboard__stat">
                        <h4>Valori Problematice</h4>
                        <span className={`dashboard__stat-value ${problematicValues.length > 0 ? 'warning' : ''}`}>{problematicValues.length}</span>
                    </Card>
                </div>

                <DashboardMiniCard
                    analysisResults={analysisResults}
                    categoriesById={categoriesById}
                    categoryFilters={categoryFilters}
                    dataCategories={dashboardData}
                    dateFilter={dateFilter}
                    onChartClick={onChartClick}
                />

                <ProblematicValues problematicValues={problematicValues} />

                {showAddModal && (
                    <AddResultsModal
                        analysis={analysis}
                        clinics={clinics}
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            loadDashboardData(); // Refresh data după salvare
                            setShowAddModal(false);
                        }}
                    />
                )}
            </div>
        </>
    );
};
