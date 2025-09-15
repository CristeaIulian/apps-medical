import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Card, ConfirmDialog, Loading, Toast } from '@memobit/libs';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

import { AppHeader } from '@components/AppHeader';
import { ChartCard } from '@components/ChartCard';
import { ChartDataPoint, ChartView } from '@components/ChartView';
import { getAnalysisType } from '@helpers/medicalHelpers';

import { deleteAnalysisResult, loadAnalysisResultsByType } from '../../services/api';
import { AnalysisResults } from '../../types';

import './AnalysisDetails.scss';

interface DateRange {
    start: string;
    end: string;
    label: string;
}

interface DeleteConfirmState {
    isOpen: boolean;
    resultId: number | null;
    resultValue?: string;
    resultDate?: string;
}

const AnalysisDetails: FC = () => {
    const navigate = useNavigate();
    const params = useParams();
    const analysisId = Number(params.id);
    const [analysisByTypeDetails, setAnalysisByTypeDetails] = useState<AnalysisResults | null>(null);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults[]>([]);
    const [filteredResults, setFilteredResults] = useState<AnalysisResults[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
        isOpen: false,
        resultId: null,
    });

    const dateRanges: DateRange[] = useMemo(
        () => [
            {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                label: 'Ultima lună',
            },
            {
                start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                label: 'Ultimele 3 luni',
            },
            {
                start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                label: 'Ultimul an',
            },
            {
                start: new Date(2020, 0, 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                label: 'Toate datele',
            },
        ],
        []
    );

    const loadAnalysisData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [analysisResultsByTypeResponse] = await Promise.all([loadAnalysisResultsByType(analysisId)]);

            if (analysisResultsByTypeResponse.success) {
                const analysisByType = analysisResultsByTypeResponse.data.find(a => a.analysisId === analysisId);

                if (analysisByType) {
                    setAnalysisByTypeDetails(analysisByType);
                } else {
                    setError('Tipul de analiză nu a fost găsit');
                    return;
                }
            } else {
                setError('Eroare la încărcarea tipului de analiză');
                return;
            }

            if (analysisResultsByTypeResponse.success) {
                const analysisResultsByType = analysisResultsByTypeResponse.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setAnalysisResults(analysisResultsByType);

                // Set default date range based on data availability
                if (analysisResultsByType.length > 0) {
                    const oldestDate = new Date(analysisResultsByType[0].date);
                    const now = new Date();
                    const monthsAgo = (now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

                    if (monthsAgo <= 1) {
                        setSelectedDateRange(dateRanges[0]); // Last month
                    } else if (monthsAgo <= 3) {
                        setSelectedDateRange(dateRanges[1]); // Last 3 months
                    } else if (monthsAgo <= 12) {
                        setSelectedDateRange(dateRanges[2]); // Last year
                    } else {
                        setSelectedDateRange(dateRanges[3]); // All data
                    }
                }
            } else {
                setError('Eroare la încărcarea rezultatelor');
            }
        } catch (err) {
            setError('Eroare la încărcarea datelor');
            console.error('Error loading test data:', err);
        } finally {
            setLoading(false);
        }
    }, [dateRanges, analysisId]);

    const filterResults = useCallback(() => {
        if (!selectedDateRange) {
            setFilteredResults(analysisResults);
            return;
        }

        const startDate = new Date(selectedDateRange.start);
        const endDate = new Date(selectedDateRange.end);

        const filtered = analysisResults.filter(result => {
            const resultDate = new Date(result.date);
            return resultDate >= startDate && resultDate <= endDate;
        });

        setFilteredResults(filtered);
    }, [selectedDateRange, analysisResults]);

    useEffect(() => {
        loadAnalysisData();
    }, [loadAnalysisData, analysisId]);

    useEffect(() => {
        filterResults();
    }, [analysisResults, selectedDateRange, filterResults]);

    const getChartData = (): ChartDataPoint[] => {
        return filteredResults.map(result => ({
            date: result.date.toString(),
            value: result.value,
            label: `${result.clinicName} - ${new Date(result.date).toLocaleDateString('ro-RO')}`,
        }));
    };

    const getStatistics = () => {
        if (filteredResults.length === 0) return null;

        const values = filteredResults.map(r => r.value || 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const latest = filteredResults[filteredResults.length - 1];

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (filteredResults.length >= 2) {
            const previous = filteredResults[filteredResults.length - 2];
            const change = ((latest.value - previous.value) / previous.value) * 100;
            if (change > 5) trend = 'up';
            else if (change < -5) trend = 'down';
        }

        return { min, max, avg, latest, trend };
    };

    const getValueStatus = (value: number): 'optimal' | 'high' | 'low' => {
        if (!analysisByTypeDetails) return 'optimal';

        if (value > (analysisByTypeDetails.optimalRangeMax || 0)) return 'high';
        if (value < (analysisByTypeDetails.optimalRangeMin || 0)) return 'low';
        return 'optimal';
    };

    const handleDeleteResult = (resultId: number) => {
        // Găsește rezultatul pentru detalii în confirm dialog
        const result = filteredResults.find(r => r.analysisId === resultId);

        setDeleteConfirm({
            isOpen: true,
            resultId,
            resultValue: result ? `${result.value}${analysisByTypeDetails?.unitName}` : '',
            resultDate: result ? new Date(result.date).toLocaleDateString('ro-RO') : '',
        });
    };

    const confirmDeleteResult = async () => {
        const { resultId } = deleteConfirm;
        if (!resultId) return;

        try {
            const response = await deleteAnalysisResult(resultId);

            if (response.success) {
                setAnalysisResults(prev => prev.filter(r => r.analysisLogId !== resultId));
                setToast({
                    message: 'Rezultatul a fost șters',
                    type: 'success',
                });
            } else {
                setToast({
                    message: response.error || 'Eroare la ștergerea rezultatului',
                    type: 'error',
                });
            }
        } catch (err) {
            setToast({
                message: 'Eroare la ștergerea rezultatului',
                type: 'error',
            });
        } finally {
            setDeleteConfirm({ isOpen: false, resultId: null });
        }
    };

    const onBackClick = (): void => {
        navigate(`/`);
    };

    if (loading) {
        return (
            <div className="test-details">
                <div className="test-details__loading">
                    <Loading />
                    <p>Se încarcă detaliile analizei...</p>
                </div>
            </div>
        );
    }

    if (error || !analysisByTypeDetails) {
        return (
            <div className="test-details">
                <div className="test-details__error">
                    <h2>Eroare</h2>
                    <p>{error || 'Analiza nu a fost găsită'}</p>
                    <Button onClick={onBackClick}>Înapoi la Dashboard</Button>
                </div>
            </div>
        );
    }

    const statistics = getStatistics();

    const optimalRange = { min: analysisByTypeDetails?.optimalRangeMin, max: analysisByTypeDetails?.optimalRangeMax };
    const analysisType = getAnalysisType(filteredResults?.[0]?.value, optimalRange);

    return (
        <>
            <AppHeader />
            <div className="test-details">
                {/* Header */}
                <div className="test-details__header">
                    <div className="test-details__header-left">
                        <Button variant="secondary" size="small" onClick={onBackClick}>
                            ← Înapoi
                        </Button>
                        <div className="test-details__title">
                            <h1>{analysisByTypeDetails.analysisName}</h1>
                            <p>Istoric complet al analizei</p>
                        </div>
                    </div>
                </div>

                {/* Date Range Filters */}
                <div className="test-details__filters">
                    <h3>Perioada afișată</h3>
                    <div className="test-details__date-ranges">
                        {dateRanges.map((range, index) => (
                            <button
                                key={`date-range-${index}`}
                                className={`test-details__date-range ${selectedDateRange?.label === range.label ? 'active' : ''}`}
                                onClick={() => setSelectedDateRange(range)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="test-details__stats">
                        {!analysisByTypeDetails.userReference && (
                            <Card className="test-details__stat">
                                <h4>Ultima valoare</h4>
                                <div className={`test-details__stat-value ${getValueStatus(statistics.latest.value)}`}>
                                    {statistics.latest.value}
                                    {analysisByTypeDetails.unitName}
                                    <span className="test-details__stat-trend">
                                        {statistics.trend === 'up' && '↗️'}
                                        {statistics.trend === 'down' && '↘️'}
                                        {statistics.trend === 'stable' && '→'}
                                    </span>
                                </div>
                                <span className="test-details__stat-date">{new Date(statistics.latest.date).toLocaleDateString('ro-RO')}</span>
                            </Card>
                        )}

                        {!analysisByTypeDetails.userReference && (
                            <Card className="test-details__stat">
                                <h4>Valoare medie</h4>
                                <div className={`test-details__stat-value ${getValueStatus(statistics.avg)}`}>
                                    {statistics.avg.toFixed(2)}
                                    {analysisByTypeDetails.unitName}
                                </div>
                                <span className="test-details__stat-subtitle">în perioada selectată</span>
                            </Card>
                        )}

                        {!analysisByTypeDetails.userReference && (
                            <Card className="test-details__stat">
                                <h4>Interval</h4>
                                <div className="test-details__stat-range">
                                    <span className={getValueStatus(statistics.min)}>
                                        {statistics.min}
                                        {analysisByTypeDetails.unitName}
                                    </span>
                                    <span className="test-details__stat-separator">-</span>
                                    <span className={getValueStatus(statistics.max)}>
                                        {statistics.max}
                                        {analysisByTypeDetails.unitName}
                                    </span>
                                </div>
                                <span className="test-details__stat-subtitle">min - max</span>
                            </Card>
                        )}

                        <Card className="test-details__stat">
                            <h4>Total măsurători</h4>
                            <div className="test-details__stat-value">{filteredResults.length}</div>
                            <span className="test-details__stat-subtitle">în perioada selectată</span>
                        </Card>
                    </div>
                )}

                {/* Chart */}
                <div className="test-details__chart-section">
                    <Card>
                        <div className="test-details__chart-header">
                            <h3>Evoluția în timp</h3>
                            <div className="test-details__optimal-range">
                                Interval optim:{' '}
                                {analysisByTypeDetails.optimalReference ? (
                                    analysisByTypeDetails.optimalReference
                                ) : (
                                    <span>
                                        {analysisByTypeDetails.optimalRangeMin} - {analysisByTypeDetails.optimalRangeMax} {analysisByTypeDetails.unitName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {filteredResults.length > 0 ? (
                            <ChartCard isMini={false} unit={analysisByTypeDetails.unitName}>
                                {analysisType === 'chart' ? (
                                    <ChartView
                                        data={getChartData()}
                                        height={400}
                                        isMini={false}
                                        optimalRange={optimalRange}
                                        showGrid={true}
                                        showLegend={true}
                                        title={`${analysisByTypeDetails.analysisName} - ${selectedDateRange?.label || 'Toate datele'}`}
                                        unit={analysisByTypeDetails.unitName}
                                    />
                                ) : (
                                    <span>
                                        {filteredResults.map(fr => (
                                            <>
                                                <div>{fr.userReference}</div>
                                                <div style={{ fontStyle: 'italic', fontSize: '12px' }}>{fr.notes}</div>
                                            </>
                                        ))}
                                    </span>
                                )}
                            </ChartCard>
                        ) : (
                            <div className="test-details__no-data">
                                <p>Nu există date pentru perioada selectată</p>
                                <Button onClick={() => setSelectedDateRange(dateRanges[3])}>Vezi toate datele</Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Results Table */}
                <div className="test-details__table-section">
                    <Card>
                        <h3>Toate rezultatele ({filteredResults.length})</h3>
                        {filteredResults.length > 0 ? (
                            <div className="test-details__table">
                                <div className="test-details__table-header">
                                    <span>Data</span>
                                    <span>Valoare</span>
                                    <span>Status</span>
                                    <span>Clinică</span>
                                    <span>Observații</span>
                                    <span>Acțiuni</span>
                                </div>
                                <div className="test-details__table-body">
                                    {[...filteredResults].reverse().map(result => (
                                        <div key={`analysis-list-${result.analysisLogId}`} className="test-details__table-row">
                                            <span className="test-details__table-date">{new Date(result.date).toLocaleDateString('ro-RO')}</span>
                                            <span className="test-details__table-value">
                                                {result.value}
                                                {analysisByTypeDetails.unitName}
                                                {analysisByTypeDetails.userReference}
                                            </span>
                                            <span className={`test-details__table-status ${getValueStatus(result.value)}`}>
                                                {getValueStatus(result.value) === 'optimal' && '✓ Optim'}
                                                {getValueStatus(result.value) === 'high' && '↑ Ridicat'}
                                                {getValueStatus(result.value) === 'low' && '↓ Scăzut'}
                                            </span>
                                            <span className="test-details__table-clinic">{result.clinicName}</span>
                                            <span className="test-details__table-notes">{result.notes || '-'}</span>
                                            <span className="test-details__table-actions">
                                                <Button variant="danger" size="small" onClick={() => handleDeleteResult(result.analysisLogId)}>
                                                    Șterge
                                                </Button>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="test-details__no-results">
                                <p>Nu există rezultate în perioada selectată</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Toast notifications */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <ConfirmDialog
                    isOpen={deleteConfirm.isOpen}
                    title="Confirmă ștergerea rezultatului"
                    message={`Ești sigur că vrei să ștergi rezultatul ${deleteConfirm.resultValue} din data de ${deleteConfirm.resultDate}? Această acțiune nu poate fi anulată.`}
                    confirmText="Șterge"
                    cancelText="Anulează"
                    onConfirm={confirmDeleteResult}
                    onCancel={() => setDeleteConfirm({ isOpen: false, resultId: null })}
                    type="danger"
                />
            </div>
        </>
    );
};

export default AnalysisDetails;
