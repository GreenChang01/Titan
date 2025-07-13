import type {Config} from 'jest';

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: 'src',
	testRegex: String.raw`(.*(controller|service|guard|interceptor|pipe|middleware|filter))\.spec\.ts$`,
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	collectCoverageFrom: [
		'**/*.(controller|service|guard|interceptor|pipe|middleware|filter).ts', // Coverage for relevant files
		'!**/node_modules/**',
		'!**/dist/**',
	],
	coverageDirectory: './../coverage',
	testEnvironment: 'node',
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},

		'**/*': {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
};

export default config;
