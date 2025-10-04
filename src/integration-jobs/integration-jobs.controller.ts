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
import { IntegrationJobsService } from './integration-jobs.service';
import { CreateIntegrationJobDto } from './dto/create-integration-job.dto';
import { UpdateIntegrationJobDto } from './dto/update-integration-job.dto';
import { IntegrationJobQueryDto } from './dto/integration-job-query.dto';
import { IntegrationJob, IntegrationJobStatus } from './schemas/integration-job.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Integration Jobs')
@Controller('integration-jobs')
export class IntegrationJobsController {
  constructor(private readonly integrationJobsService: IntegrationJobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new integration job' })
  @ApiResponse({ status: 201, description: 'Integration job created successfully', type: IntegrationJob })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createIntegrationJobDto: CreateIntegrationJobDto): Promise<IntegrationJob> {
    return this.integrationJobsService.create(createIntegrationJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all integration jobs with pagination' })
  @ApiResponse({ status: 200, description: 'Integration jobs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'type', required: false, enum: ['import', 'export', 'sync'], description: 'Filter by job type' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], description: 'Filter by job status' })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Company ID' })
  async findAll(@Query() query: IntegrationJobQueryDto): Promise<PaginationResult<IntegrationJob>> {
    return this.integrationJobsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get integration job statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async getStats(@Query('companyId') companyId: string): Promise<any> {
    return this.integrationJobsService.getJobStats(companyId);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted integration jobs' })
  @ApiResponse({ status: 200, description: 'Deleted integration jobs retrieved successfully' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findDeleted(@Query('companyId') companyId: string): Promise<IntegrationJob[]> {
    return this.integrationJobsService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration job by ID' })
  @ApiParam({ name: 'id', description: 'Integration job ID' })
  @ApiResponse({ status: 200, description: 'Integration job retrieved successfully', type: IntegrationJob })
  @ApiResponse({ status: 404, description: 'Integration job not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<IntegrationJob> {
    return this.integrationJobsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update integration job' })
  @ApiParam({ name: 'id', description: 'Integration job ID' })
  @ApiResponse({ status: 200, description: 'Integration job updated successfully', type: IntegrationJob })
  @ApiResponse({ status: 404, description: 'Integration job not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async update(
    @Param('id') id: string,
    @Body() updateIntegrationJobDto: UpdateIntegrationJobDto,
    @Query('companyId') companyId: string,
  ): Promise<IntegrationJob> {
    return this.integrationJobsService.update(id, updateIntegrationJobDto, companyId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update integration job status' })
  @ApiParam({ name: 'id', description: 'Integration job ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: IntegrationJob })
  @ApiResponse({ status: 404, description: 'Integration job not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  @ApiQuery({ name: 'status', required: true, enum: IntegrationJobStatus, description: 'New status' })
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: IntegrationJobStatus,
    @Query('companyId') companyId: string,
  ): Promise<IntegrationJob> {
    return this.integrationJobsService.updateStatus(id, status, companyId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update integration job progress' })
  @ApiParam({ name: 'id', description: 'Integration job ID' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully', type: IntegrationJob })
  @ApiResponse({ status: 404, description: 'Integration job not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  @ApiQuery({ name: 'processedRows', required: true, type: Number, description: 'Number of processed rows' })
  @ApiQuery({ name: 'successRows', required: true, type: Number, description: 'Number of successful rows' })
  @ApiQuery({ name: 'errorRows', required: true, type: Number, description: 'Number of error rows' })
  @ApiQuery({ name: 'limitedRows', required: true, type: Number, description: 'Number of limited rows' })
  async updateProgress(
    @Param('id') id: string,
    @Query('processedRows') processedRows: number,
    @Query('successRows') successRows: number,
    @Query('errorRows') errorRows: number,
    @Query('limitedRows') limitedRows: number,
    @Query('companyId') companyId: string,
  ): Promise<IntegrationJob> {
    return this.integrationJobsService.updateProgress(
      id, 
      processedRows, 
      successRows, 
      errorRows, 
      limitedRows, 
      companyId
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete integration job' })
  @ApiParam({ name: 'id', description: 'Integration job ID' })
  @ApiResponse({ status: 204, description: 'Integration job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Integration job not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    await this.integrationJobsService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted integration job' })
  @ApiParam({ name: 'id', description: 'Integration job ID' })
  @ApiResponse({ status: 200, description: 'Integration job restored successfully', type: IntegrationJob })
  @ApiResponse({ status: 404, description: 'Integration job not found or not deleted' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async restore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<IntegrationJob> {
    return this.integrationJobsService.restore(id, companyId);
  }
}

