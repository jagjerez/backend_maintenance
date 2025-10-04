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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { Company } from './schemas/company.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: Company })
  @ApiResponse({ status: 409, description: 'Company with this name already exists' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Company ID' })
  async findAll(@Query() query: CompanyQueryDto): Promise<PaginationResult<Company>> {
    return this.companiesService.findAll(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted companies' })
  @ApiResponse({ status: 200, description: 'Deleted companies retrieved successfully' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findDeleted(@Query('companyId') companyId: string): Promise<Company[]> {
    return this.companiesService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Company> {
    return this.companiesService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company updated successfully', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Company with this name already exists' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Query('companyId') companyId: string,
  ): Promise<Company> {
    return this.companiesService.update(id, updateCompanyDto, companyId);
  }

  @Patch(':id/branding')
  @ApiOperation({ summary: 'Update company branding' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Branding updated successfully', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async updateBranding(
    @Param('id') id: string,
    @Body() branding: any,
    @Query('companyId') companyId: string,
  ): Promise<Company> {
    return this.companiesService.updateBranding(id, branding, companyId);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update company settings' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async updateSettings(
    @Param('id') id: string,
    @Body() settings: any,
    @Query('companyId') companyId: string,
  ): Promise<Company> {
    return this.companiesService.updateSettings(id, settings, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    await this.companiesService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company restored successfully', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found or not deleted' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async restore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Company> {
    return this.companiesService.restore(id, companyId);
  }
}

