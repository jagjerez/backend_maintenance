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
  UseGuards,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { User } from './schemas/user.schema';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequireRoles('admin')
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
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
    name: 'role',
    required: false,
    enum: ['admin', 'user', 'manager'],
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'emailVerified',
    required: false,
    type: Boolean,
    description: 'Filter by email verified status',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Company ID',
  })
  async findAll(@Query() query: UserQueryDto): Promise<PaginationResult<User>> {
    return this.usersService.findAll(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted users' })
  @ApiResponse({
    status: 200,
    description: 'Deleted users retrieved successfully',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findDeleted(@Query('companyId') companyId: string): Promise<User[]> {
    return this.usersService.findDeleted(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<User> {
    return this.usersService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Query('companyId') companyId: string,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto, companyId);
  }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    return this.usersService.changePassword(id, changePasswordDto, companyId);
  }

  @Patch(':id/verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async verifyEmail(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<User> {
    return this.usersService.verifyEmail(id, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
    await this.usersService.softDelete(id, companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found or not deleted' })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID',
  })
  async restore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<User> {
    return this.usersService.restore(id, companyId);
  }
}
