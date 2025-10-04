import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountQueryDto } from './dto/account-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Check if account already exists for this company
    const existingAccount = await this.accountModel.findOne({
      companyId: createAccountDto.companyId,
      deleteAt: { $exists: false },
    });

    if (existingAccount) {
      throw new ConflictException('Account already exists for this company');
    }

    const account = new this.accountModel({
      ...createAccountDto,
      suscriptionId: new Types.ObjectId(createAccountDto.suscriptionId),
    });

    return account.save();
  }

  async findAll(query: AccountQueryDto): Promise<PaginationResult<Account>> {
    const { companyId, suscriptionId, ...paginationQuery } = query;
    
    let filterQuery: any = this.paginationService.buildSoftDeleteQuery(companyId);
    
    if (suscriptionId) {
      filterQuery.suscriptionId = new Types.ObjectId(suscriptionId);
    }

    return this.paginationService.paginate(this.accountModel, filterQuery, paginationQuery);
  }

  async findOne(id: string, companyId: string): Promise<Account> {
    const account = await this.accountModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    }).populate('suscriptionId');

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findByCompanyId(companyId: string): Promise<Account | null> {
    return this.accountModel.findOne({
      companyId,
      deleteAt: { $exists: false },
    }).populate('suscriptionId');
  }

  async update(id: string, updateAccountDto: UpdateAccountDto, companyId: string): Promise<Account> {
    // Check if account already exists for this company (if being updated)
    if (updateAccountDto.companyId) {
      const existingAccount = await this.accountModel.findOne({
        companyId: updateAccountDto.companyId,
        _id: { $ne: id },
        deleteAt: { $exists: false },
      });

      if (existingAccount) {
        throw new ConflictException('Account already exists for this company');
      }
    }

    const updateData: any = { ...updateAccountDto };
    if (updateAccountDto.suscriptionId) {
      updateData.suscriptionId = new Types.ObjectId(updateAccountDto.suscriptionId);
    }

    const account = await this.accountModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateData,
      { new: true },
    ).populate('suscriptionId');

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async softDelete(id: string, companyId: string): Promise<Account> {
    const account = await this.accountModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { deleteAt: new Date() },
      { new: true },
    );

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async restore(id: string, companyId: string): Promise<Account> {
    const account = await this.accountModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: true } },
      { $unset: { deleteAt: 1 } },
      { new: true },
    ).populate('suscriptionId');

    if (!account) {
      throw new NotFoundException('Account not found or not deleted');
    }

    return account;
  }

  async findDeleted(companyId: string): Promise<Account[]> {
    return this.accountModel.find({
      companyId,
      deleteAt: { $exists: true },
    }).populate('suscriptionId').sort({ deleteAt: -1 });
  }
}

