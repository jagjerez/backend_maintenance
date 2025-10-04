import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
      deleteAt: { $exists: false },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(query: UserQueryDto): Promise<PaginationResult<User>> {
    const { companyId, role, isActive, emailVerified, ...paginationQuery } =
      query;

    const filterQuery: any =
      this.paginationService.buildSoftDeleteQuery(companyId);

    if (role) {
      filterQuery.role = role;
    }

    if (isActive !== undefined) {
      filterQuery.isActive = isActive;
    }

    if (emailVerified !== undefined) {
      filterQuery.emailVerified = emailVerified;
    }

    return this.paginationService.paginate(
      this.userModel,
      filterQuery,
      paginationQuery,
    );
  }

  async findOne(id: string, companyId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({
        _id: id,
        companyId,
        deleteAt: { $exists: false },
      })
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      email: email.toLowerCase(),
      deleteAt: { $exists: false },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    companyId: string,
  ): Promise<User> {
    // Check if email already exists (if being updated)
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
        deleteAt: { $exists: false },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, companyId, deleteAt: { $exists: false } },
        updateUserDto,
        { new: true },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
    companyId: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    // Update password
    await this.userModel.findByIdAndUpdate(id, { password: hashedNewPassword });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async softDelete(id: string, companyId: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, companyId, deleteAt: { $exists: false } },
        { deleteAt: new Date() },
        { new: true },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async restore(id: string, companyId: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, companyId, deleteAt: { $exists: true } },
        { $unset: { deleteAt: 1 } },
        { new: true },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found or not deleted');
    }

    return user;
  }

  async findDeleted(companyId: string): Promise<User[]> {
    return this.userModel
      .find({
        companyId,
        deleteAt: { $exists: true },
      })
      .select('-password')
      .sort({ deleteAt: -1 });
  }

  async verifyEmail(id: string, companyId: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, companyId, deleteAt: { $exists: false } },
        { emailVerified: true },
        { new: true },
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
