import React, { useEffect, useState } from 'react';

import { Dropdown, DropdownOption } from '@memobit/libs';

import { AnalysisResults, DateFilter } from '../../../../types';

import './DashboardPeriod.scss';

interface DashboardPeriodProps {
    analysisResults: AnalysisResults[];
    dateFilter: DateFilter;
    setDateFilter: (dateFilter: DateFilter) => void;
}

export const DashboardPeriod: React.FC<DashboardPeriodProps> = ({ analysisResults, dateFilter, setDateFilter }) => {
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    // Opțiunile pentru dropdown-ul de perioada
    const periodOptions: DropdownOption[] = [
        { value: 'month', label: 'Ultima lună' },
        { value: '3months', label: 'Ultimele 3 luni' },
        { value: 'year', label: 'Ultimul an' },
        { value: 'all', label: 'Toate datele' },
    ];

    useEffect(() => {
        if (analysisResults.length > 0) {
            const uniqueDates = [...new Set(analysisResults.map(result => new Date(result.date).toISOString().split('T')[0]))].sort().reverse(); // Cele mai recente primul
            setAvailableDates(uniqueDates);
        }
    }, [analysisResults]);

    const handlePeriodSelection = (newSelection: DropdownOption | DropdownOption[] | null) => {
        if (typeof newSelection === 'object' && !Array.isArray(newSelection) && newSelection) {
            setDateFilter({ type: 'preset', preset: newSelection.value.toString(), specificDate: undefined });
        }
    };

    const handleAnalysisDaySelection = (newSelection: DropdownOption | DropdownOption[] | null) => {
        if (typeof newSelection === 'object' && !Array.isArray(newSelection) && newSelection) {
            setDateFilter({ type: 'specific', specificDate: newSelection.value.toString() });
        }
    };

    // Determinăm valoarea curentă pentru dropdown-ul de perioada
    const getCurrentPeriodValue = (): string => {
        if (dateFilter.type === 'preset' && dateFilter.preset) {
            return dateFilter.preset;
        }
        return '';
    };

    return (
        <div className="dashboard__date-filters">
            <h3>Perioada</h3>
            <div className="dashboard__date-filter-controls">
                <div className="dashboard__period-dropdown">
                    <label>Selectează perioada:</label>
                    <Dropdown
                        key="period-filter"
                        name="period-filter"
                        options={periodOptions}
                        value={getCurrentPeriodValue()}
                        onChange={handlePeriodSelection}
                        placeholder="Selectează perioada..."
                        searchable
                    />
                </div>

                <div className="dashboard__specific-date">
                    <label>Sau selectează o zi anume:</label>
                    <Dropdown
                        key="analyses-available-dates"
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
                        onChange={handleAnalysisDaySelection}
                        placeholder="Selectează data..."
                        searchable
                    />
                </div>
            </div>
        </div>
    );
};
