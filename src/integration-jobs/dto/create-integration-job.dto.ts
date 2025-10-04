import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IntegrationJobType,
  IntegrationJobStatus,
} from '../schemas/integration-job.schema';

class IntegrationJobErrorDto {
  @ApiProperty({
    description: 'Row number where error occurred',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  row: number;

  @ApiProperty({
    description: 'Field name where error occurred',
    example: 'email',
  })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({
    description: 'Value that caused the error',
    example: 'invalid-email',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid email format',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CreateIntegrationJobDto {
  @ApiProperty({
    enum: IntegrationJobType,
    description: 'Type of the integration job',
    example: IntegrationJobType.IMPORT,
  })
  @IsEnum(IntegrationJobType)
  @IsNotEmpty()
  type: IntegrationJobType;

  @ApiProperty({
    enum: IntegrationJobStatus,
    description: 'Status of the integration job',
    example: IntegrationJobStatus.PENDING,
    required: false,
  })
  @IsEnum(IntegrationJobStatus)
  @IsOptional()
  status?: IntegrationJobStatus;

  @ApiProperty({
    description: 'Name of the file',
    example: 'users_import.csv',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({
    description: 'URL of the file',
    example: 'https://example.com/files/users_import.csv',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'Total number of rows to process',
    example: 1000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalRows?: number;

  @ApiProperty({
    description: 'Number of rows processed',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  processedRows?: number;

  @ApiProperty({
    description: 'Number of successful rows',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  successRows?: number;

  @ApiProperty({
    description: 'Number of error rows',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  errorRows?: number;

  @ApiProperty({
    description: 'Number of limited rows',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limitedRows?: number;

  @ApiProperty({
    description: 'Array of errors encountered during processing',
    type: [IntegrationJobErrorDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IntegrationJobErrorDto)
  errors?: IntegrationJobErrorDto[];

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
