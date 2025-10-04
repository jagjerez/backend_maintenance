import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Internal code for the location',
    example: 'LOC-001',
  })
  @IsString()
  @IsNotEmpty()
  internalCode: string;

  @ApiProperty({
    description: 'Name of the location',
    example: 'Main Office',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the location',
    example: 'Main office building',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Icon for the location',
    example: 'building',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Parent location ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Path of the location',
    example: '/main-office',
    required: false,
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({
    description: 'Level of the location in hierarchy',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  level?: number;

  @ApiProperty({
    description: 'Whether this location is a leaf node',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isLeaf?: boolean;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
