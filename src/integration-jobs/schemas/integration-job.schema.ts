import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity, BaseEntitySchema } from '../../common/schemas/base.schema';

export enum IntegrationJobType {
  IMPORT = 'import',
  EXPORT = 'export',
  SYNC = 'sync',
}

export enum IntegrationJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface IntegrationJobError {
  row: number;
  field: string;
  value: string;
  message: string;
}

@Schema({ collection: 'integration_jobs' })
export class IntegrationJob extends BaseEntity {
  @Prop({
    type: String,
    enum: Object.values(IntegrationJobType),
    required: true,
  })
  type: IntegrationJobType;

  @Prop({
    type: String,
    enum: Object.values(IntegrationJobStatus),
    default: IntegrationJobStatus.PENDING,
  })
  status: IntegrationJobStatus;

  @Prop({ type: String })
  fileName?: string;

  @Prop({ type: String })
  fileUrl?: string;

  @Prop({ type: Number, default: 0 })
  fileSize: number;

  @Prop({ type: Number, default: 0 })
  totalRows: number;

  @Prop({ type: Number, default: 0 })
  processedRows: number;

  @Prop({ type: Number, default: 0 })
  successRows: number;

  @Prop({ type: Number, default: 0 })
  errorRows: number;

  @Prop({ type: Number, default: 0 })
  limitedRows: number;

  @Prop({
    type: [
      {
        row: { type: Number, required: true },
        field: { type: String, required: true },
        value: { type: String, required: true },
        message: { type: String, required: true },
      },
    ],
    default: [],
  })
  errors: IntegrationJobError[];

  @Prop({ type: Date, default: null })
  completedAt?: Date;
}

export type IntegrationJobDocument = IntegrationJob & Document;
export const IntegrationJobSchema =
  SchemaFactory.createForClass(IntegrationJob);

// Add the base schema fields
IntegrationJobSchema.add(BaseEntitySchema);

// Add indexes
IntegrationJobSchema.index({ type: 1 });
IntegrationJobSchema.index({ status: 1 });
IntegrationJobSchema.index({ completedAt: -1 });
IntegrationJobSchema.index({ createdAt: -1 });
