import { DashboardData } from '@pages/Dashboard';
import { ResultFilter } from '@pages/Dashboard/helpers/storage';

import { AnalysisResults, CategoriesMapById, Category, DateFilter, OptimalRange } from '../types';

/**
 * Determines if a test result value is within the optimal range
 */
export const getValueStatus = (value: number, optimalRange: OptimalRange): 'optimal' | 'high' | 'low' => {
    if (optimalRange.max && value > optimalRange.max) {
        return 'high';
    }

    if (value < (optimalRange.min || 0)) {
        return 'low';
    }

    return 'optimal';
};

/**
 * Determines if a test result is not optimal
 */
export const getReferenceStatus = (optimalReference?: string, userReference?: string): 'optimal' | 'high' | 'low' => {
    return optimalReference === userReference ? 'optimal' : 'low';
};

export const getAnalysisType = (value: number | undefined, optimalRange: OptimalRange): 'chart' | 'reference' => {
    return typeof value === 'number' && (optimalRange.min || optimalRange.max) ? 'chart' : 'reference';
};

export const prepareDashboardData = (analysisResults: AnalysisResults[], categories: Category[]): DashboardData => {
    const dashboardData: DashboardData = [];

    categories.forEach(category => {
        dashboardData[category.id] = {
            analysisResults: analysisResults.filter(a => a.categoryId === category.id),
        };
    });

    return dashboardData;
};

export const getProblematicCount = (analysisResults: AnalysisResults[]): number => {
    return analysisResults.filter(result => {
        const analysisType = getAnalysisType(result.value, { min: result.optimalRangeMin, max: result.optimalRangeMax });
        const status: 'low' | 'optimal' | 'high' =
            analysisType === 'chart'
                ? getValueStatus(result.value, { min: result.optimalRangeMin, max: result.optimalRangeMax })
                : getReferenceStatus(result.optimalReference, result.userReference);

        return status !== 'optimal';
    }).length;
};

export const filterAnalysisResultsByDate = (analysisResults: AnalysisResults[], dateFilter: DateFilter): AnalysisResults[] => {
    if (dateFilter.type === 'preset' && (dateFilter.preset === 'all' || !dateFilter.preset)) {
        return analysisResults;
    }

    const now = new Date();
    let filterDate: Date;

    if (dateFilter.type === 'specific' && dateFilter.specificDate) {
        // Pentru data specifică, returnăm doar rezultatele din acea zi
        return analysisResults.filter(result => {
            const resultDate = new Date(result.date).toISOString().split('T')[0];
            return resultDate === dateFilter.specificDate;
        });
    }

    if (dateFilter.type === 'preset') {
        switch (dateFilter.preset) {
            case 'month':
                filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case '3months':
                filterDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                return analysisResults;
        }

        return analysisResults.filter(result => new Date(result.date) >= filterDate);
    }

    return analysisResults;
};

export const shouldShowPeriodCards = (dateFilter: DateFilter): boolean => {
    // Afișăm cardurile pentru perioada doar dacă nu e "toate datele" și avem o selecție validă
    if (dateFilter.type === 'preset' && (dateFilter.preset === 'all' || !dateFilter.preset)) {
        return false;
    }

    if (dateFilter.type === 'specific' && !dateFilter.specificDate) {
        return false;
    }

    return true;
};

export const getCategoriesMapById = (categories: Category[]): CategoriesMapById => Object.fromEntries(categories.map(({ id, name }) => [id, { name }]));

export const getGroupedAnalysisItem = (analysisResults: AnalysisResults[]) => {
    const rs: AnalysisResults[] = [];

    analysisResults.forEach(analysisResult => {
        const hasAnalysis = rs.find(r => r.analysisId === analysisResult.analysisId);

        if (!hasAnalysis) {
            rs.push(analysisResult);
        }
    });

    rs.sort((a, b) => a.analysisName.localeCompare(b.analysisName));

    return rs;
};

export const filterResultsByProblematic = (analysisResults: AnalysisResults[], resultFilter: ResultFilter): AnalysisResults[] => {
    if (resultFilter === 'all') {
        return analysisResults;
    }

    // Filter doar rezultatele problematice
    return analysisResults.filter(result => {
        const optimalRange = { min: result.optimalRangeMin, max: result.optimalRangeMax };
        const analysisType = getAnalysisType(result.value, optimalRange);

        let status: 'low' | 'optimal' | 'high';

        if (analysisType === 'chart') {
            status = getValueStatus(result.value, optimalRange);
        } else {
            status = getReferenceStatus(result.optimalReference, result.userReference);
        }

        return status !== 'optimal';
    });
};

export const getFilteredResults = (analysisResults: AnalysisResults[], dateFilter: DateFilter, resultFilter: ResultFilter): AnalysisResults[] => {
    let filteredByDate = analysisResults;

    if (dateFilter.type !== 'preset' || dateFilter.preset !== 'all') {
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
                    return filterResultsByProblematic(analysisResults, resultFilter);
            }
            filteredByDate = analysisResults.filter(result => new Date(result.date) >= startDate);
        } else {
            // Specific date filter
            const targetDate = dateFilter.specificDate;
            filteredByDate = analysisResults.filter(result => new Date(result.date).toISOString().split('T')[0] === targetDate);
        }
    }

    return filterResultsByProblematic(filteredByDate, resultFilter);
};
