import { Analysis, AnalysisResults, Category, Clinic } from '../../types';

export interface ResponseCreate {
    error: string;
    id?: number;
    message: string;
    success: boolean;
}

export interface ResponseDelete {
    success: boolean;
    error: string;
    message: string;
}

export interface ResponseRead {
    success: boolean;
    error: string;
    data: any;
}

export interface ApiCallListAnalysisReturn extends ResponseRead {
    data: Analysis[];
}

export interface ApiCallListAnalysisResultReturn extends ResponseRead {
    data: AnalysisResults;
}

export interface ApiCallListAnalysisResultsReturn extends ResponseRead {
    data: AnalysisResults[];
}

export interface ApiCallListCategoriesResultsReturn extends ResponseRead {
    data: Category[];
}

export interface ApiCallListClinicsReturn extends ResponseRead {
    data: Clinic[];
}

export const apiRootPath = '/api';
