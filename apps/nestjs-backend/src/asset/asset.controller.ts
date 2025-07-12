import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {User} from '../auth/decorators/user.decorator';
import {ActiveUser} from '../auth/types/active-user.type';
import {AssetService} from './asset.service';
import {FileValidationPipe} from './pipes/file-validation.pipe';
import {UploadAssetDto, AssetSearchDto, UpdateAssetDto, BatchOperationDto} from './dto';

/**
 * 资源管理控制器
 * 负责处理各类资源文件的上传、管理、搜索和批量操作
 * 支持图片、音频、视频等多种媒体格式的智能管理
 */
@ApiTags('资源管理')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * 上传资源文件
   * 支持上传图片、音频、视频等多种格式的资源文件，自动提取元数据和生成缩略图
   */
  @Post('upload')
  @ApiOperation({
    summary: '上传资源文件',
    description: '上传图片、音频、视频等资源文件，系统会自动提取元数据、生成缩略图，并支持智能标签分类',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '资源文件上传成功，返回资源详细信息包括元数据和缩略图链接',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '文件格式不支持、文件过大或请求参数错误',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '用户未登录或token已过期',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() uploadAssetDto: UploadAssetDto,
    @User() user: ActiveUser,
  ) {
    const asset = await this.assetService.uploadFile(file, user.userId, uploadAssetDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '资源文件上传成功',
      data: asset,
    };
  }

  /**
   * 搜索和获取资源列表
   * 支持分页查询、类型过滤、标签搜索、文件名模糊查询等多种搜索条件
   */
  @Get()
  @ApiOperation({
    summary: '搜索资源列表',
    description: '支持分页查询和多种过滤条件，包括资源类型、标签、文件名模糊搜索、上传时间范围等',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '资源列表获取成功，返回分页数据和资源详细信息',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '查询参数格式错误',
  })
  async getAssets(@Query() searchDto: AssetSearchDto, @User() user: ActiveUser) {
    const result = await this.assetService.searchAssets(user.userId, searchDto);
    return {
      statusCode: HttpStatus.OK,
      message: '资源列表获取成功',
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * 根据ID获取资源详情
   * 获取指定资源的完整信息，包括元数据、缩略图、标签等
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取资源详情',
    description: '根据资源ID获取详细信息，包括文件元数据、缩略图链接、标签、上传时间等完整信息',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '资源详情获取成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '资源不存在或无访问权限',
  })
  async getAssetById(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
    const asset = await this.assetService.getAssetById(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '资源详情获取成功',
      data: asset,
    };
  }

  /**
   * 更新资源信息
   * 可更新资源的标签、描述、类型分类等信息，不影响原始文件
   */
  @Patch(':id')
  @ApiOperation({
    summary: '更新资源信息',
    description: '更新资源的标签、描述、类型分类等元信息，用于更好的资源管理和检索',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '资源信息更新成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '资源不存在或无访问权限',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '更新参数格式错误',
  })
  async updateAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAssetDto,
    @User() user: ActiveUser,
  ) {
    const asset = await this.assetService.updateAsset(id, user.userId, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: '资源信息更新成功',
      data: asset,
    };
  }

  /**
   * 删除资源
   * 删除指定的资源文件及其关联数据，包括文件本身、缩略图和数据库记录
   */
  @Delete(':id')
  @ApiOperation({
    summary: '删除资源',
    description: '彻底删除资源文件及其所有关联数据，包括原始文件、缩略图、元数据等，此操作不可恢复',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '资源删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '资源不存在或无访问权限',
  })
  async deleteAsset(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
    await this.assetService.deleteAsset(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '资源删除成功',
    };
  }

  /**
   * 批量操作资源
   * 支持批量删除、批量更新标签、批量移动到项目等操作，提高资源管理效率
   */
  @Post('batch-operations')
  @ApiOperation({
    summary: '批量操作资源',
    description: '对多个资源执行批量操作，支持批量删除、批量标签更新、批量分类等，适用于大量资源的统一管理',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '批量操作执行成功，返回操作结果统计',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '批量操作参数错误或部分操作失败',
  })
  async batchOperations(@Body() batchDto: BatchOperationDto, @User() user: ActiveUser) {
    const result = await this.assetService.batchOperations(user.userId, batchDto);
    return {
      statusCode: HttpStatus.OK,
      message: '批量操作执行成功',
      data: result,
    };
  }

  /**
   * 从阿里云盘导入资源
   * 从用户的阿里云盘中批量导入文件作为项目资源，支持保持目录结构
   */
  @Post('import-from-aliyun')
  @ApiOperation({
    summary: '从阿里云盘导入资源',
    description: '从已连接的阿里云盘中批量导入文件到系统资源库，支持保持原有目录结构和文件属性',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '资源导入成功，返回导入结果统计',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '阿里云盘未配置或文件ID无效',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: '阿里云盘服务连接失败',
  })
  async importFromAliyun(@Body() importDto: {fileIds: string[]; assetType: string}, @User() user: ActiveUser) {
    // TODO: 实现阿里云盘导入逻辑
    return {
      statusCode: HttpStatus.CREATED,
      message: '阿里云盘导入功能正在开发中，敬请期待',
      data: {imported: 0, failed: 0},
    };
  }
}
