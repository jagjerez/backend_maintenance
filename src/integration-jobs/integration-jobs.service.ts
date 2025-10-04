import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IntegrationJob, IntegrationJobDocument, IntegrationJobStatus } from './schemas/integration-job.schema';
import { CreateIntegrationJobDto } from './dto/create-integration-job.dto';
import { UpdateIntegrationJobDto } from './dto/update-integration-job.dto';
import { IntegrationJobQueryDto } from './dto/integration-job-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class IntegrationJobsService {
  constructor(
    @InjectModel(IntegrationJob.name) private integrationJobModel: Model<IntegrationJobDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createIntegrationJobDto: CreateIntegrationJobDto): Promise<IntegrationJob> {
    const integrationJob = new this.integrationJobModel(createIntegrationJobDto);
    return integrationJob.save();
  }

  async findAll(query: IntegrationJobQueryDto): Promise<PaginationResult<IntegrationJob>> {
    const { companyId, type, status, ...paginationQuery } = query;
    
    let filterQuery: any = this.paginationService.buildSoftDeleteQuery(companyId);
    
    if (type) {
      filterQuery.type = type;
    }
    
    if (status) {
      filterQuery.status = status;
    }

    return this.paginationService.paginate(this.integrationJobModel, filterQuery, paginationQuery);
  }

  async findOne(id: string, companyId: string): Promise<IntegrationJob> {
    const integrationJob = await this.integrationJobModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found');
    }

    return integrationJob;
  }

  async update(id: string, updateIntegrationJobDto: UpdateIntegrationJobDto, companyId: string): Promise<IntegrationJob> {
    const integrationJob = await this.integrationJobModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateIntegrationJobDto,
      { new: true },
    );

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found');
    }

    return integrationJob;
  }

  async updateStatus(id: string, status: IntegrationJobStatus, companyId: string): Promise<IntegrationJob> {
    const updateData: any = { status };
    
    if (status === IntegrationJobStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const integrationJob = await this.integrationJobModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateData,
      { new: true },
    );

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found');
    }

    return integrationJob;
  }

  async updateProgress(
    id: string, 
    processedRows: number, 
    successRows: number, 
    errorRows: number, 
    limitedRows: number,
    companyId: string
  ): Promise<IntegrationJob> {
    const integrationJob = await this.integrationJobModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { 
        processedRows, 
        successRows, 
        errorRows, 
        limitedRows 
      },
      { new: true },
    );

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found');
    }

    return integrationJob;
  }

  async addError(id: string, error: any, companyId: string): Promise<IntegrationJob> {
    const integrationJob = await this.integrationJobModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { $push: { errors: error } },
      { new: true },
    );

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found');
    }

    return integrationJob;
  }

  async softDelete(id: string, companyId: string): Promise<IntegrationJob> {
    const integrationJob = await this.integrationJobModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { deleteAt: new Date() },
      { new: true },
    );

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found');
    }

    return integrationJob;
  }

  async restore(id: string, companyId: string): Promise<IntegrationJob> {
    const integrationJob = await this.integrationJobModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: true } },
      { $unset: { deleteAt: 1 } },
      { new: true },
    );

    if (!integrationJob) {
      throw new NotFoundException('Integration job not found or not deleted');
    }

    return integrationJob;
  }

  async findDeleted(companyId: string): Promise<IntegrationJob[]> {
    return this.integrationJobModel.find({
      companyId,
      deleteAt: { $exists: true },
    }).sort({ deleteAt: -1 });
  }

  async getJobStats(companyId: string): Promise<any> {
    const stats = await this.integrationJobModel.aggregate([
      { $match: { companyId, deleteAt: { $exists: false } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRows: { $sum: '$totalRows' },
          processedRows: { $sum: '$processedRows' },
          successRows: { $sum: '$successRows' },
          errorRows: { $sum: '$errorRows' },
        },
      },
    ]);

    return stats;
  }
}

