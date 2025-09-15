import { DateFilter } from '../../../types';

interface StorageContent {
    activeCategories: number[];
    dateFilter: DateFilter;
}

const LSAppKey = 'medical';

const getDefaultDateFilter = (): DateFilter => ({
    type: 'preset',
    preset: 'all',
});

export const getStorageContent = (): StorageContent => {
    const storageContentLS = window.localStorage.getItem(LSAppKey);

    return storageContentLS
        ? {
              ...JSON.parse(storageContentLS),
              dateFilter: JSON.parse(storageContentLS).dateFilter || getDefaultDateFilter(),
          }
        : {
              activeCategories: [],
              dateFilter: getDefaultDateFilter(),
          };
};

export const updateStorageFilterCategories = (categoryId: number, state: 'add' | 'remove') => {
    const storageContent: StorageContent = getStorageContent();

    if (state === 'add') {
        if (!storageContent.activeCategories.includes(categoryId)) {
            storageContent.activeCategories.push(categoryId);
        }
    }

    if (state === 'remove') {
        storageContent.activeCategories = storageContent.activeCategories.filter(activeCategoryId => activeCategoryId !== categoryId);
    }

    window.localStorage.setItem(LSAppKey, JSON.stringify(storageContent));
};

export const updateStorageDateFilter = (dateFilter: DateFilter) => {
    const storageContent: StorageContent = getStorageContent();

    storageContent.dateFilter = dateFilter;

    window.localStorage.setItem(LSAppKey, JSON.stringify(storageContent));
};

export const getStorageDateFilter = (): DateFilter => {
    const storageContent = getStorageContent();
    return storageContent.dateFilter;
};
