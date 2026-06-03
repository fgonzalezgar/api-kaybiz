import { RestaurantTableRepository } from '../repositories/restaurantTable.repository';
import { BranchRepository } from '../repositories/branch.repository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { RestaurantTable } from '../database/models/restaurantTable.model';

const restaurantTableRepository = new RestaurantTableRepository();
const branchRepository = new BranchRepository();

export class RestaurantTableService {
  async getAll(tenantId: string): Promise<RestaurantTable[]> {
    return restaurantTableRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<RestaurantTable> {
    const table = await restaurantTableRepository.findByIdInTenant(tenantId, id);
    if (!table) {
      throw new NotFoundError('Restaurant table not found.');
    }
    return table;
  }

  async create(tenantId: string, data: any): Promise<RestaurantTable> {
    // 1. Validate branch exists in tenant
    const branch = await branchRepository.findByIdInTenant(tenantId, data.branchId);
    if (!branch) {
      throw new NotFoundError('Selected branch was not found in your account.');
    }

    // 2. Check table code uniqueness in branch
    const existing = await restaurantTableRepository.findByTableCode(tenantId, data.branchId, data.tableCode);
    if (existing) {
      throw new ConflictError(`Table code '${data.tableCode}' already exists in this branch.`);
    }

    return restaurantTableRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<RestaurantTable> {
    const table = await this.getById(tenantId, id);

    const branchId = data.branchId || table.branchId;
    const tableCode = data.tableCode || table.tableCode;

    // 1. If branch changed, validate new branch
    if (data.branchId && data.branchId !== table.branchId) {
      const branch = await branchRepository.findByIdInTenant(tenantId, data.branchId);
      if (!branch) {
        throw new NotFoundError('Selected branch was not found in your account.');
      }
    }

    // 2. Check uniqueness if branch or code changed
    if (data.branchId || data.tableCode) {
      const existing = await restaurantTableRepository.findByTableCode(tenantId, branchId, tableCode);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Table code '${tableCode}' already exists in this branch.`);
      }
    }

    await restaurantTableRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await restaurantTableRepository.deleteInTenant(tenantId, id);
  }
}
