import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import { defineFlatConfig } from 'eslint-define-config'
import globals from 'globals'

export default defineFlatConfig([
  {
    ...js.configs.recommended,
    ignores: ['**/.*', 'dist/**/*', '*.d.ts', 'public/*', 'src/assets/**'],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      'no-debugger': 'warn',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'prettier/prettier': [
        'error',
        {
          /** 每一行的宽度 */
          printWidth: 120,
          /** Tab 键的空格数 */
          tabWidth: 2,
          /** 在对象中的括号之间是否用空格来间隔 */
          bracketSpacing: true,
          /** 箭头函数的参数无论有几个，都要括号包裹 */
          arrowParens: 'always',
          /** 换行符的使用 */
          endOfLine: 'auto',
          /** 是否采用单引号 */
          singleQuote: true,
          /** 对象或者数组的最后一个元素后面不要加逗号 */
          trailingComma: 'none',
          /** 是否加分号 */
          semi: false,
          /** 是否使用 Tab 格式化 */
          useTabs: false,
          /** 异步的回调async */
          noAsyncPromiseExecutor: 0,
          /** array的callback方法里需要有return */
          arrayCallbackReturn: 2,
          /** 不允许有debugger */
          noDebugger: 2
        }
      ]
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: {
        $: 'readonly',
        $$: 'readonly',
        $computed: 'readonly',
        $customRef: 'readonly',
        $ref: 'readonly',
        $shallowRef: 'readonly',
        $toRef: 'readonly'
      },
      parser: parserVue,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue'],
        sourceType: 'module'
      }
    },
    plugins: {
      vue: pluginVue
    },
    processor: pluginVue.processors['.vue'],
    rules: {
      ...pluginVue.configs.base.rules,
      ...pluginVue.configs['vue3-essential'].rules,
      ...pluginVue.configs['vue3-recommended'].rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-setup-props-reactivity-loss': 'off',
      'vue/no-v-model-argument': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      'no-debugger': 'warn'
    }
  }
])
