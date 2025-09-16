import React, { FC } from 'react';

import { Card } from '@memobit/libs';

import { AnalysisResults } from '../../../../types';

import './DashboardStats.scss';

interface DashboardStatsProps {
    analysisResults: AnalysisResults[];
    problematicValuesLength: number;
    filteredAnalysisResults: AnalysisResults[];
    filteredProblematicValuesLength: number;
    showPeriodCards: boolean;
}

export const DashboardStats: FC<DashboardStatsProps> = ({
    analysisResults,
    problematicValuesLength,
    filteredAnalysisResults,
    filteredProblematicValuesLength,
    showPeriodCards,
}) => {
    return (
        <div className="dashboard-stats">
            <Card className="dashboard-stats__stat">
                <h4>Total Analize</h4>
                <span className="dashboard-stats__value">
                    {showPeriodCards && <span className="dashboard-stats__value">{filteredAnalysisResults.length} / </span>}
                    {analysisResults.length}
                </span>
            </Card>

            <Card className="dashboard-stats__stat">
                <h4>Total Valori Problematice</h4>
                <span className={`dashboard-stats__value ${problematicValuesLength > 0 ? 'warning' : ''}`}>
                    {showPeriodCards && (
                        <span className={`dashboard-stats__value ${filteredProblematicValuesLength > 0 ? 'warning' : ''}`}>
                            {filteredProblematicValuesLength} /{' '}
                        </span>
                    )}
                    {problematicValuesLength}
                </span>
            </Card>
        </div>
    );
};
