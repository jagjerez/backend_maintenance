import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { OperationQueryDto } from './dto/operation-query.dto';
import { Operation } from './schemas/operation.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Operations')
@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post()
  @RequireRoles('admin', 'manager')
  @RequirePermissions('operations:create')
  @ApiOperation({ summary: 'Create a new operation' })
  @ApiResponse({
    status: 201,
    description: 'Operation created successfully',
    type: Operation,
  })
  @ApiResponse({
    status: 409,
    description: 'Operation with this internal code already exists',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createOperationDto: CreateOperationDto,
  ): Promise<Operation> {
    return this.operationsService.create(createOperationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all operations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Operations retrieved successfully',
  })
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
    name: 'type',
    required: false,
    enum: ['number', 'text', 'date', 'time', 'datetime', 'boolean'],
    description: 'Filter by type',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Company ID',
  })
  async findAll(
    @Query() query: OperationQueryDto,
  ): Promise<PaginationResult<Operation>> {
    return this.operationsService.findAll(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted operations' })
  @ApiResponse({
    status: 200,
    description: 'Deleted operations retrieved successfully',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findDeleted(
    @Query('companyId') companyId: string,
  ): Promise<Operation[]> {
    return this.operationsService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operation by ID' })
  @ApiParam({ name: 'id', description: 'Operation ID' })
  @ApiResponse({
    status: 200,
    description: 'Operation retrieved successfully',
    type: Operation,
  })
  @ApiResponse({ status: 404, description: 'Operation not found' })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Operation> {
    return this.operationsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update operation' })
  @ApiParam({ name: 'id', description: 'Operation ID' })
  @ApiResponse({
    status: 200,
    description: 'Operation updated successfully',
    type: Operation,
  })
  @ApiResponse({ status: 404, description: 'Operation not found' })
  @ApiResponse({
    status: 409,
    description: 'Operation with this internal code already exists',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOperationDto: UpdateOperationDto,
    @Query('companyId') companyId: string,
  ): Promise<Operation> {
    return this.operationsService.update(id, updateOperationDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete operation' })
  @ApiParam({ name: 'id', description: 'Operation ID' })
  @ApiResponse({ status: 204, description: 'Operation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Operation not found' })
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
    await this.operationsService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted operation' })
  @ApiParam({ name: 'id', description: 'Operation ID' })
  @ApiResponse({
    status: 200,
    description: 'Operation restored successfully',
    type: Operation,
  })
  @ApiResponse({
    status: 404,
    description: 'Operation not found or not deleted',
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
  ): Promise<Operation> {
    return this.operationsService.restore(id, companyId);
  }
}
