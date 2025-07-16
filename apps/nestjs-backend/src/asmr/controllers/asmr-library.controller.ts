import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
	Req,
	HttpCode,
	HttpStatus,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import {Request} from 'express';
import {ActiveUser} from '../../auth/types/active-user.type';
import {JwtAuthGuard} from '../../auth/jwt-auth.guard';
import {ASMRLibraryService} from '../services/asmr-library.service';
import {ASMRLibraryItem, GenerationStatus} from '../dto/asmr-generation.dto';
import {UpdateLibraryItemDto, LibraryFilterDto, LibraryStatsDto} from '../dto/asmr-library.dto';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';

@ApiTags('ASMR Library')
@ApiBearerAuth()
@Controller('library')
@UseGuards(JwtAuthGuard)
export class ASMRLibraryController {
	constructor(private readonly libraryService: ASMRLibraryService) {}

	@Get()
	@ApiOperation({summary: 'Get user library items'})
	@ApiResponse({status: 200, description: 'Library items retrieved successfully'})
	@ApiQuery({name: 'search', required: false, description: 'Search term'})
	@ApiQuery({name: 'category', required: false, description: 'Filter by category'})
	@ApiQuery({name: 'status', required: false, enum: GenerationStatus, description: 'Filter by status'})
	@ApiQuery({name: 'tags', required: false, description: 'Filter by tags (comma-separated)'})
	@ApiQuery({name: 'limit', required: false, type: 'number', description: 'Number of items per page'})
	@ApiQuery({name: 'offset', required: false, type: 'number', description: 'Offset for pagination'})
	@ApiQuery({name: 'sortBy', required: false, description: 'Sort field'})
	@ApiQuery({name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order'})
	async getLibraryItems(
		@Req() request: Request,
		@Query() filters: LibraryFilterDto,
	): Promise<{
		items: ASMRLibraryItem[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.getLibraryItems(userId, filters);
	}

	@Get('stats')
	@ApiOperation({summary: 'Get library statistics'})
	@ApiResponse({status: 200, description: 'Statistics retrieved successfully'})
	async getLibraryStats(@Req() request: Request): Promise<LibraryStatsDto> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.getLibraryStats(userId);
	}

	@Get('recent')
	@ApiOperation({summary: 'Get recently generated content'})
	@ApiResponse({status: 200, description: 'Recent items retrieved successfully'})
	async getRecentItems(@Req() request: Request, @Query('limit') limit = 5): Promise<ASMRLibraryItem[]> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.getRecentItems(userId, limit);
	}

	@Get('favorites')
	@ApiOperation({summary: 'Get favorite items'})
	@ApiResponse({status: 200, description: 'Favorite items retrieved successfully'})
	async getFavoriteItems(
		@Req() request: Request,
		@Query() filters: Omit<LibraryFilterDto, 'status'>,
	): Promise<{
		items: ASMRLibraryItem[];
		total: number;
	}> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.getFavoriteItems(userId, filters);
	}

