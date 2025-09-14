import { ProblematicValuesData } from '@pages/Dashboard/components/ProblematicValues/ProblematicValues';
import { DashboardData } from '@pages/Dashboard/Dashboard';

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
