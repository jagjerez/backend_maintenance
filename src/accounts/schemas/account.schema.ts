import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity, BaseEntitySchema } from '../../common/schemas/base.schema';

@Schema({ collection: 'accounts' })
export class Account extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
  suscriptionId: Types.ObjectId;
}

export type AccountDocument = Account & Document;
export const AccountSchema = SchemaFactory.createForClass(Account);

// Add the base schema fields
AccountSchema.add(BaseEntitySchema);

// Add indexes
AccountSchema.index({ suscriptionId: 1 });
AccountSchema.index({ companyId: 1 });

