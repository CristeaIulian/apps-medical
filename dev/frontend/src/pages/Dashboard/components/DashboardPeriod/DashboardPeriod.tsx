import React, { useEffect, useState } from 'react';

import { Button, Dropdown, DropdownOption } from '@memobit/libs';

import { DateFilter } from '@pages/Dashboard/Dashboard';

import { AnalysisResults } from '../../../../types';

interface DashboardPeriodProps {
    analysisResults: AnalysisResults[];
    dateFilter: DateFilter;
    setDateFilter: (dateFilter: DateFilter) => void;
}

export const DashboardPeriod: React.FC<DashboardPeriodProps> = ({ analysisResults, dateFilter, setDateFilter }) => {
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    useEffect(() => {
        if (analysisResults.length > 0) {
            const uniqueDates = [...new Set(analysisResults.map(result => new Date(result.date).toISOString().split('T')[0]))].sort().reverse(); // Cele mai recente primul
            setAvailableDates(uniqueDates);
        }
    }, [analysisResults]);

    const handleAnalysisDaySelection = (type: 'preset' | 'specific', newSelection: DropdownOption | DropdownOption[] | null) => {
        if (typeof newSelection === 'object' && !Array.isArray(newSelection) && newSelection) {
            setDateFilter({ type, specificDate: newSelection?.value.toString() });
        }
    };

    return (
        <div className="dashboard__date-filters">
            <h3>Perioada</h3>
            <div className="dashboard__date-filter-controls">
                <div className="dashboard__preset-filters">
                    {[
                        { key: 'month', label: 'Ultima lună' },
                        { key: '3months', label: 'Ultimele 3 luni' },
                        { key: 'year', label: 'Ultimul an' },
                        { key: 'all', label: 'Toate datele' },
                    ].map(preset => (
                        <Button
                            key={preset.key}
                            className={`dashboard__date-filter ${dateFilter.type === 'preset' && dateFilter.preset === preset.key ? 'active' : ''}`}
                            onClick={() => setDateFilter({ type: 'preset', preset: preset.key, specificDate: undefined })}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>

                <div className="dashboard__specific-date">
                    <label>Sau selectează o zi anume:</label>
                    <Dropdown
                        key={`analyses-available-dates`}
                        name="analyses-available-dates"
                        options={availableDates.map(date => ({
                            value: date,
                            label: new Date(date).toLocaleDateString('ro-RO', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            }),
                            searchText: date,
                        }))}
                        value={dateFilter.type === 'specific' ? dateFilter.specificDate || '' : ''}
                        onChange={newSelection => handleAnalysisDaySelection('specific', newSelection)}
                        placeholder="Selectează data..."
                        searchable
                    />
                </div>
            </div>
        </div>
    );
};
