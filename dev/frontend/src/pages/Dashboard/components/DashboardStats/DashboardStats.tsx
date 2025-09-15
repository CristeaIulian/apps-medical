import React, { FC } from 'react';

import { Card } from '@memobit/libs';

import { ProblematicValuesData } from '@pages/Dashboard/components/ProblematicValues';

import { AnalysisResults } from '../../../../types';

import './DashboardStats.scss';

interface DashboardStatsProps {
    analysisResults: AnalysisResults[];
    problematicValues: ProblematicValuesData[];
    filteredAnalysisResults: AnalysisResults[];
    filteredProblematicValues: ProblematicValuesData[];
    showPeriodCards: boolean;
}

export const DashboardStats: FC<DashboardStatsProps> = ({
    analysisResults,
    problematicValues,
    filteredAnalysisResults,
    filteredProblematicValues,
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
                <span className={`dashboard-stats__value ${problematicValues.length > 0 ? 'warning' : ''}`}>
                    {showPeriodCards && (
                        <span className={`dashboard-stats__value ${filteredProblematicValues.length > 0 ? 'warning' : ''}`}>
                            {filteredProblematicValues.length} /{' '}
                        </span>
                    )}
                    {problematicValues.length}
                </span>
            </Card>
        </div>
    );
};
