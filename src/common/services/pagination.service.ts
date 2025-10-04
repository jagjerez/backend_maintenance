import { Injectable } from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import {
  PaginationQuery,
  PaginationResult,
  PaginationOptions,
} from '../interfaces/pagination.interface';

@Injectable()
export class PaginationService {
  async paginate<T>(
    model: Model<T>,
    query: FilterQuery<T>,
    paginationQuery: PaginationQuery,
  ): Promise<PaginationResult<T>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = paginationQuery;

    // Build search query if search term is provided
    let searchQuery = { ...query };
    if (search) {
      // This is a basic search implementation - you might want to customize based on your needs
      searchQuery = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Calculate pagination options
    const options: PaginationOptions = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)), // Cap at 100 items per page
      sortBy,
      sortOrder,
    };

    // Calculate skip value
    const skip = (options.page - 1) * options.limit;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      model.find(searchQuery).sort(sort).skip(skip).limit(options.limit).exec(),
      model.countDocuments(searchQuery).exec(),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / options.limit);
    const hasNext = options.page < totalPages;
    const hasPrev = options.page > 1;

    return {
      data,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  buildSoftDeleteQuery(
    companyId?: string,
    includeDeleted = false,
  ): FilterQuery<any> {
    const query: FilterQuery<any> = {};

    if (companyId) {
      query.companyId = companyId;
    }

    if (!includeDeleted) {
      query.deleteAt = { $exists: false };
    }

    return query;
  }
}
