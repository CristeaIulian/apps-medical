import React, { FC } from 'react';

import { DashboardData } from '@pages/Dashboard';

import { Category, CategoryFilter } from '../../../../types';

import './DashboardCategoryFilters.scss';

interface DashboardCategoryFiltersProps {
    categories: Category[];
    categoryFilters: CategoryFilter;
    dashboardData: DashboardData;
    toggleCategoryFilter: (categoryId: number) => void;
}

export const DashboardCategoryFilters: FC<DashboardCategoryFiltersProps> = ({ categories, categoryFilters, dashboardData, toggleCategoryFilter }) => {
    return (
        <div className="dashboard-category-filters">
            <h3>Categorii</h3>
            <div className="dashboard-category-filters__list">
                {categories.map(({ name: categoryName, id: categoryId }) => (
                    <button
                        key={categoryId}
                        className={`dashboard-category-filters__filter ${categoryFilters[categoryId] ? 'active' : ''}`}
                        onClick={() => toggleCategoryFilter(categoryId)}
                    >
                        {categoryName}
                        {dashboardData[categoryId]?.analysisResults.length > 0 && (
                            <span className="dashboard-category-filters__count">{dashboardData[categoryId].analysisResults.length}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
