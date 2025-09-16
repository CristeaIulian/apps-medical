import React, { FC } from 'react';

import { Button } from '@memobit/libs';

import { ResultFilter, ViewMode } from '@pages/Dashboard/helpers/storage';

import './DashboardHeader.scss';

interface DashboardHeaderProps {
    onAddResults: () => void;
    onResultFilterChange: (resultFilter: ResultFilter) => void;
    resultFilter: ResultFilter;
    viewMode: ViewMode;
    onViewModeChange: (viewMode: ViewMode) => void;
}

export const DashboardHeader: FC<DashboardHeaderProps> = ({ onAddResults, onResultFilterChange, resultFilter, viewMode, onViewModeChange }) => {
    return (
        <div className="dashboard-header">
            <div className="dashboard-header__title">
                <h1>Dashboard Medical</h1>
                <p>Monitorizarea analizelor medicale pe termen lung</p>
            </div>
            <div className="dashboard-header__actions">
                <div className="dashboard-header__view-toggle">
                    <button className={`dashboard-header__toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => onViewModeChange('cards')}>
                        Cards
                    </button>
                    <button className={`dashboard-header__toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => onViewModeChange('list')}>
                        Listă
                    </button>
                </div>

                <div className="dashboard-header__result-filter">
                    <button className={`dashboard-header__toggle-btn ${resultFilter === 'all' ? 'active' : ''}`} onClick={() => onResultFilterChange('all')}>
                        Toate analizele
                    </button>
                    <button
                        className={`dashboard-header__toggle-btn ${resultFilter === 'problematic' ? 'active' : ''}`}
                        onClick={() => onResultFilterChange('problematic')}
                    >
                        Analize cu probleme
                    </button>
                </div>

                <Button variant="primary" onClick={onAddResults}>
                    + Adaugă Rezultate
                </Button>
            </div>
        </div>
    );
};
