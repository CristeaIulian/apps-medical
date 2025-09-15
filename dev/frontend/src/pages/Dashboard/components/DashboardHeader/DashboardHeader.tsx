import React, { FC } from 'react';

import { Button } from '@memobit/libs';

import './DashboardHeader.scss';

interface DashboardHeaderProps {
    onAddResults: () => void;
}

export const DashboardHeader: FC<DashboardHeaderProps> = ({ onAddResults }) => {
    return (
        <div className="dashboard-header">
            <div className="dashboard-header__title">
                <h1>Dashboard Medical</h1>
                <p>Monitorizarea analizelor medicale pe termen lung</p>
            </div>
            <div className="dashboard-header__actions">
                <Button variant="primary" onClick={onAddResults}>
                    + Adaugă Rezultate
                </Button>
            </div>
        </div>
    );
};
