import {IsString, IsOptional, Length, IsHexColor} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;
}
