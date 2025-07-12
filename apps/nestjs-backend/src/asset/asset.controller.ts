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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { ActiveUser } from '../auth/types/active-user.type';
import { AssetService } from './asset.service';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import {
  UploadAssetDto,
  AssetSearchDto,
  UpdateAssetDto,
  BatchOperationDto,
} from './dto';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new asset file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Asset uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() uploadAssetDto: UploadAssetDto,
    @User() user: ActiveUser,
  ) {
    const asset = await this.assetService.uploadFile(file, user.userId, uploadAssetDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Asset uploaded successfully',
      data: asset,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Search and list assets with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Assets retrieved successfully' })
  async getAssets(
    @Query() searchDto: AssetSearchDto,
    @User() user: ActiveUser,
  ) {
    const result = await this.assetService.searchAssets(user.userId, searchDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Assets retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asset not found' })
  async getAssetById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    const asset = await this.assetService.getAssetById(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Asset retrieved successfully',
      data: asset,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset information (tags, description, type)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asset not found' })
  async updateAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAssetDto,
    @User() user: ActiveUser,
  ) {
    const asset = await this.assetService.updateAsset(id, user.userId, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Asset updated successfully',
      data: asset,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset and its files' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Asset not found' })
  async deleteAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    await this.assetService.deleteAsset(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Asset deleted successfully',
    };
  }

  @Post('batch-operations')
  @ApiOperation({ summary: 'Perform batch operations on multiple assets' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Batch operation completed' })
  async batchOperations(
    @Body() batchDto: BatchOperationDto,
    @User() user: ActiveUser,
  ) {
    const result = await this.assetService.batchOperations(user.userId, batchDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Batch operation completed',
      data: result,
    };
  }

  @Post('import-from-aliyun')
  @ApiOperation({ summary: 'Import assets from Aliyun Drive' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Assets imported successfully' })
  async importFromAliyun(
    @Body() importDto: { fileIds: string[]; assetType: string },
    @User() user: ActiveUser,
  ) {
    // TODO: Implement Aliyun Drive import logic
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Import from Aliyun Drive - Coming soon',
      data: { imported: 0, failed: 0 },
    };
  }
}