export interface Analysis {
    analysisName: string;
    analysisId: number;
    categoryId: number;
    categoryName: string;
    analysisLogId: number;
    optimalRangeMax?: number;
    optimalRangeMin?: number;
    reference?: string;
    unitId: number;
    unitName: string;
}

export interface AnalysisResults {
    analysisName: string;
    analysisId: number;
    categoryId: number;
    categoryName: string;
    clinicId: number;
    clinicName: string;
    date: string;
    analysisLogId: number;
    optimalRangeMax?: number;
    optimalRangeMin?: number;
    unitId: number;
    unitName: string;
    notes?: string;
    userReference?: string;
    optimalReference?: string;
    value: number;
}

export interface Category {
    id: number;
    name: string;
}

export type CategoriesMapById = Record<number, { name: string }>;
export type ClinicsMapById = Record<number, { name: string }>;

export interface Clinic {
    uid: number;
    id: string;
    name: string;
    usageCount: number;
    lastUsed?: Date;
}

export interface AnalysisSaveDTO {
    id?: number;
    analysisName: string;
    categoryId: number;
    unitName?: string;
    optimalRangeMin?: number;
    optimalRangeMax?: number;
    reference?: string;
}

export interface AnalysisResultSaveDTO {
    date: string;
    clinicId: number;
    analysisId: number;
    value?: number;
    notes?: string;
}

// @Todo: drop this??
export interface OptimalRange {
    min?: number;
    max?: number;
}
