module.exports = {
  extends: [
    'plugin:shopify/esnext',
    'plugin:shopify/node',
    'plugin:shopify/jest',
    'plugin:shopify/prettier',
  ],
  rules: {
    'babel/object-curly-spacing': ['error', 'always'],
    'babel/camelcase': 'off',
    'jest/no-try-expect': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
