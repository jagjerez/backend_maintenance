import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity, BaseEntitySchema } from '../../common/schemas/base.schema';

export interface CompanyBranding {
  appName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface CompanySettings {
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
}

@Schema({ collection: 'companies' })
export class Company extends BaseEntity {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  logo?: string;

  @Prop({ type: String, default: '#3B82F6' })
  primaryColor: string;

  @Prop({ type: String })
  appName?: string;

  @Prop({ type: String, default: 'light' })
  theme: string;

  @Prop({
    type: {
      appName: { type: String, required: true },
      logo: { type: String },
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String },
      accentColor: { type: String },
    },
    required: true,
  })
  branding: CompanyBranding;

  @Prop({
    type: {
      allowUserRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: true },
      defaultUserRole: { type: String, default: 'user' },
    },
    default: {
      allowUserRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'user',
    },
  })
  settings: CompanySettings;
}

export type CompanyDocument = Company & Document;
export const CompanySchema = SchemaFactory.createForClass(Company);

// Add the base schema fields
CompanySchema.add(BaseEntitySchema);

// Add indexes
CompanySchema.index({ name: 1 });
CompanySchema.index({ appName: 1 });
