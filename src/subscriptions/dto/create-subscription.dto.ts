import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class SubscriptionSettingDto {
  @ApiProperty({
    description: 'Entity name',
    example: 'users',
  })
  @IsString()
  @IsNotEmpty()
  entity: string;

  @ApiProperty({
    description: 'Create limit for this entity',
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  createLimitRegistry: number;
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription name',
    example: 'Basic Plan',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Subscription description',
    example: 'Basic subscription plan with limited features',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Subscription settings',
    type: [SubscriptionSettingDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionSettingDto)
  settings?: SubscriptionSettingDto[];

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}

