module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-console": "off",
        'import/no-extraneous-dependencies': ['error', {
            devDependencies: [
              'test/**'
            ]
        }]
    },
};