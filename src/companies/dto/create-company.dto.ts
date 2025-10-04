import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CompanyBrandingDto {
  @ApiProperty({
    description: 'Application name',
    example: 'My App',
  })
  @IsString()
  @IsNotEmpty()
  appName: string;

  @ApiProperty({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Primary color',
    example: '#3B82F6',
  })
  @IsString()
  @IsNotEmpty()
  primaryColor: string;

  @ApiProperty({
    description: 'Secondary color',
    example: '#1E40AF',
    required: false,
  })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({
    description: 'Accent color',
    example: '#F59E0B',
    required: false,
  })
  @IsString()
  @IsOptional()
  accentColor?: string;
}

class CompanySettingsDto {
  @ApiProperty({
    description: 'Allow user registration',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowUserRegistration?: boolean;

  @ApiProperty({
    description: 'Require email verification',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requireEmailVerification?: boolean;

  @ApiProperty({
    description: 'Default user role',
    example: 'user',
    required: false,
  })
  @IsString()
  @IsOptional()
  defaultUserRole?: string;
}

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Primary color',
    example: '#3B82F6',
    required: false,
  })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({
    description: 'Application name',
    example: 'My App',
    required: false,
  })
  @IsString()
  @IsOptional()
  appName?: string;

  @ApiProperty({
    description: 'Theme',
    example: 'light',
    required: false,
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiProperty({
    description: 'Company branding configuration',
    type: CompanyBrandingDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyBrandingDto)
  branding?: CompanyBrandingDto;

  @ApiProperty({
    description: 'Company settings',
    type: CompanySettingsDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanySettingsDto)
  settings?: CompanySettingsDto;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
