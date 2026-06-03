import { CategoryRepository } from '../repositories/category.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { Category } from '../database/models/category.model';

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async getAll(tenantId: string): Promise<Category[]> {
    return categoryRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<Category> {
    const category = await categoryRepository.findByIdInTenant(tenantId, id);
    if (!category) {
      throw new NotFoundError('Category not found.');
    }
    return category;
  }

  async create(tenantId: string, data: any): Promise<Category> {
    // Check if slug already exists in this tenant
    const existing = await categoryRepository.findBySlug(tenantId, data.slug);
    if (existing) {
      throw new ConflictError(`A category with slug '${data.slug}' already exists in your account.`);
    }

    // Check parent category exists in this tenant
    if (data.parentId) {
      const parent = await categoryRepository.findByIdInTenant(tenantId, data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category not found in your account.');
      }
    }

    return categoryRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<Category> {
    const category = await this.getById(tenantId, id);

    // Verify slug uniqueness if changing
    if (data.slug && data.slug !== category.slug) {
      const existing = await categoryRepository.findBySlug(tenantId, data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A category with slug '${data.slug}' already exists in your account.`);
      }
    }

    // Verify parent category exists and avoids self-reference
    if (data.parentId) {
      if (data.parentId === id) {
        throw new BadRequestError('A category cannot refer to itself as parent.');
      }
      const parent = await categoryRepository.findByIdInTenant(tenantId, data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category not found in your account.');
      }
    }

    await categoryRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    
    // Check if there are subcategories linked to this category
    const subcategories = await categoryRepository.findAll({ parentId: id, tenantId });
    if (subcategories.length > 0) {
      throw new BadRequestError('Cannot delete category because it has subcategories. Delete or reassign them first.');
    }

    await categoryRepository.deleteInTenant(tenantId, id);
  }
}
