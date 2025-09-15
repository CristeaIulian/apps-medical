import { DashboardData, DateFilter } from '@pages/Dashboard';
import { ProblematicValuesData } from '@pages/Dashboard/components/ProblematicValues/ProblematicValues';

import { AnalysisResults, CategoriesMapById, Category, Clinic, ClinicsMapById, OptimalRange } from '../types';

/**
 * Determines if a test result value is within the optimal range
 */
export const getValueStatus = (value: number, optimalRange: OptimalRange): 'optimal' | 'high' | 'low' => {
    if (value > (optimalRange.max || 0)) return 'high';
    if (value < (optimalRange.min || 0)) return 'low';
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

export const getProblematicData = (analysisResults: AnalysisResults[]): ProblematicValuesData[] => {
    return Object.values(analysisResults)
        .map(result => {
            const analysisType = getAnalysisType(result.value, { min: result.optimalRangeMin, max: result.optimalRangeMax });
            let status: 'low' | 'optimal' | 'high' =
                analysisType === 'chart'
                    ? getValueStatus(result.value, { min: result.optimalRangeMin, max: result.optimalRangeMax })
                    : getReferenceStatus(result.optimalReference, result.userReference);

            if (status !== 'optimal') {
                return { result, deviation: status as 'high' | 'low' };
            }

            return null;
        })
        .filter(item => item !== null) as any[];
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

export const getPeriodLabel = (dateFilter: DateFilter): string => {
    if (dateFilter.type === 'specific' && dateFilter.specificDate) {
        return new Date(dateFilter.specificDate).toLocaleDateString('ro-RO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    if (dateFilter.type === 'preset') {
        switch (dateFilter.preset) {
            case 'month':
                return 'ULTIMELE 30 ZILE';
            case '3months':
                return 'ULTIMELE 3 LUNI';
            case 'year':
                return 'ULTIMUL AN';
            default:
                return 'PERIOADA SELECTATĂ';
        }
    }

    return 'PERIOADA SELECTATĂ';
};

export const getCategoriesMapById = (categories: Category[]): CategoriesMapById => Object.fromEntries(categories.map(({ id, name }) => [id, { name }]));

export const getClinicsMapById = (clinics: Clinic[]): ClinicsMapById => Object.fromEntries(clinics.map(({ id, name }) => [id, { name }]));

export const getGroupedAnalysisItem = (analysisResults: AnalysisResults[]) => {
    const rs: AnalysisResults[] = [];

    analysisResults.forEach(analysisResult => {
        const hasAnalysis = rs.find(r => r.analysisId === analysisResult.analysisId);

        if (!hasAnalysis) {
            rs.push(analysisResult);
        }
    });

    return rs;
};
