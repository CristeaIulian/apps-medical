module.exports = {
    extends: ['react-app', 'react-app/jest'],
    plugins: ['import', 'simple-import-sort'],
    rules: {
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    // React first
                    ['^react$'],
                    // Other node modules
                    ['^@?\\w'],
                    // Alias imports - ADD partials paths
                    ['^@components', '^@helpers', '^@hooks', '^@pages', '^@services', '^@types', '^@mocks'],
                    // Parent imports
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                    // Sibling imports
                    ['^\\./'],
                    // Style imports
                    ['^.+\\.s?css$'],
                ],
            },
        ],
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
    },
};
