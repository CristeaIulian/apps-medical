interface StorageContent {
    activeCategories: number[];
}

const LSAppKey = 'medical';

export const getStorageContent = (): StorageContent => {
    const storageContentLS = window.localStorage.getItem(LSAppKey);

    return storageContentLS
        ? JSON.parse(storageContentLS)
        : {
              activeCategories: [],
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
