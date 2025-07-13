import {
	Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import {
	ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {User} from '../auth/decorators/user.decorator';
import {ActiveUser} from '../auth/types/active-user.type';
import {TemplateService} from './template.service';
import {CreateTemplateDto, UpdateTemplateDto} from './dto';

/**
 * 内容模板控制器
 * 负责管理ASMR内容生产模板，包括模板的创建、编辑、查看和删除
 * 支持公共模板和用户私有模板的管理
 */
@ApiTags('内容模板')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
	constructor(private readonly templateService: TemplateService) {}

	/**
	 * 创建新的内容模板
	 * 用户可以创建自定义的ASMR内容生产模板，定义文案结构、音频参数等
	 */
	@Post()
	@ApiOperation({
		summary: '创建内容模板',
		description: '创建自定义的ASMR内容生产模板，可定义文案结构、语音参数、音景设置、变量槽位等，支持模板复用和分享',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: '模板创建成功，返回模板详细信息',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: '模板参数验证失败或格式错误',
	})
	async createTemplate(@Body() createTemplateDto: CreateTemplateDto, @User() user: ActiveUser) {
		const template = await this.templateService.createTemplate(createTemplateDto, user.userId);
		return {
			statusCode: HttpStatus.CREATED,
			message: '内容模板创建成功',
			data: template,
		};
	}

	/**
	 * 获取模板列表
	 * 获取用户可访问的所有模板，包括用户私有模板和公共模板
	 */
	@Get()
	@ApiOperation({
		summary: '获取模板列表',
		description: '获取用户可访问的所有内容模板，包括用户创建的私有模板和系统提供的公共模板',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '模板列表获取成功',
	})
	async getTemplates(@User() user: ActiveUser) {
		const templates = await this.templateService.getTemplates(user.userId);
		return {
			statusCode: HttpStatus.OK,
			message: '模板列表获取成功',
			data: templates,
		};
	}

	/**
	 * 获取公共模板
	 * 获取系统提供的公共内容模板，所有用户都可以使用
	 */
	@Get('public')
	@ApiOperation({
		summary: '获取公共模板',
		description: '获取系统提供的公共ASMR内容模板，包括睡眠引导、冥想放松等经典场景模板',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '公共模板列表获取成功',
	})
	async getPublicTemplates() {
		const templates = await this.templateService.getPublicTemplates();
		return {
			statusCode: HttpStatus.OK,
			message: '公共模板列表获取成功',
			data: templates,
		};
	}

	/**
	 * 获取用户私有模板
	 * 获取当前用户创建的私有内容模板
	 */
	@Get('my-templates')
	@ApiOperation({
		summary: '获取用户私有模板',
		description: '获取当前用户创建的私有内容模板，仅用户本人可见和使用',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '用户私有模板获取成功',
	})
	async getUserTemplates(@User() user: ActiveUser) {
		const templates = await this.templateService.getUserTemplates(user.userId);
		return {
			statusCode: HttpStatus.OK,
			message: '用户私有模板获取成功',
			data: templates,
		};
	}

	/**
	 * 根据ID获取模板详情
	 * 获取指定模板的完整信息，包括参数配置、变量槽位等
	 */
	@Get(':id')
	@ApiOperation({
		summary: '获取模板详情',
		description: '根据模板ID获取详细信息，包括模板配置、变量定义、默认参数等完整数据',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '模板详情获取成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '模板不存在或无访问权限',
	})
	async getTemplateById(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
		const template = await this.templateService.getTemplateById(id, user.userId);
		return {
			statusCode: HttpStatus.OK,
			message: '模板详情获取成功',
			data: template,
		};
	}

	/**
	 * 获取模板变量槽位定义
	 * 获取模板中定义的所有变量槽位及其类型和默认值
	 */
	@Get(':id/slots')
	@ApiOperation({
		summary: '获取模板变量槽位',
		description: '获取模板中定义的所有变量槽位信息，用于在创建内容时填充具体值',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '模板变量槽位获取成功',
	})
	async getTemplateSlots(@Param('id', ParseUUIDPipe) id: string) {
		const slots = await this.templateService.getTemplateSlots(id);
		return {
			statusCode: HttpStatus.OK,
			message: '模板变量槽位获取成功',
			data: slots,
		};
	}

	/**
	 * 更新模板
	 * 修改模板的名称、描述、配置参数等信息
	 */
	@Patch(':id')
	@ApiOperation({
		summary: '更新模板',
		description: '修改模板的名称、描述、配置参数等信息，仅模板创建者可以修改',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '模板更新成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '模板不存在或无修改权限',
	})
	async updateTemplate(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateTemplateDto: UpdateTemplateDto,
		@User() user: ActiveUser,
	) {
		const template = await this.templateService.updateTemplate(id, updateTemplateDto, user.userId);
		return {
			statusCode: HttpStatus.OK,
			message: '模板更新成功',
			data: template,
		};
	}

	/**
	 * 删除模板
	 * 删除用户创建的私有模板，此操作不可恢复
	 */
	@Delete(':id')
	@ApiOperation({
		summary: '删除模板',
		description: '删除用户创建的私有模板，此操作不可恢复，公共模板不能被删除',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '模板删除成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '模板不存在或无删除权限',
	})
	async deleteTemplate(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
		await this.templateService.deleteTemplate(id, user.userId);
		return {
			statusCode: HttpStatus.OK,
			message: '模板删除成功',
		};
	}

	/**
	 * 创建系统预设模板（管理员专用）
	 * 初始化系统预设的ASMR内容模板，包括各种经典场景
	 */
	@Post('create-presets')
	@ApiOperation({
		summary: '创建系统预设模板',
		description: '初始化系统预设的ASMR内容模板，包括睡眠引导、冥想放松、专注力提升等经典场景模板',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: '系统预设模板创建成功',
	})
	async createPresetTemplates() {
		await this.templateService.createPresetTemplates();
		return {
			statusCode: HttpStatus.CREATED,
			message: '系统预设模板创建成功',
		};
	}
}
