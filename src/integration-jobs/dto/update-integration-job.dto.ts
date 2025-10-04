import { PartialType } from '@nestjs/swagger';
import { CreateIntegrationJobDto } from './create-integration-job.dto';

export class UpdateIntegrationJobDto extends PartialType(
  CreateIntegrationJobDto,
) {}
