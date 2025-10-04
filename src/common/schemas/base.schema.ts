import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BaseEntity {
  @Prop({ type: String, required: true })
  companyId: string;

  @Prop({ type: Date, default: null })
  deleteAt?: Date;
}

export type BaseEntityDocument = BaseEntity & Document;
export const BaseEntitySchema = SchemaFactory.createForClass(BaseEntity);

// Add indexes for common queries
BaseEntitySchema.index({ companyId: 1 });
BaseEntitySchema.index({ deleteAt: 1 });
BaseEntitySchema.index({ createdAt: -1 });
BaseEntitySchema.index({ updatedAt: -1 });

