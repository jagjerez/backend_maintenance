import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Check if company with same name already exists
    const existingCompany = await this.companyModel.findOne({
      name: createCompanyDto.name,
      deleteAt: { $exists: false },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this name already exists');
    }

    // Set default branding if not provided
    const branding = createCompanyDto.branding || {
      appName: createCompanyDto.appName || createCompanyDto.name,
      primaryColor: createCompanyDto.primaryColor || '#3B82F6',
    };

    const company = new this.companyModel({
      ...createCompanyDto,
      branding,
    });

    return company.save();
  }

  async findAll(query: CompanyQueryDto): Promise<PaginationResult<Company>> {
    const { companyId, ...paginationQuery } = query;
    
    const filterQuery = this.paginationService.buildSoftDeleteQuery(companyId);

    return this.paginationService.paginate(this.companyModel, filterQuery, paginationQuery);
  }

  async findOne(id: string, companyId: string): Promise<Company> {
    const company = await this.companyModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, companyId: string): Promise<Company> {
    // Check if company with same name already exists (if being updated)
    if (updateCompanyDto.name) {
      const existingCompany = await this.companyModel.findOne({
        name: updateCompanyDto.name,
        _id: { $ne: id },
        deleteAt: { $exists: false },
      });

      if (existingCompany) {
        throw new ConflictException('Company with this name already exists');
      }
    }

    const company = await this.companyModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateCompanyDto,
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async softDelete(id: string, companyId: string): Promise<Company> {
    const company = await this.companyModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { deleteAt: new Date() },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async restore(id: string, companyId: string): Promise<Company> {
    const company = await this.companyModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: true } },
      { $unset: { deleteAt: 1 } },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found or not deleted');
    }

    return company;
  }

  async findDeleted(companyId: string): Promise<Company[]> {
    return this.companyModel.find({
      companyId,
      deleteAt: { $exists: true },
    }).sort({ deleteAt: -1 });
  }

  async updateBranding(id: string, branding: any, companyId: string): Promise<Company> {
    const company = await this.companyModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { branding },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateSettings(id: string, settings: any, companyId: string): Promise<Company> {
    const company = await this.companyModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { settings },
      { new: true },
    );

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }
}

