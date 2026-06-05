import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { BrandRepository } from '../repositories/brand.repository';
import { AccountingAccountRepository } from '../repositories/accountingAccount.repository';
import { TenantRepository } from '../repositories/tenant.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { Product } from '../database/models/product.model';
import { WhereOptions } from 'sequelize';

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const brandRepository = new BrandRepository();
const accountingAccountRepository = new AccountingAccountRepository();
const tenantRepository = new TenantRepository();

export class ProductService {
  async getAll(
    tenantId: string,
    filters: {
      include_inactive?: boolean | string;
      page?: number | string;
      limit?: number | string;
    } = {}
  ): Promise<{ rows: Product[]; count: number; page: number; limit: number }> {
    const where: WhereOptions = { tenantId };

    // Default: exclude inactive unless requested
    const includeInactive = filters.include_inactive === true || filters.include_inactive === 'true';
    if (!includeInactive) {
      where.isActive = true;
    }

    const page = parseInt(filters.page as string, 10) || 1;
    const limit = parseInt(filters.limit as string, 10) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      rows,
      count,
      page,
      limit,
    };
  }

  async getById(tenantId: string, id: string): Promise<Product> {
    const product = await productRepository.findByIdInTenant(tenantId, id);
    if (!product) {
      throw new NotFoundError('Product or service not found.');
    }
    return product;
  }

  async create(tenantId: string, data: any): Promise<Product> {
    // 1. Fetch Tenant to parse configurations
    const tenant = await tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant profile not found.');
    }

    // 2. Validate compliance: if drugstore/supermarket, requiresExpirationControl requires batchNumber
    const isDrugstoreOrSupermarket = tenant.businessType === 'drugstore' || tenant.businessType === 'supermarket';
    if (isDrugstoreOrSupermarket && data.requiresExpirationControl) {
      if (!data.batchNumber || data.batchNumber.trim() === '') {
        throw new BadRequestError('batchNumber is mandatory for products requiring expiration control under drugstore or supermarket tenants.');
      }
    }

    // 3. Check SKU Barcode uniqueness per tenant
    const existing = await productRepository.findBySku(tenantId, data.skuBarcode);
    if (existing) {
      throw new ConflictError(`A product or service with SKU / Barcode '${data.skuBarcode}' already exists in your account.`);
    }

    // 4. Validate Category relation
    const category = await categoryRepository.findByIdInTenant(tenantId, data.categoryId);
    if (!category) {
      throw new NotFoundError('Selected Category was not found in your account.');
    }

    // 5. Validate Brand relation
    const brand = await brandRepository.findByIdInTenant(tenantId, data.brandId);
    if (!brand) {
      throw new NotFoundError('Selected Brand was not found in your account.');
    }

    // 6. Validate Accounting Revenue Account relation
    const revenueAccount = await accountingAccountRepository.findByIdInTenant(tenantId, data.accountingAccountRevenueId);
    if (!revenueAccount) {
      throw new NotFoundError('Selected Revenue Accounting Account was not found in your account.');
    }
    if (!revenueAccount.allowsMovement) {
      throw new BadRequestError(`Revenue Accounting Account '${revenueAccount.code}' does not allow transactional movement (auxiliary account level required).`);
    }

    // 7. Validate Accounting Expense Account relation
    const expenseAccount = await accountingAccountRepository.findByIdInTenant(tenantId, data.accountingAccountExpenseId);
    if (!expenseAccount) {
      throw new NotFoundError('Selected Expense Accounting Account was not found in your account.');
    }
    if (!expenseAccount.allowsMovement) {
      throw new BadRequestError(`Expense Accounting Account '${expenseAccount.code}' does not allow transactional movement (auxiliary account level required).`);
    }

    return productRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<Product> {
    const product = await this.getById(tenantId, id);

    // 1. Fetch Tenant to parse configurations
    const tenant = await tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant profile not found.');
    }

    // 2. Validate compliance: drugstore/supermarket constraints
    const isDrugstoreOrSupermarket = tenant.businessType === 'drugstore' || tenant.businessType === 'supermarket';
    const finalRequiresExp = data.requiresExpirationControl !== undefined ? data.requiresExpirationControl : product.requiresExpirationControl;
    const finalBatch = data.batchNumber !== undefined ? data.batchNumber : product.batchNumber;

    if (isDrugstoreOrSupermarket && finalRequiresExp) {
      if (!finalBatch || finalBatch.trim() === '') {
        throw new BadRequestError('batchNumber is mandatory for products requiring expiration control under drugstore or supermarket tenants.');
      }
    }

    // 3. Check SKU Barcode uniqueness if changing
    if (data.skuBarcode && data.skuBarcode !== product.skuBarcode) {
      const existing = await productRepository.findBySku(tenantId, data.skuBarcode);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A product or service with SKU / Barcode '${data.skuBarcode}' already exists in your account.`);
      }
    }

    // 4. Validate Category relation if updating
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await categoryRepository.findByIdInTenant(tenantId, data.categoryId);
      if (!category) {
        throw new NotFoundError('Selected Category was not found in your account.');
      }
    }

    // 5. Validate Brand relation if updating
    if (data.brandId && data.brandId !== product.brandId) {
      const brand = await brandRepository.findByIdInTenant(tenantId, data.brandId);
      if (!brand) {
        throw new NotFoundError('Selected Brand was not found in your account.');
      }
    }

    // 6. Validate Accounting Revenue Account relation if updating
    if (data.accountingAccountRevenueId && data.accountingAccountRevenueId !== product.accountingAccountRevenueId) {
      const revenueAccount = await accountingAccountRepository.findByIdInTenant(tenantId, data.accountingAccountRevenueId);
      if (!revenueAccount) {
        throw new NotFoundError('Selected Revenue Accounting Account was not found in your account.');
      }
      if (!revenueAccount.allowsMovement) {
        throw new BadRequestError(`Revenue Accounting Account '${revenueAccount.code}' does not allow transactional movement.`);
      }
    }

    // 7. Validate Accounting Expense Account relation if updating
    if (data.accountingAccountExpenseId && data.accountingAccountExpenseId !== product.accountingAccountExpenseId) {
      const expenseAccount = await accountingAccountRepository.findByIdInTenant(tenantId, data.accountingAccountExpenseId);
      if (!expenseAccount) {
        throw new NotFoundError('Selected Expense Accounting Account was not found in your account.');
      }
      if (!expenseAccount.allowsMovement) {
        throw new BadRequestError(`Expense Accounting Account '${expenseAccount.code}' does not allow transactional movement.`);
      }
    }

    await productRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async toggleStatus(tenantId: string, id: string): Promise<Product> {
    const product = await this.getById(tenantId, id);
    const updatedStatus = !product.isActive;
    await productRepository.updateInTenant(tenantId, id, { isActive: updatedStatus });
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await productRepository.deleteInTenant(tenantId, id);
  }
}
