import { BaseRepository } from './base.repository';
import { Category } from '../database/models/category.model';
import { CreateOptions } from 'sequelize';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  async findBySlug(tenantId: string, slug: string): Promise<Category | null> {
    return this.findOne({ tenantId, slug });
  }

  async createInTenant(tenantId: string, data: any, options?: CreateOptions): Promise<Category> {
    return this.create({ ...data, tenantId }, options);
  }

  async findByIdInTenant(tenantId: string, id: string): Promise<Category | null> {
    return this.findOne({ id, tenantId });
  }

  async findAllInTenant(tenantId: string): Promise<Category[]> {
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
