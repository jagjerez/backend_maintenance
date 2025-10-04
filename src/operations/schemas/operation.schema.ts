import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity, BaseEntitySchema } from '../../common/schemas/base.schema';

export enum OperationType {
  NUMBER = 'number',
  TEXT = 'text',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
}

@Schema({ collection: 'operations' })
export class Operation extends BaseEntity {
  @Prop({
    type: String,
    enum: Object.values(OperationType),
    required: true,
  })
  type: OperationType;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true, unique: true })
  internalCode: string;
}

export type OperationDocument = Operation & Document;
export const OperationSchema = SchemaFactory.createForClass(Operation);

// Add the base schema fields
OperationSchema.add(BaseEntitySchema);

// Add indexes
OperationSchema.index({ internalCode: 1 });
OperationSchema.index({ type: 1 });
OperationSchema.index({ name: 1 });
