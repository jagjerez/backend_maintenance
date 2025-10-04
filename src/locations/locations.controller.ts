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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { Location } from './schemas/location.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    type: Location,
  })
  @ApiResponse({
    status: 409,
    description: 'Location with this internal code already exists',
  })
  @ApiResponse({ status: 404, description: 'Parent location not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations with pagination' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: String,
    description: 'Filter by parent ID',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    type: Number,
    description: 'Filter by level',
  })
  @ApiQuery({
    name: 'isLeaf',
    required: false,
    type: Boolean,
    description: 'Filter by leaf status',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Company ID',
  })
  async findAll(
    @Query() query: LocationQueryDto,
  ): Promise<PaginationResult<Location>> {
    return this.locationsService.findAll(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted locations' })
  @ApiResponse({
    status: 200,
    description: 'Deleted locations retrieved successfully',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findDeleted(
    @Query('companyId') companyId: string,
  ): Promise<Location[]> {
    return this.locationsService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location retrieved successfully',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Location> {
    return this.locationsService.findOne(id, companyId);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get children of a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Children retrieved successfully',
    type: [Location],
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findChildren(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Location[]> {
    return this.locationsService.findChildren(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({
    status: 409,
    description: 'Location with this internal code already exists',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Query('companyId') companyId: string,
  ): Promise<Location> {
    return this.locationsService.update(id, updateLocationDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({ status: 204, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete location with children',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    await this.locationsService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({
    status: 200,
    description: 'Location restored successfully',
    type: Location,
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found or not deleted',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async restore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Location> {
    return this.locationsService.restore(id, companyId);
  }
}
