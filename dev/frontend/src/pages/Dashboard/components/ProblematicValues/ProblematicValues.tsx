import { FC, useState } from 'react';

import { Card } from '@memobit/libs';

import { AnalysisResults } from '../../../../types';

export interface ProblematicValuesData {
    result: AnalysisResults;
    deviation: 'high' | 'low';
}

interface ProblematicValuesProps {
    problematicValues: ProblematicValuesData[];
}

export const ProblematicValues: FC<ProblematicValuesProps> = ({ problematicValues }) => {
    const [showAll, setShowAll] = useState<boolean>(false);

    if (!problematicValues?.length) {
        return null;
    }

    const itemsToShow = showAll ? [...problematicValues] : problematicValues.slice(0, 5);

    return (
        <div className="dashboard__alerts">
            <Card className="dashboard__alert">
                <h3>⚠️ Valori care necesită atenție</h3>
                <div className="dashboard__problematic-list">
                    {itemsToShow.map(({ result, deviation }) => (
                        <div key={result.analysisLogId} className="dashboard__problematic-item">
                            <span className="dashboard__problematic-test">{result.analysisName}</span>
                            <span className={`dashboard__problematic-value ${deviation}`}>
                                {result.value}
                                {result.unitName}
                                {deviation === 'high' ? ' ↑' : ' ↓'}
                            </span>
                            <span className="dashboard__problematic-date">{new Date(result.date).toLocaleDateString('ro-RO')}</span>
                        </div>
                    ))}
                </div>
                {problematicValues.length > 5 && (
                    <p className="dashboard__see-more" onClick={() => setShowAll(!showAll)}>
                        {showAll ? '-' : '+'}
                        {problematicValues.length - 5} mai {showAll ? 'putine' : 'multe'}...
                    </p>
                )}
            </Card>
        </div>
    );
};
