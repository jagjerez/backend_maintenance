import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { Operation, OperationSchema } from './schemas/operation.schema';
import { PaginationService } from '../common/services/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Operation.name, schema: OperationSchema }]),
  ],
  controllers: [OperationsController],
  providers: [OperationsService, PaginationService],
  exports: [OperationsService],
})
export class OperationsModule {}

