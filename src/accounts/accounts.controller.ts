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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountQueryDto } from './dto/account-query.dto';
import { Account } from './schemas/account.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully', type: Account })
  @ApiResponse({ status: 409, description: 'Account already exists for this company' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts with pagination' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'suscriptionId', required: false, type: String, description: 'Filter by subscription ID' })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Company ID' })
  async findAll(@Query() query: AccountQueryDto): Promise<PaginationResult<Account>> {
    return this.accountsService.findAll(query);
  }

  @Get('by-company/:companyId')
  @ApiOperation({ summary: 'Get account by company ID' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully', type: Account })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findByCompanyId(@Param('companyId') companyId: string): Promise<Account | null> {
    return this.accountsService.findByCompanyId(companyId);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted accounts' })
  @ApiResponse({ status: 200, description: 'Deleted accounts retrieved successfully' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findDeleted(@Query('companyId') companyId: string): Promise<Account[]> {
    return this.accountsService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully', type: Account })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Account> {
    return this.accountsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully', type: Account })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Account already exists for this company' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Query('companyId') companyId: string,
  ): Promise<Account> {
    return this.accountsService.update(id, updateAccountDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    await this.accountsService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account restored successfully', type: Account })
  @ApiResponse({ status: 404, description: 'Account not found or not deleted' })
  @ApiQuery({ name: 'companyId', required: true, type: String, description: 'Company ID' })
  async restore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Account> {
    return this.accountsService.restore(id, companyId);
  }
}

