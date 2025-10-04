import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity, BaseEntitySchema } from '../../common/schemas/base.schema';

@Schema({ collection: 'locations' })
export class Location extends BaseEntity {
  @Prop({ type: String, required: true, unique: true })
  internalCode: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: Types.ObjectId, ref: 'Location', default: null })
  parentId?: Types.ObjectId;

  @Prop({ type: String, default: '' })
  path: string;

  @Prop({ type: Number, default: 0 })
  level: number;

  @Prop({ type: Boolean, default: true })
  isLeaf: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Location' }], default: [] })
  children: Types.ObjectId[];
}

export type LocationDocument = Location & Document;
export const LocationSchema = SchemaFactory.createForClass(Location);

// Add the base schema fields
LocationSchema.add(BaseEntitySchema);

// Add indexes
LocationSchema.index({ internalCode: 1 });
LocationSchema.index({ parentId: 1 });
LocationSchema.index({ path: 1 });
LocationSchema.index({ level: 1 });
LocationSchema.index({ isLeaf: 1 });

