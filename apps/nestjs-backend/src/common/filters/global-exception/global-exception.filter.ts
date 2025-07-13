import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {Request, Response} from 'express';
import {ValidationError} from 'class-validator';

export type StandardErrorResponse = {
	success: false;
	error: {
		code: string;
		message: string;
		details?: string | Record<string, unknown>;
		timestamp: string;
		path: string;
		statusCode: number;
	};
};

export type StandardSuccessResponse<T = any> = {
	success: true;
	data: T;
	timestamp: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status: HttpStatus;
		let code: string;
		let message: string;
		let details: string | Record<string, unknown> | undefined;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'string') {
				message = exceptionResponse;
				code = this.getErrorCode(status);
			} else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
				const responseObject = exceptionResponse as any;
				message = responseObject.message || exception.message;
				code = responseObject.error || this.getErrorCode(status);
				details = responseObject.details;

				// Handle validation errors specially
				if (Array.isArray(responseObject.message)) {
					details = responseObject.message;
					message = 'Validation failed';
					code = 'VALIDATION_ERROR';
				}
			} else {
				message = exception.message;
				code = this.getErrorCode(status);
			}
		} else if (exception instanceof Error) {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			message = 'Internal server error';
			code = 'INTERNAL_ERROR';
			details = process.env.NODE_ENV === 'development' ? exception.message : undefined;

			// Log the full error in development
			this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack, 'GlobalExceptionFilter');
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			message = 'An unexpected error occurred';
			code = 'UNKNOWN_ERROR';

			this.logger.error(
				`Unknown exception type: ${typeof exception}`,
				JSON.stringify(exception),
				'GlobalExceptionFilter',
			);
		}

		const errorResponse: StandardErrorResponse = {
			success: false,
			error: {
				code,
				message,
				details,
				timestamp: new Date().toISOString(),
				path: request.url,
				statusCode: status,
			},
		};

		// Remove undefined fields
		if (details === undefined) {
			delete errorResponse.error.details;
		}

		response.status(status).json(errorResponse);
	}

	private getErrorCode(status: HttpStatus): string {
		switch (status) {
			case HttpStatus.BAD_REQUEST: {
				return 'BAD_REQUEST';
			}

			case HttpStatus.UNAUTHORIZED: {
				return 'UNAUTHORIZED';
			}

			case HttpStatus.FORBIDDEN: {
				return 'FORBIDDEN';
			}

			case HttpStatus.NOT_FOUND: {
				return 'NOT_FOUND';
			}

			case HttpStatus.CONFLICT: {
				return 'CONFLICT';
			}

			case HttpStatus.UNPROCESSABLE_ENTITY: {
				return 'VALIDATION_ERROR';
			}

			case HttpStatus.TOO_MANY_REQUESTS: {
				return 'RATE_LIMIT_EXCEEDED';
			}

			case HttpStatus.INTERNAL_SERVER_ERROR: {
				return 'INTERNAL_ERROR';
			}

			case HttpStatus.SERVICE_UNAVAILABLE: {
				return 'SERVICE_UNAVAILABLE';
			}

			default: {
				return 'UNKNOWN_ERROR';
			}
		}
	}
}
