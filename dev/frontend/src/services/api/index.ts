import { AnalysisResultSaveDTO, AnalysisSaveDTO } from '../../types';

import {
    ApiCallListAnalysisResultReturn,
    ApiCallListAnalysisResultsReturn,
    ApiCallListAnalysisReturn,
    ApiCallListCategoriesResultsReturn,
    ApiCallListClinicsReturn,
    apiRootPath,
    ResponseCreate,
    ResponseDelete,
} from './types';

export const getApiCall = async (url: string): Promise<any> => {
    try {
        const response = await fetch(`${apiRootPath}/${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error getting data entry: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting data from backend:', error);
        throw error;
    }
};

export const postApiCall = async (url: string, payload: any): Promise<ResponseCreate> => {
    try {
        const response = await fetch(`${apiRootPath}/${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error saving data entry: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving data to backend:', error);
        throw error;
    }
};

// Analysis
export const loadAnalysisList = async (): Promise<ApiCallListAnalysisReturn> => await getApiCall('analysis');

export const addAnalysis = async (analysisSave: AnalysisSaveDTO): Promise<ResponseCreate> => await postApiCall('analysis/add', analysisSave);

export const updateAnalysis = async (id: number, analysisSave: AnalysisSaveDTO): Promise<ResponseCreate> =>
    await postApiCall(`analysis/update/${id}`, analysisSave);

export const deleteAnalysis = async (id: number): Promise<ResponseDelete> => await getApiCall(`analysis/delete/${id}`);

// Analysis Results
export const loadAnalysisResults = async (): Promise<ApiCallListAnalysisResultsReturn> => await getApiCall('analysisLog');

export const loadAnalysisResult = async (id: number): Promise<ApiCallListAnalysisResultReturn> => await getApiCall(`analysisLog/get/${id}`);

export const loadAnalysisResultsByType = async (id: number): Promise<ApiCallListAnalysisResultsReturn> => await getApiCall(`analysisLog/getByType/${id}`);

export const saveAnalysisResults = async (analysisResults: AnalysisResultSaveDTO[]): Promise<ResponseCreate> =>
    await postApiCall('analysisLog/add', analysisResults);

export const addAnalysisResult = async (analysisResult: AnalysisResultSaveDTO): Promise<ResponseCreate> =>
    await postApiCall('analysisLog/addOne', analysisResult);

export const updateAnalysisResult = async (id: string, analysisResult: AnalysisResultSaveDTO): Promise<ResponseCreate> =>
    await postApiCall(`analysisLog/updateOne/${id}`, analysisResult);

export const deleteAnalysisResult = async (id: number): Promise<ResponseDelete> => await getApiCall(`analysisLog/delete/${id}`);

// Categories
export const loadCategories = async (): Promise<ApiCallListCategoriesResultsReturn> => await getApiCall('categories');

export const addCategory = async (categoryName: string): Promise<ResponseCreate> => await postApiCall('categories/add', { name: categoryName });

// Clinics
export const loadClinics = async (): Promise<ApiCallListClinicsReturn> => await getApiCall('clinics');

export const addClinic = async (clinicName: string): Promise<ResponseCreate> => await postApiCall('clinics/add', { name: clinicName });
