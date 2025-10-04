import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionQueryDto } from './dto/subscription-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Check if subscription with same name already exists
    const existingSubscription = await this.subscriptionModel.findOne({
      name: createSubscriptionDto.name,
      deleteAt: { $exists: false },
    });

    if (existingSubscription) {
      throw new ConflictException('Subscription with this name already exists');
    }

    const subscription = new this.subscriptionModel(createSubscriptionDto);
    return subscription.save();
  }

  async findAll(query: SubscriptionQueryDto): Promise<PaginationResult<Subscription>> {
    const { companyId, ...paginationQuery } = query;
    
    const filterQuery = this.paginationService.buildSoftDeleteQuery(companyId);

    return this.paginationService.paginate(this.subscriptionModel, filterQuery, paginationQuery);
  }

  async findOne(id: string, companyId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, companyId: string): Promise<Subscription> {
    // Check if subscription with same name already exists (if being updated)
    if (updateSubscriptionDto.name) {
      const existingSubscription = await this.subscriptionModel.findOne({
        name: updateSubscriptionDto.name,
        _id: { $ne: id },
        deleteAt: { $exists: false },
      });

      if (existingSubscription) {
        throw new ConflictException('Subscription with this name already exists');
      }
    }

    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateSubscriptionDto,
      { new: true },
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async softDelete(id: string, companyId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { deleteAt: new Date() },
      { new: true },
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async restore(id: string, companyId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: true } },
      { $unset: { deleteAt: 1 } },
      { new: true },
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found or not deleted');
    }

    return subscription;
  }

  async findDeleted(companyId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({
      companyId,
      deleteAt: { $exists: true },
    }).sort({ deleteAt: -1 });
  }

  async updateSettings(id: string, settings: any[], companyId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { settings },
      { new: true },
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async getEntityLimit(subscriptionId: string, entity: string): Promise<number | null> {
    const subscription = await this.subscriptionModel.findById(subscriptionId);
    
    if (!subscription) {
      return null;
    }

    const setting = subscription.settings.find(s => s.entity === entity);
    return setting ? setting.createLimitRegistry : null;
  }
}

