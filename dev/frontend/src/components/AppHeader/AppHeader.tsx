import { FC } from 'react';

import { Button } from '@memobit/libs';
import { useNavigate } from 'react-router';

import './AppHeader.scss';

export const AppHeader: FC = () => {
    const navigate = useNavigate();
    const { pathname } = window.location;

    return (
        <div className="appHeader">
            <div className="appHeader-left">
                <h1 className="appHeader__title">Analize Medicale</h1>
                <p className="appHeader__subtitle">Monitorizarea sănătății pe termen lung</p>
            </div>
            <div className="appHeader-right">
                {pathname !== '/' && (
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        ← Dashboard
                    </Button>
                )}
                {pathname !== '/settings' && (
                    <Button variant="secondary" onClick={() => navigate('/settings')}>
                        🔬 Lista analize
                    </Button>
                )}
            </div>
        </div>
    );
};
