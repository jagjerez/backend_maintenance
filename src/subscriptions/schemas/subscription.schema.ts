import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity, BaseEntitySchema } from '../../common/schemas/base.schema';

export interface SubscriptionSetting {
  entity: string;
  createLimitRegistry: number;
}

@Schema({ collection: 'subscriptions' })
export class Subscription extends BaseEntity {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: [
      {
        entity: { type: String, required: true },
        createLimitRegistry: { type: Number, required: true },
      },
    ],
    default: [],
  })
  settings: SubscriptionSetting[];
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Add the base schema fields
SubscriptionSchema.add(BaseEntitySchema);

// Add indexes
SubscriptionSchema.index({ name: 1 });
