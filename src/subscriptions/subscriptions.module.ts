import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { PaginationService } from '../common/services/pagination.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    AuthModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PaginationService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
