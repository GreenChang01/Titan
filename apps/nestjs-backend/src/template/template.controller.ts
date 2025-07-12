import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { ActiveUser } from '../auth/types/active-user.type';
import { TemplateService } from './template.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Template created successfully' })
  async createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
    @User() user: ActiveUser,
  ) {
    const template = await this.templateService.createTemplate(createTemplateDto, user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Template created successfully',
      data: template,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get templates list (user templates + public templates)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Templates retrieved successfully' })
  async getTemplates(@User() user: ActiveUser) {
    const templates = await this.templateService.getTemplates(user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Templates retrieved successfully',
      data: templates,
    };
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public templates only' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Public templates retrieved successfully' })
  async getPublicTemplates() {
    const templates = await this.templateService.getPublicTemplates();
    return {
      statusCode: HttpStatus.OK,
      message: 'Public templates retrieved successfully',
      data: templates,
    };
  }

  @Get('my-templates')
  @ApiOperation({ summary: 'Get user private templates only' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User templates retrieved successfully' })
  async getUserTemplates(@User() user: ActiveUser) {
    const templates = await this.templateService.getUserTemplates(user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User templates retrieved successfully',
      data: templates,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template details by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
  async getTemplateById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    const template = await this.templateService.getTemplateById(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template retrieved successfully',
      data: template,
    };
  }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get template slot definitions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template slots retrieved successfully' })
  async getTemplateSlots(@Param('id', ParseUUIDPipe) id: string) {
    const slots = await this.templateService.getTemplateSlots(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template slots retrieved successfully',
      data: slots,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @User() user: ActiveUser,
  ) {
    const template = await this.templateService.updateTemplate(id, updateTemplateDto, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template updated successfully',
      data: template,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
  async deleteTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    await this.templateService.deleteTemplate(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Template deleted successfully',
    };
  }

  @Post('create-presets')
  @ApiOperation({ summary: 'Create system preset templates (Admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Preset templates created successfully' })
  async createPresetTemplates() {
    await this.templateService.createPresetTemplates();
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Preset templates created successfully',
    };
  }
}