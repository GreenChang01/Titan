import {type FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
	{
		ignores: ['node_modules', 'postcss.config.mjs'],
	},
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
		},
		react: true,
		semicolon: true,
		rules: {
			// Since Next.js is used this can be disabled
			'react/react-in-jsx-scope': 'off',

			// Disable console logs in frontend
			'no-console': 'off',

			// Force exhaustive dependencies in useEffect hooks by default
			'react-hooks/exhaustive-deps': 'error',

			// Annoying
			'@typescript-eslint/capitalized-comments': 'off',
			'capitalized-comments': 'off',
			'unicorn/prevent-abbreviations': 'off',

			// Typescript rules - relax for faster development
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/no-deprecated': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/member-ordering': 'off',
			'@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',

			// Code rules
			'max-params': 'off',
			'no-await-in-loop': 'off',
			'no-warning-comments': 'off',
			'prefer-const': 'off',
			'no-promise-executor-return': 'off',
			'no-return-assign': 'off',
			complexity: 'off',

			// Node.js rules
			'n/prefer-global/process': 'off',

			// Promise rules
			'promise/prefer-await-to-then': 'off',

			// Import rules - disable for Next.js compatibility
			'import-x/extensions': 'off',
			'n/file-extension-in-import': 'off',
			'import-x/order': 'off',
			'import-x/no-anonymous-default-export': 'off',

			// React rules - relax prop naming
			'react/boolean-prop-naming': 'off',
			'react/prop-types': 'off',
			'react/button-has-type': 'off',
			'react/hook-use-state': 'off',
			'react/no-array-index-key': 'off',
			'react/no-unescaped-entities': 'off',

			// Unicorn rules
			'unicorn/no-nested-ternary': 'off',
			'unicorn/prefer-module': 'off',
			'unicorn/filename-case': 'off',
			'unicorn/prefer-number-properties': 'off',

			// TypeScript rules
			'@typescript-eslint/switch-exhaustiveness-check': 'off',
			'@typescript-eslint/no-redeclare': 'off',

			// General rules
			'no-lonely-if': 'off',

			// Style rules - relax line length and mixed operators
			'@stylistic/max-len': ['error', {
				code: 1000,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreRegExpLiterals: true,
			}],
			'@stylistic/no-mixed-operators': 'off',
			'@stylistic/multiline-ternary': 'off',
		},
	},
];

export default xoConfig;
