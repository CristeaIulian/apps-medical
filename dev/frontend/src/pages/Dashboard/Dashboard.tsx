import React, { FC, useEffect, useState } from 'react';

import { Button, Loading } from '@memobit/libs';
import { useNavigate } from 'react-router';

import AddResultsModal from '@components/AddResultsModal/AddResultsModal';
import { AppHeader } from '@components/AppHeader';
import {
    filterAnalysisResultsByDate,
    filterResultsByProblematic,
    getCategoriesMapById,
    getProblematicCount,
    prepareDashboardData,
    shouldShowPeriodCards,
} from '@helpers/medicalHelpers';
import { DashboardCategoryFilters } from '@pages/Dashboard/components/DashboardCategoryFilters';
import { DashboardHeader } from '@pages/Dashboard/components/DashboardHeader';
import { DashboardListView } from '@pages/Dashboard/components/DashboardListView';
import { DashboardMiniCards } from '@pages/Dashboard/components/DashboardMiniCards';
import { DashboardPeriod } from '@pages/Dashboard/components/DashboardPeriod';
import { DashboardStats } from '@pages/Dashboard/components/DashboardStats';
import {
    getStorageContent,
    getStorageDateFilter,
    getStorageResultFilter,
    getStorageViewMode,
    ResultFilter,
    updateStorageDateFilter,
    updateStorageFilterCategories,
    updateStorageResultFilter,
    updateStorageViewMode,
    ViewMode,
} from '@pages/Dashboard/helpers/storage';

import { loadAnalysisList, loadAnalysisResults, loadCategories, loadClinics } from '../../services/api';
import { Analysis, AnalysisResults, CategoriesMapById, Category, CategoryFilter, Clinic, DateFilter } from '../../types';

import './Dashboard.scss';

export type DashboardData = {
    [key in number]: {
        analysisResults: AnalysisResults[];
    };
};

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
    const [analysis, setAnalysis] = useState<Analysis[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilter>(getCategoriesFiltersFromStorage);
    const [showAddModal, setShowAddModal] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateFilter>(getStorageDateFilter());
    const [viewMode, setViewMode] = useState<ViewMode>(getStorageViewMode());
    const [resultFilter, setResultFilter] = useState<ResultFilter>(getStorageResultFilter());

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

    const handleDateFilterChange = (newDateFilter: DateFilter) => {
        setDateFilter(newDateFilter);
        updateStorageDateFilter(newDateFilter);
    };

    const handleViewModeChange = (newViewMode: ViewMode) => {
        setViewMode(newViewMode);
        updateStorageViewMode(newViewMode);
    };

    const handleResultFilterChange = (newResultFilter: ResultFilter) => {
        setResultFilter(newResultFilter);
        updateStorageResultFilter(newResultFilter);
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

    const problematicValuesLength = getProblematicCount(analysisResults);
    const filteredAnalysisResults = filterAnalysisResultsByDate(analysisResults, dateFilter);
    const finalFilteredResults = filterResultsByProblematic(filteredAnalysisResults, resultFilter);
    const filteredProblematicValuesLength = getProblematicCount(finalFilteredResults);
    const showPeriodCards = shouldShowPeriodCards(dateFilter);

    return (
        <>
            <AppHeader />
            <div className="dashboard">
                <DashboardHeader
                    onAddResults={() => setShowAddModal(true)}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    resultFilter={resultFilter}
                    onResultFilterChange={handleResultFilterChange}
                />

                <DashboardCategoryFilters
                    categories={categories}
                    categoryFilters={categoryFilters}
                    dashboardData={dashboardData}
                    toggleCategoryFilter={toggleCategoryFilter}
                />

                <DashboardPeriod dateFilter={dateFilter} setDateFilter={handleDateFilterChange} analysisResults={analysisResults} />

                <DashboardStats
                    analysisResults={analysisResults}
                    problematicValuesLength={problematicValuesLength}
                    filteredAnalysisResults={filteredAnalysisResults}
                    filteredProblematicValuesLength={filteredProblematicValuesLength}
                    showPeriodCards={showPeriodCards}
                />

                {viewMode === 'cards' ? (
                    <DashboardMiniCards
                        analysisResults={analysisResults}
                        categoriesById={categoriesById}
                        categoryFilters={categoryFilters}
                        dataCategories={dashboardData}
                        dateFilter={dateFilter}
                        resultFilter={resultFilter}
                        onChartClick={onChartClick}
                    />
                ) : (
                    <DashboardListView
                        analysisResults={analysisResults}
                        categoriesById={categoriesById}
                        categoryFilters={categoryFilters}
                        dataCategories={dashboardData}
                        dateFilter={dateFilter}
                        resultFilter={resultFilter}
                        onAnalysisClick={onChartClick}
                    />
                )}

                {showAddModal && (
                    <AddResultsModal
                        analysis={analysis}
                        clinics={clinics}
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            loadDashboardData();
                            setShowAddModal(false);
                        }}
                    />
                )}
            </div>
        </>
    );
};
