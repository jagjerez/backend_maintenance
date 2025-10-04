import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationJobsService } from './integration-jobs.service';
import { IntegrationJobsController } from './integration-jobs.controller';
import { IntegrationJob, IntegrationJobSchema } from './schemas/integration-job.schema';
import { PaginationService } from '../common/services/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: IntegrationJob.name, schema: IntegrationJobSchema }]),
  ],
  controllers: [IntegrationJobsController],
  providers: [IntegrationJobsService, PaginationService],
  exports: [IntegrationJobsService],
})
export class IntegrationJobsModule {}

