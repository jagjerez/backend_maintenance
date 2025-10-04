import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionQueryDto } from './dto/subscription-query.dto';
import { Subscription } from './schemas/subscription.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully', type: Subscription })
  @ApiResponse({ status: 409, description: 'Subscription with this name already exists' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions with pagination' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Company ID' })
  async findAll(@Query() query: SubscriptionQueryDto): Promise<PaginationResult<Subscription>> {
    return this.subscriptionsService.findAll(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted subscriptions' })
  @ApiResponse({ status: 200, description: 'Deleted subscriptions retrieved successfully' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findDeleted(@Query('companyId') companyId: string): Promise<Subscription[]> {
    return this.subscriptionsService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully', type: Subscription })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.findOne(id, companyId);
  }

  @Get(':id/entity-limit/:entity')
  @ApiOperation({ summary: 'Get entity limit for subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiParam({ name: 'entity', description: 'Entity name' })
  @ApiResponse({ status: 200, description: 'Entity limit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getEntityLimit(
    @Param('id') id: string,
    @Param('entity') entity: string,
  ): Promise<{ limit: number | null }> {
    const limit = await this.subscriptionsService.getEntityLimit(id, entity);
    return { limit };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully', type: Subscription })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 409, description: 'Subscription with this name already exists' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Query('companyId') companyId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(id, updateSubscriptionDto, companyId);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update subscription settings' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully', type: Subscription })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async updateSettings(
    @Param('id') id: string,
    @Body() settings: any[],
    @Query('companyId') companyId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.updateSettings(id, settings, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 204, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    await this.subscriptionsService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription restored successfully', type: Subscription })
  @ApiResponse({ status: 404, description: 'Subscription not found or not deleted' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async restore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.restore(id, companyId);
  }
}

