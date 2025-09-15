import { FC } from 'react';

import { ChartCard } from '@components/ChartCard';
import { ChartDataPoint, ChartView } from '@components/ChartView';
import { getAnalysisType, getGroupedAnalysisItem, getReferenceStatus, getValueStatus } from '@helpers/medicalHelpers';

import { AnalysisResults, CategoriesMapById, CategoryFilter, DateFilter } from '../../../../types';

interface DashboardMiniCardsProps {
    analysisResults: AnalysisResults[];
    categoriesById: CategoriesMapById;
    categoryFilters: CategoryFilter;
    dataCategories: { [p: number]: { analysisResults: AnalysisResults[] } };
    dateFilter: DateFilter;
    onChartClick?: (analysisId: number) => void;
}

export const DashboardMiniCards: FC<DashboardMiniCardsProps> = ({
    analysisResults,
    categoriesById,
    categoryFilters,
    dataCategories,
    dateFilter,
    onChartClick,
}: DashboardMiniCardsProps) => {
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
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const getChartDataForItem = (analysisId: number): ChartDataPoint[] => {
        return getAnalysisRecords(analysisId).map(result => ({
            date: new Date(result.date).toISOString(),
            value: result.value,
            label: result.clinicName,
        }));
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

    const handleChartClick = (analysisId: number) => {
        if (onChartClick) {
            onChartClick(analysisId);
        }
    };

    return (
        <div className="dashboard__content">
            {getVisibleCategories().map(categoryId => {
                // Filter test types to only those with data
                const analysisResultWithData = dataCategories[categoryId].analysisResults.filter(analysisResult => {
                    const chartData = getChartDataForItem(analysisResult.analysisId);
                    return chartData.length > 0;
                });

                // Only render the category if it has test types with data
                if (analysisResultWithData.length === 0) {
                    return null;
                }

                const analysisResultWithDataUnique = getGroupedAnalysisItem(analysisResultWithData);

                return (
                    <div key={`dashboard-category-${categoryId}`} className="dashboard__category">
                        <h2 className="dashboard__category-title">{categoriesById[categoryId].name}</h2>
                        <div className="dashboard__charts-grid">
                            {analysisResultWithDataUnique.map(arwd => {
                                const optimalRange = { min: arwd?.optimalRangeMin, max: arwd?.optimalRangeMax };
                                const analysisType = getAnalysisType(arwd.value, optimalRange);

                                let chartData: ChartDataPoint[] = [];
                                let optimalStatus: 'low' | 'optimal' | 'high' | undefined;
                                let lastRecord: AnalysisResults | undefined;
                                let footerNoteValue: string = '';
                                let lastItemDate: string | undefined;
                                let hadIssuesDuringTimeline = false;

                                if (analysisType === 'chart') {
                                    chartData = getChartDataForItem(arwd.analysisId);

                                    const analysisRecords = getAnalysisRecords(arwd.analysisId);
                                    lastRecord = analysisRecords[analysisRecords.length - 1];
                                    optimalStatus = getValueStatus(lastRecord?.value, optimalRange);
                                    hadIssuesDuringTimeline = analysisRecords.some(ar => getValueStatus(ar?.value, optimalRange) !== 'optimal');
                                    footerNoteValue = lastRecord?.value.toString();
                                    lastItemDate = lastRecord?.date;
                                } else {
                                    const analysisRecords = getAnalysisRecords(arwd.analysisId);
                                    lastRecord = analysisRecords[analysisRecords.length - 1];
                                    optimalStatus = getReferenceStatus(lastRecord.optimalReference, lastRecord.userReference);
                                    hadIssuesDuringTimeline = analysisRecords.some(
                                        ar => getReferenceStatus(ar.optimalReference, ar.userReference) !== 'optimal'
                                    );
                                    footerNoteValue = lastRecord?.userReference || '';
                                    lastItemDate = lastRecord?.date;
                                }

                                return (
                                    <div key={arwd.analysisLogId} className="dashboard__chart-container" onClick={() => handleChartClick(arwd.analysisId)}>
                                        <ChartCard
                                            footerNoteValue={footerNoteValue}
                                            hadIssuesDuringTimeline={hadIssuesDuringTimeline}
                                            isMini={true}
                                            lastItemDate={lastItemDate}
                                            optimalStatus={optimalStatus}
                                            title={arwd.analysisName}
                                            unit={arwd.unitName}
                                        >
                                            {analysisType === 'chart' ? (
                                                <ChartView
                                                    data={chartData}
                                                    height={120}
                                                    isMini={true}
                                                    optimalRange={optimalRange}
                                                    showGrid={false}
                                                    showLegend={false}
                                                    title={arwd.analysisName}
                                                    unit={arwd.unitName}
                                                />
                                            ) : (
                                                <>
                                                    <div>{arwd.userReference}</div>
                                                    <div style={{ fontStyle: 'italic', fontSize: '12px' }}>{arwd.notes}</div>
                                                </>
                                            )}
                                        </ChartCard>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
