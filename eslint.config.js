import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['.wxt/**', '.output/**'],
  rules: {
    'ts/method-signature-style': 'off',
    'ts/no-redeclare': 'off',
    'no-console': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'vue/no-v-text-v-html-on-component': 'off',
    'no-alert': 'off',
    'style/indent-binary-ops': 'off',
  },
})
