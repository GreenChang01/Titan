import {
	Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export type StandardSuccessResponse<T = any> = {
	success: true;
	data: T;
	timestamp: string;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardSuccessResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<StandardSuccessResponse<T>> {
		const request = context.switchToHttp().getRequest();

		// Skip transformation for file downloads and other special responses
		if (request.url?.includes('/download') || request.url?.includes('/files/download')) {
			return next.handle();
		}

		return next.handle().pipe(map(data => ({
			success: true,
			data,
			timestamp: new Date().toISOString(),
		})));
	}
}
