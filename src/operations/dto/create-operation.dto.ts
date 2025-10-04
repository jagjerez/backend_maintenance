import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { OperationType } from '../schemas/operation.schema';

export class CreateOperationDto {
  @ApiProperty({
    enum: OperationType,
    description: 'Type of the operation',
    example: OperationType.TEXT,
  })
  @IsEnum(OperationType)
  @IsNotEmpty()
  type: OperationType;

  @ApiProperty({
    description: 'Name of the operation',
    example: 'Customer Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the operation',
    example: 'Customer full name field',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Internal code (GUID) for the operation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  internalCode: string;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}

