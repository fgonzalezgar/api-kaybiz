import { BaseRepository } from './base.repository';
import { Product } from '../database/models/product.model';
import { CreateOptions } from 'sequelize';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  async findBySku(tenantId: string, skuBarcode: string): Promise<Product | null> {
    return this.findOne({ tenantId, skuBarcode });
  }

  async createInTenant(tenantId: string, data: any, options?: CreateOptions): Promise<Product> {
    return this.create({ ...data, tenantId }, options);
  }

  async findByIdInTenant(tenantId: string, id: string): Promise<Product | null> {
    return this.findOne({ id, tenantId });
  }

  async findAllInTenant(tenantId: string): Promise<Product[]> {
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
