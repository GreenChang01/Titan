import {createParamDecorator, type ExecutionContext, NotAcceptableException} from '@nestjs/common';
import {type Request} from 'express';
import {type HeaderDecoratorParam as HeaderDecoratorParameter} from './types/header-decorator.param.type';

export const ValidateHeader = createParamDecorator(
	(parameter: HeaderDecoratorParameter, ctx: ExecutionContext): string | string[] => {
		const request: Request = ctx.switchToHttp().getRequest();

		// Handle both string and object parameters
		const headerName = typeof parameter === 'string' ? parameter : parameter.headerName;
		const options = typeof parameter === 'string' ? {} : (parameter.options ?? {});

		const {expectedValue, caseSensitive = false, missingMessage, invalidValueMessage, allowEmpty = false} = options;

		const headerValue = request.headers[headerName.toLowerCase()];

		// Check if header exists
		if (!headerValue || (!allowEmpty && headerValue === '')) {
			const message = missingMessage ?? `Missing required header: ${headerName}`;
			throw new NotAcceptableException(message);
		}

		// If no expected value specified, return the header value
		if (expectedValue === undefined) {
			return headerValue;
		}

		// Validate header value
		const isValid = validateHeaderValue(headerValue, expectedValue, caseSensitive);

		if (!isValid) {
			const message =
				invalidValueMessage ??
				`Invalid value for header '${headerName}'. Expected: ${formatExpectedValue(expectedValue)}`;
			throw new NotAcceptableException(message);
		}

		return headerValue;
	},
);

/**
 * Validates header value against expected value(s)
 */
function validateHeaderValue(
	headerValue: string | string[],
	expectedValue: string | string[] | RegExp | Record<string, string | number>,
	caseSensitive: boolean,
): boolean {
	// Convert header value to array for consistent processing
	const headerValues = Array.isArray(headerValue) ? headerValue : [headerValue];

	// RegExp validation
	if (expectedValue instanceof RegExp) {
		return headerValues.some((value) => expectedValue.test(value));
	}

	// Enum validation (check if it's an object with string/number values)
	if (typeof expectedValue === 'object' && !Array.isArray(expectedValue) && expectedValue !== null) {
		const enumValues = Object.values(expectedValue).map(String);
		return headerValues.some((headerValue_) =>
			enumValues.some((enumValue) =>
				caseSensitive ? headerValue_ === enumValue : headerValue_.toLowerCase() === enumValue.toLowerCase(),
			),
		);
	}

	// String or array validation
	const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];

	return headerValues.some((headerValue_) =>
		expectedValues.some((expectedValue_) =>
			caseSensitive ? headerValue_ === expectedValue_ : headerValue_.toLowerCase() === expectedValue_.toLowerCase(),
		),
	);
}

/**
 * Formats expected value for error messages
 */
function formatExpectedValue(expectedValue: string | string[] | RegExp | Record<string, string | number>): string {
	if (expectedValue instanceof RegExp) {
		return expectedValue.toString();
	}

	if (Array.isArray(expectedValue)) {
		return expectedValue.join(' | ');
	}

	// Handle enum objects
	if (typeof expectedValue === 'object' && expectedValue !== null) {
		return Object.values(expectedValue).join(' | ');
	}

	return String(expectedValue);
}
