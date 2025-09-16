import { DateFilter } from '../../../types';

export type ViewMode = 'cards' | 'list';
export type ResultFilter = 'all' | 'problematic';

interface StorageContent {
    activeCategories: number[];
    dateFilter: DateFilter;
    viewMode: ViewMode;
    resultFilter: ResultFilter;
}

const LSAppKey = 'medical';

const getDefaultDateFilter = (): DateFilter => ({
    type: 'preset',
    preset: 'all',
});

const getDefaultViewMode = (): ViewMode => 'cards';

const getDefaultResultFilter = (): ResultFilter => 'all';

export const getStorageContent = (): StorageContent => {
    const storageContentLS = window.localStorage.getItem(LSAppKey);

    return storageContentLS
        ? {
              ...JSON.parse(storageContentLS),
              // Asigurăm că dateFilter există și are structura corectă
              dateFilter: JSON.parse(storageContentLS).dateFilter || getDefaultDateFilter(),
              // Asigurăm că viewMode există
              viewMode: JSON.parse(storageContentLS).viewMode || getDefaultViewMode(),
              // Asigurăm că resultFilter există
              resultFilter: JSON.parse(storageContentLS).resultFilter || getDefaultResultFilter(),
          }
        : {
              activeCategories: [],
              dateFilter: getDefaultDateFilter(),
              viewMode: getDefaultViewMode(),
              resultFilter: getDefaultResultFilter(),
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

export const updateStorageViewMode = (viewMode: ViewMode) => {
    const storageContent: StorageContent = getStorageContent();

    storageContent.viewMode = viewMode;

    window.localStorage.setItem(LSAppKey, JSON.stringify(storageContent));
};

export const getStorageViewMode = (): ViewMode => {
    const storageContent = getStorageContent();
    return storageContent.viewMode;
};

export const updateStorageResultFilter = (resultFilter: ResultFilter) => {
    const storageContent: StorageContent = getStorageContent();

    storageContent.resultFilter = resultFilter;

    window.localStorage.setItem(LSAppKey, JSON.stringify(storageContent));
};

export const getStorageResultFilter = (): ResultFilter => {
    const storageContent = getStorageContent();
    return storageContent.resultFilter;
};
