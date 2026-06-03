import { BaseRepository } from './base.repository';
import { ServiceSpecialist } from '../database/models/serviceSpecialist.model';
import { CreateOptions } from 'sequelize';

export class ServiceSpecialistRepository extends BaseRepository<ServiceSpecialist> {
  constructor() {
    super(ServiceSpecialist);
  }

  async findByUserId(tenantId: string, userId: string): Promise<ServiceSpecialist | null> {
    return this.findOne({ tenantId, userId });
  }

  async createInTenant(tenantId: string, data: any, options?: CreateOptions): Promise<ServiceSpecialist> {
    return this.create({ ...data, tenantId }, options);
  }

  async findByIdInTenant(tenantId: string, id: string): Promise<ServiceSpecialist | null> {
    return this.findOne({ id, tenantId });
  }

  async findAllInTenant(tenantId: string): Promise<ServiceSpecialist[]> {
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
