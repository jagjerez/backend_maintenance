import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Company, CompanyDocument } from '../../companies/schemas/company.schema';
import { Account, AccountDocument } from '../../accounts/schemas/account.schema';
import { Subscription, SubscriptionDocument } from '../../subscriptions/schemas/subscription.schema';
import { SessionDto, UserSessionDto, CompanySessionDto, SubscriptionSessionDto } from '../dto/auth-response.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async buildSession(userId: string): Promise<SessionDto> {
    // Get user with company info
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get company data
    const company = await this.companyModel
      .findOne({ _id: user.companyId, deleteAt: { $exists: false } })
      .lean();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Get account with subscription
    const account = await this.accountModel
      .findOne({ companyId: user.companyId, deleteAt: { $exists: false } })
      .populate('suscriptionId')
      .lean();

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Get subscription details
    const subscription = await this.subscriptionModel
      .findById(account.suscriptionId)
      .lean();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Build session data
    const userSession: UserSessionDto = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      preferences: user.preferences,
    };

    const companySession: CompanySessionDto = {
      id: company._id.toString(),
      name: company.name,
      logo: company.logo,
      branding: company.branding,
      settings: company.settings,
    };

    const subscriptionSession: SubscriptionSessionDto = {
      id: subscription._id.toString(),
      name: subscription.name,
      description: subscription.description,
      settings: subscription.settings,
    };

    return {
      user: userSession,
      company: companySession,
      subscription: subscriptionSession,
    };
  }

  async validateUserAccess(userId: string, companyId: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      _id: userId,
      companyId,
      deleteAt: { $exists: false },
    });

    return !!user;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('role')
      .lean();

    if (!user) {
      return [];
    }

    // Define permissions based on role
    const permissions: Record<string, string[]> = {
      admin: ['*'], // All permissions
      manager: [
        'users:read',
        'users:create',
        'users:update',
        'operations:read',
        'operations:create',
        'operations:update',
        'operations:delete',
        'locations:read',
        'locations:create',
        'locations:update',
        'locations:delete',
        'integration-jobs:read',
        'integration-jobs:create',
        'integration-jobs:update',
        'integration-jobs:delete',
      ],
      user: [
        'operations:read',
        'operations:create',
        'operations:update',
        'locations:read',
        'integration-jobs:read',
      ],
    };

    return permissions[user.role] || [];
  }

  async checkEntityLimit(companyId: string, entity: string): Promise<{ allowed: boolean; limit: number; current: number }> {
    // Get account with subscription
    const account = await this.accountModel
      .findOne({ companyId, deleteAt: { $exists: false } })
      .populate('suscriptionId')
      .lean();

    if (!account) {
      return { allowed: false, limit: 0, current: 0 };
    }

    // Get subscription settings for this entity
    const subscription = await this.subscriptionModel
      .findById(account.suscriptionId)
      .lean();

    if (!subscription) {
      return { allowed: false, limit: 0, current: 0 };
    }

    const entitySetting = subscription.settings.find(s => s.entity === entity);
    if (!entitySetting) {
      return { allowed: true, limit: -1, current: 0 }; // No limit
    }

    // Count current entities (this would need to be implemented per entity)
    // For now, return a placeholder
    const current = 0; // This should be calculated based on the actual entity count

    return {
      allowed: current < entitySetting.createLimitRegistry,
      limit: entitySetting.createLimitRegistry,
      current,
    };
  }
}
