import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Location, LocationDocument } from './schemas/location.schema';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    private paginationService: PaginationService,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    // Check if internal code already exists
    const existingLocation = await this.locationModel.findOne({
      internalCode: createLocationDto.internalCode,
      deleteAt: { $exists: false },
    });

    if (existingLocation) {
      throw new ConflictException(
        'Location with this internal code already exists',
      );
    }

    // Calculate path and level if parentId is provided
    let path = '';
    let level = 0;

    if (createLocationDto.parentId) {
      const parent = await this.locationModel.findById(
        createLocationDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException('Parent location not found');
      }

      path = parent.path
        ? `${parent.path}/${createLocationDto.name}`
        : `/${createLocationDto.name}`;
      level = parent.level + 1;

      // Update parent's isLeaf status
      await this.locationModel.findByIdAndUpdate(createLocationDto.parentId, {
        isLeaf: false,
      });
    } else {
      path = `/${createLocationDto.name}`;
    }

    const location = new this.locationModel({
      ...createLocationDto,
      path,
      level,
      parentId: createLocationDto.parentId
        ? new Types.ObjectId(createLocationDto.parentId)
        : null,
    });

    return location.save();
  }

  async findAll(query: LocationQueryDto): Promise<PaginationResult<Location>> {
    const { companyId, parentId, level, isLeaf, ...paginationQuery } = query;

    const filterQuery: any =
      this.paginationService.buildSoftDeleteQuery(companyId);

    if (parentId) {
      filterQuery.parentId = new Types.ObjectId(parentId);
    }

    if (level !== undefined) {
      filterQuery.level = level;
    }

    if (isLeaf !== undefined) {
      filterQuery.isLeaf = isLeaf;
    }

    return this.paginationService.paginate(
      this.locationModel,
      filterQuery,
      paginationQuery,
    );
  }

  async findOne(id: string, companyId: string): Promise<Location> {
    const location = await this.locationModel.findOne({
      _id: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async findChildren(id: string, companyId: string): Promise<Location[]> {
    return this.locationModel
      .find({
        parentId: id,
        companyId,
        deleteAt: { $exists: false },
      })
      .sort({ name: 1 });
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
    companyId: string,
  ): Promise<Location> {
    // Check if internal code already exists (if being updated)
    if (updateLocationDto.internalCode) {
      const existingLocation = await this.locationModel.findOne({
        internalCode: updateLocationDto.internalCode,
        _id: { $ne: id },
        deleteAt: { $exists: false },
      });

      if (existingLocation) {
        throw new ConflictException(
          'Location with this internal code already exists',
        );
      }
    }

    const location = await this.locationModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      updateLocationDto,
      { new: true },
    );

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async softDelete(id: string, companyId: string): Promise<Location> {
    // Check if location has children
    const children = await this.locationModel.find({
      parentId: id,
      companyId,
      deleteAt: { $exists: false },
    });

    if (children.length > 0) {
      throw new ConflictException(
        'Cannot delete location with children. Delete children first.',
      );
    }

    const location = await this.locationModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: false } },
      { deleteAt: new Date() },
      { new: true },
    );

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Update parent's isLeaf status if this was the only child
    if (location.parentId) {
      const remainingChildren = await this.locationModel.countDocuments({
        parentId: location.parentId,
        companyId,
        deleteAt: { $exists: false },
      });

      if (remainingChildren === 0) {
        await this.locationModel.findByIdAndUpdate(location.parentId, {
          isLeaf: true,
        });
      }
    }

    return location;
  }

  async restore(id: string, companyId: string): Promise<Location> {
    const location = await this.locationModel.findOneAndUpdate(
      { _id: id, companyId, deleteAt: { $exists: true } },
      { $unset: { deleteAt: 1 } },
      { new: true },
    );

    if (!location) {
      throw new NotFoundException('Location not found or not deleted');
    }

    // Update parent's isLeaf status
    if (location.parentId) {
      await this.locationModel.findByIdAndUpdate(location.parentId, {
        isLeaf: false,
      });
    }

    return location;
  }

  async findDeleted(companyId: string): Promise<Location[]> {
    return this.locationModel
      .find({
        companyId,
        deleteAt: { $exists: true },
      })
      .sort({ deleteAt: -1 });
  }
}
