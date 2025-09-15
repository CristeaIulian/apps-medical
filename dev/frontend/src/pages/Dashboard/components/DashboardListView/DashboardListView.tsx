import React, { FC } from 'react';

import { getAnalysisType, getGroupedAnalysisItem, getReferenceStatus, getValueStatus } from '@helpers/medicalHelpers';

import { AnalysisResults, CategoriesMapById, CategoryFilter, DateFilter } from '../../../../types';

import './DashboardListView.scss';

interface DashboardListViewProps {
    analysisResults: AnalysisResults[];
    categoriesById: CategoriesMapById;
    categoryFilters: CategoryFilter;
    dataCategories: { [p: number]: { analysisResults: AnalysisResults[] } };
    dateFilter: DateFilter;
    onAnalysisClick?: (analysisId: number) => void;
}

export const DashboardListView: FC<DashboardListViewProps> = ({
    analysisResults,
    categoriesById,
    categoryFilters,
    dataCategories,
    dateFilter,
    onAnalysisClick,
}) => {
    // Funcție pentru filtrarea rezultatelor
    const getFilteredResults = (): AnalysisResults[] => {
        if (dateFilter.type === 'preset' && dateFilter.preset === 'all') {
            return analysisResults;
        }

        const now = new Date();
        let startDate: Date;

        if (dateFilter.type === 'preset') {
            switch (dateFilter.preset) {
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '3months':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    return analysisResults;
            }
            return analysisResults.filter(result => new Date(result.date) >= startDate);
        } else {
            // Specific date filter
            const targetDate = dateFilter.specificDate;
            return analysisResults.filter(result => new Date(result.date).toISOString().split('T')[0] === targetDate);
        }
    };

    const getAnalysisRecords = (analysisId: number): AnalysisResults[] => {
        return getFilteredResults()
            .filter(result => result.analysisId === analysisId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
    };

    const getVisibleCategories = (): number[] => {
        return Object.keys(categoryFilters)
            .filter(categoryId => categoryFilters[Number(categoryId)])
            .filter(categoryId => {
                const categoryData = dataCategories[Number(categoryId)];
                return (categoryData?.analysisResults?.length || 0) > 0;
            })
            .map(categoryId => Number(categoryId));
    };

    const getStatusClass = (result: AnalysisResults): string => {
        const optimalRange = { min: result.optimalRangeMin, max: result.optimalRangeMax };
        const analysisType = getAnalysisType(result.value, optimalRange);

        let status: 'low' | 'optimal' | 'high';

        if (analysisType === 'chart') {
            status = getValueStatus(result.value, optimalRange);
        } else {
            status = getReferenceStatus(result.optimalReference, result.userReference);
        }

        return status;
    };

    const formatValue = (result: AnalysisResults): string => {
        const optimalRange = { min: result.optimalRangeMin, max: result.optimalRangeMax };
        const analysisType = getAnalysisType(result.value, optimalRange);

        if (analysisType === 'chart') {
            return `${result.value} ${result.unitName || ''}`.trim();
        } else {
            return result.userReference || '';
        }
    };

    const formatRange = (result: AnalysisResults): string => {
        const optimalRange = { min: result.optimalRangeMin, max: result.optimalRangeMax };
        const analysisType = getAnalysisType(result.value, optimalRange);

        if (analysisType === 'chart') {
            if (optimalRange.min !== null && optimalRange.max !== null) {
                return `${optimalRange.min} - ${optimalRange.max} ${result.unitName || ''}`.trim();
            } else if (optimalRange.min !== null) {
                return `> ${optimalRange.min} ${result.unitName || ''}`.trim();
            } else if (optimalRange.max !== null) {
                return `< ${optimalRange.max} ${result.unitName || ''}`.trim();
            }
            return '-';
        } else {
            return result.optimalReference || '-';
        }
    };

    const handleRowClick = (analysisId: number) => {
        if (onAnalysisClick) {
            onAnalysisClick(analysisId);
        }
    };

    return (
        <div className="dashboard-list-view">
            {getVisibleCategories().map(categoryId => {
                // Filter test types to only those with data
                const analysisResultWithData = dataCategories[categoryId].analysisResults.filter(analysisResult => {
                    const records = getAnalysisRecords(analysisResult.analysisId);
                    return records.length > 0;
                });

                // Only render the category if it has test types with data
                if (analysisResultWithData.length === 0) {
                    return null;
                }

                const analysisResultWithDataUnique = getGroupedAnalysisItem(analysisResultWithData);

                return (
                    <div key={`dashboard-list-category-${categoryId}`} className="dashboard-list-view__category">
                        <h2 className="dashboard-list-view__category-title">{categoriesById[categoryId].name}</h2>

                        <div className="dashboard-list-view__table">
                            <div className="dashboard-list-view__header">
                                <div className="dashboard-list-view__header-cell">Nume Analiză</div>
                                <div className="dashboard-list-view__header-cell">Valoare/Referință</div>
                                <div className="dashboard-list-view__header-cell">Range Normal</div>
                                <div className="dashboard-list-view__header-cell">Data</div>
                            </div>

                            {analysisResultWithDataUnique.map(arwd => {
                                const records = getAnalysisRecords(arwd.analysisId);

                                return records.map((record, index) => (
                                    <div
                                        key={`${arwd.analysisLogId}-${index}`}
                                        className={`dashboard-list-view__row ${getStatusClass(record)}`}
                                        onClick={() => handleRowClick(arwd.analysisId)}
                                    >
                                        <div className="dashboard-list-view__cell">
                                            <span className="dashboard-list-view__analysis-name">{arwd.analysisName}</span>
                                        </div>
                                        <div className="dashboard-list-view__cell">
                                            <span className="dashboard-list-view__value">{formatValue(record)}</span>
                                        </div>
                                        <div className="dashboard-list-view__cell">
                                            <span className="dashboard-list-view__range">{formatRange(record)}</span>
                                        </div>
                                        <div className="dashboard-list-view__cell">
                                            <span className="dashboard-list-view__date">
                                                {new Date(record.date).toLocaleDateString('ro-RO', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ));
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
