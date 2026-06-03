import { BaseRepository } from './base.repository';
import { RestaurantTable } from '../database/models/restaurantTable.model';
import { CreateOptions } from 'sequelize';

export class RestaurantTableRepository extends BaseRepository<RestaurantTable> {
  constructor() {
    super(RestaurantTable);
  }

  async findByTableCode(tenantId: string, branchId: string, tableCode: string): Promise<RestaurantTable | null> {
    return this.findOne({ tenantId, branchId, tableCode });
  }

  async createInTenant(tenantId: string, data: any, options?: CreateOptions): Promise<RestaurantTable> {
    return this.create({ ...data, tenantId }, options);
  }

  async findByIdInTenant(tenantId: string, id: string): Promise<RestaurantTable | null> {
    return this.findOne({ id, tenantId });
  }

  async findAllInTenant(tenantId: string): Promise<RestaurantTable[]> {
    return this.findAll({ tenantId });
  }

  async updateInTenant(tenantId: string, id: string, data: any): Promise<boolean> {
    const affected = await this.update({ id, tenantId }, data);
    return affected > 0;
  }

  async deleteInTenant(tenantId: string, id: string): Promise<boolean> {
    const affected = await this.delete({ id, tenantId });
    return affected > 0;
  }
}
