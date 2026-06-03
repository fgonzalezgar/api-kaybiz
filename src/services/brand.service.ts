import { BrandRepository } from '../repositories/brand.repository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Brand } from '../database/models/brand.model';

const brandRepository = new BrandRepository();

export class BrandService {
  async getAll(tenantId: string): Promise<Brand[]> {
    return brandRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<Brand> {
    const brand = await brandRepository.findByIdInTenant(tenantId, id);
    if (!brand) {
      throw new NotFoundError('Brand not found.');
    }
    return brand;
  }

  async create(tenantId: string, data: any): Promise<Brand> {
    // Check if name already exists in this tenant
    const existing = await brandRepository.findByName(tenantId, data.name);
    if (existing) {
      throw new ConflictError(`A brand with name '${data.name}' already exists in your account.`);
    }

    return brandRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<Brand> {
    const brand = await this.getById(tenantId, id);

    // Verify name uniqueness if changing
    if (data.name && data.name !== brand.name) {
      const existing = await brandRepository.findByName(tenantId, data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A brand with name '${data.name}' already exists in your account.`);
      }
    }

    await brandRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await brandRepository.deleteInTenant(tenantId, id);
  }
}
