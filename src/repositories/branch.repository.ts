import { BaseRepository } from './base.repository';
import { Branch } from '../database/models/branch.model';
import { CreateOptions } from 'sequelize';

export class BranchRepository extends BaseRepository<Branch> {
  constructor() {
    super(Branch);
  }

  async createInTenant(tenantId: string, data: any, options?: CreateOptions): Promise<Branch> {
    return this.create({ ...data, tenantId }, options);
  }

  async findByIdInTenant(tenantId: string, id: string): Promise<Branch | null> {
    return this.findOne({ id, tenantId });
  }

  async findAllInTenant(tenantId: string): Promise<Branch[]> {
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
