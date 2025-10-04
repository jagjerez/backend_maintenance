import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Operation, OperationDocument } from './schemas/operation.schema';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { OperationQueryDto } from './dto/operation-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class OperationsService {
  constructor(
    @InjectModel(Operation.name)
    private operationModel: Model<OperationDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createOperationDto: CreateOperationDto): Promise<Operation> {
    // Check if internal code already exists
    const existingOperation = await this.operationModel.findOne({
      internalCode: createOperationDto.internalCode,
      deleteAt: { $exists: false },
    });

    if (existingOperation) {
      throw new ConflictException(
        'Operation with this internal code already exists',
      );
    }

    const operation = new this.operationModel(createOperationDto);
    return operation.save();
  }

  async findAll(
    query: OperationQueryDto,
  ): Promise<PaginationResult<Operation>> {
    const { companyId, type, ...paginationQuery } = query;

    const filterQuery: any =
      this.paginationService.buildSoftDeleteQuery(companyId);

    if (type) {
      filterQuery.type = type;
    }

    return this.paginationService.paginate(
      this.operationModel,
      filterQuery,
      paginationQuery,
    );
  }

  async findOne(id: string, companyId: string): Promise<Operation> {
    const operation = await this.operationModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    return operation;
  }

  async update(
    id: string,
    updateOperationDto: UpdateOperationDto,
    companyId: string,
  ): Promise<Operation> {
    // Check if internal code already exists (if being updated)
    if (updateOperationDto.internalCode) {
      const existingOperation = await this.operationModel.findOne({
        internalCode: updateOperationDto.internalCode,
        _id: { $ne: id },
        deleteAt: { $exists: false },
      });

      if (existingOperation) {
        throw new ConflictException(
          'Operation with this internal code already exists',
        );
      }
    }

    const operation = await this.operationModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateOperationDto,
      { new: true },
    );

    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    return operation;
  }

  async softDelete(id: string, companyId: string): Promise<Operation> {
    const operation = await this.operationModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { deleteAt: new Date() },
      { new: true },
    );

    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    return operation;
  }

  async restore(id: string, companyId: string): Promise<Operation> {
    const operation = await this.operationModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: true } },
      { $unset: { deleteAt: 1 } },
      { new: true },
    );

    if (!operation) {
      throw new NotFoundException('Operation not found or not deleted');
    }

    return operation;
  }

  async findDeleted(companyId: string): Promise<Operation[]> {
    return this.operationModel
      .find({
        companyId,
        deleteAt: { $exists: true },
      })
      .sort({ deleteAt: -1 });
  }
}
