import React from 'react';

import { Login } from '@memobit/libs';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import AnalysisDetails from '@pages/AnalysisDetails/AnalysisDetails';
import { Dashboard } from '@pages/Dashboard';
import Settings from '@pages/Settings/Settings';

import '@memobit/libs/dist/index.css';
import './App.scss';

export const App = () => {
    return (
        <Router>
            <div className="app-container">
                <main className="main-content">
                    <div className="medical-app">
                        <div className="medical-app__content">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/analysisId/:id" element={<AnalysisDetails />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </div>
                    </div>
                </main>
            </div>

            <Login />
        </Router>
    );
};
