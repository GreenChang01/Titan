import {PipeTransform, Injectable, BadRequestException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ConfigKey} from '../../config/config-key.enum';

@Injectable()
export class FileValidationPipe implements PipeTransform {
	private readonly allowedMimeTypes: string[];
	private readonly maxFileSize: number;

	constructor(private readonly configService: ConfigService) {
		const mimeTypesConfig
      = this.configService.get<string>(ConfigKey.ALLOWED_MIME_TYPES) || 'image/*,video/*,audio/*,text/*';
		this.allowedMimeTypes = mimeTypesConfig.split(',').map(type => type.trim());
		this.maxFileSize = this.configService.get<number>(ConfigKey.MAX_FILE_SIZE) || 524_288_000; // 500MB default
	}

	transform(file: Express.Multer.File): Express.Multer.File {
		if (!file) {
			throw new BadRequestException('File is required');
		}

		// Check file size
		if (file.size > this.maxFileSize) {
			throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
		}

		// Check mime type
		const isAllowed = this.allowedMimeTypes.some(allowedType => {
			if (allowedType.endsWith('/*')) {
				const category = allowedType.replace('/*', '');
				return file.mimetype.startsWith(category + '/');
			}

			return file.mimetype === allowedType;
		});

		if (!isAllowed) {
			throw new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
		}

		return file;
	}
}
