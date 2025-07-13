import {
	IsString, IsOptional, Length, IsHexColor, IsEnum,
} from 'class-validator';
import {ProjectStatus} from '../../common/enums';

export class UpdateProjectDto {
	@IsOptional()
	@IsString()
	@Length(1, 100)
	name?: string;

	@IsOptional()
	@IsString()
	@Length(0, 500)
	description?: string;

	@IsOptional()
	@IsString()
	@IsHexColor()
	color?: string;

	@IsOptional()
	@IsEnum(ProjectStatus)
	status?: ProjectStatus;
}