	@Get('categories')
	@ApiOperation({summary: 'Get available categories'})
	@ApiResponse({status: 200, description: 'Categories retrieved successfully'})
	async getCategories(@Req() request: Request): Promise<Array<{category: string; count: number}>> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.getCategories(userId);
	}

	@Get('tags')
	@ApiOperation({summary: 'Get popular tags'})
	@ApiResponse({status: 200, description: 'Tags retrieved successfully'})
	async getPopularTags(
		@Req() request: Request,
		@Query('limit') limit = 20,
	): Promise<Array<{tag: string; count: number}>> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.getPopularTags(userId, limit);
	}

	@Get(':id')
	@ApiOperation({summary: 'Get library item by ID'})
	@ApiResponse({status: 200, description: 'Item retrieved successfully'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async getLibraryItem(@Param('id') id: string, @Req() request: Request): Promise<ASMRLibraryItem> {
		const {userId} = request.user as ActiveUser;
		const item = await this.libraryService.getLibraryItem(id, userId);

		if (!item) {
			throw new NotFoundException('Library item not found');
		}

		return item;
	}

	@Put(':id')
	@ApiOperation({summary: 'Update library item'})
	@ApiResponse({status: 200, description: 'Item updated successfully'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async updateLibraryItem(
		@Param('id') id: string,
		@Body() updateDto: UpdateLibraryItemDto,
		@Req() request: Request,
	): Promise<ASMRLibraryItem> {
		const {userId} = request.user as ActiveUser;
		const item = await this.libraryService.updateLibraryItem(id, userId, updateDto);

		if (!item) {
			throw new NotFoundException('Library item not found');
		}

		return item;
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Delete library item'})
	@ApiResponse({status: 204, description: 'Item deleted successfully'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async deleteLibraryItem(@Param('id') id: string, @Req() request: Request): Promise<void> {
		const {userId} = request.user as ActiveUser;
		const success = await this.libraryService.deleteLibraryItem(id, userId);

		if (!success) {
			throw new NotFoundException('Library item not found');
		}
	}

	@Post(':id/favorite')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Add item to favorites'})
	@ApiResponse({status: 204, description: 'Item added to favorites'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async addToFavorites(@Param('id') id: string, @Req() request: Request): Promise<void> {
		const {userId} = request.user as ActiveUser;
		const success = await this.libraryService.toggleFavorite(id, userId, true);

		if (!success) {
			throw new NotFoundException('Library item not found');
		}
	}

	@Delete(':id/favorite')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Remove item from favorites'})
	@ApiResponse({status: 204, description: 'Item removed from favorites'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async removeFromFavorites(@Param('id') id: string, @Req() request: Request): Promise<void> {
		const {userId} = request.user as ActiveUser;
		const success = await this.libraryService.toggleFavorite(id, userId, false);

		if (!success) {
			throw new NotFoundException('Library item not found');
		}
	}

	@Post(':id/play')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Increment play count'})
	@ApiResponse({status: 204, description: 'Play count incremented'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async incrementPlayCount(@Param('id') id: string, @Req() request: Request): Promise<void> {
		const {userId} = request.user as ActiveUser;
		const success = await this.libraryService.incrementPlayCount(id, userId);

		if (!success) {
			throw new NotFoundException('Library item not found');
		}
	}

	@Post(':id/rate')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Rate library item'})
	@ApiResponse({status: 204, description: 'Rating saved successfully'})
	@ApiResponse({status: 400, description: 'Invalid rating value'})
	@ApiResponse({status: 404, description: 'Item not found'})
	async rateItem(@Param('id') id: string, @Body('rating') rating: number, @Req() request: Request): Promise<void> {
		if (rating < 1 || rating > 5) {
			throw new BadRequestException('Rating must be between 1 and 5');
		}

		const {userId} = request.user as ActiveUser;
		const success = await this.libraryService.rateItem(id, userId, rating);

		if (!success) {
			throw new NotFoundException('Library item not found');
		}
	}

	@Get('search/similar/:id')
	@ApiOperation({summary: 'Find similar items'})
	@ApiResponse({status: 200, description: 'Similar items retrieved successfully'})
	async findSimilarItems(
		@Param('id') id: string,
		@Query('limit') limit = 5,
		@Req() request: Request,
	): Promise<ASMRLibraryItem[]> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.findSimilarItems(id, userId, limit);
	}

	@Post('bulk-action')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Perform bulk actions on items'})
	@ApiResponse({status: 204, description: 'Bulk action completed'})
	async bulkAction(
		@Body()
		bulkActionDto: {
			itemIds: string[];
			action: 'delete' | 'favorite' | 'unfavorite' | 'update-tags';
			data?: any;
		},
		@Req() request: Request,
	): Promise<void> {
		const {userId} = request.user as ActiveUser;
		await this.libraryService.bulkAction(userId, bulkActionDto);
	}

	@Get('export/:format')
	@ApiOperation({summary: 'Export library data'})
	@ApiResponse({status: 200, description: 'Export data prepared'})
	async exportLibrary(
		@Param('format') format: 'json' | 'csv' | 'xml',
		@Req() request: Request,
	): Promise<{
		data: any;
		filename: string;
		contentType: string;
	}> {
		const {userId} = request.user as ActiveUser;
		return this.libraryService.exportLibrary(userId, format);
	}
}
