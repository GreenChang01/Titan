import {type Request, type Response} from 'express';
import {mock, type MockProxy} from 'jest-mock-extended';
import {LoggerMiddleware} from './logger.middleware';
import {type Logger} from './logger.service';

describe('LoggerMiddleware', () => {
	let middleware: LoggerMiddleware;
	let logger: MockProxy<Logger>;
	let req: MockProxy<Request>;
	let response: MockProxy<Response>;
	let next: jest.Mock;

	beforeEach(() => {
		logger = mock<Logger>();
		middleware = new LoggerMiddleware(logger);

		req = mock<Request>();
		Object.defineProperty(req, 'ip', {value: '127.0.0.1'});
		Object.defineProperty(req, 'method', {value: 'GET'});
		Object.defineProperty(req, 'originalUrl', {value: '/test'});

		req.headers = {'user-agent': 'jest-test'};
		req.body = {test: 'data'};

		response = mock<Response>();
		response.statusCode = 200;

		response.on.mockImplementation((event: string, callback: (...arguments_: any[]) => void) => {
			if (event === 'finish') {
				setTimeout(callback, 0); // Simulate async
			}

			return response;
		});

		next = jest.fn();
	});

	it('should log a 2xx response', done => {
		response.statusCode = 200;

		middleware.use(req, response, next);

		setTimeout(() => {
			expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('[GET] /test - Status: 200 - IP: 127.0.0.1'));
			done();
		}, 10);
	});

	it('should warn on 4xx response', done => {
		response.statusCode = 404;

		middleware.use(req, response, next);

		setTimeout(() => {
			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Status: 404'));
			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Warning'));
			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
			done();
		}, 10);
	});

	it('should error on 5xx response', done => {
		response.statusCode = 500;

		middleware.use(req, response, next);

		setTimeout(() => {
			expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Status: 500'));
			expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Error'));
			expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
			expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
			done();
		}, 10);
	});

	it('should log error event on response', () => {
		const errorCallback = jest.fn();
		const error = new Error('Test error');

		// Extract the actual error handler
		response.on.mockImplementation((event, callback) => {
			if (event === 'error') {
				errorCallback.mockImplementation(() => {
					callback(error);
				});
			}

			return response;
		});

		middleware.use(req, response, next);
		errorCallback();

		expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
		expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Header'));
		expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Request Body'));
	});
});
