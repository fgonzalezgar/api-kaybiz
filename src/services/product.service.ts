import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { BrandRepository } from '../repositories/brand.repository';
import { AccountingAccountRepository } from '../repositories/accountingAccount.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { Product } from '../database/models/product.model';

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const brandRepository = new BrandRepository();
const accountingAccountRepository = new AccountingAccountRepository();

export class ProductService {
  async getAll(tenantId: string): Promise<Product[]> {
    return productRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<Product> {
    const product = await productRepository.findByIdInTenant(tenantId, id);
    if (!product) {
      throw new NotFoundError('Product or service not found.');
    }
    return product;
  }

  async create(tenantId: string, data: any): Promise<Product> {
    // 1. Check SKU Barcode uniqueness per tenant
    const existing = await productRepository.findBySku(tenantId, data.skuBarcode);
    if (existing) {
      throw new ConflictError(`A product or service with SKU / Barcode '${data.skuBarcode}' already exists in your account.`);
    }

    // 2. Validate Category relation
    const category = await categoryRepository.findByIdInTenant(tenantId, data.categoryId);
    if (!category) {
      throw new NotFoundError('Selected Category was not found in your account.');
    }

    // 3. Validate Brand relation
    const brand = await brandRepository.findByIdInTenant(tenantId, data.brandId);
    if (!brand) {
      throw new NotFoundError('Selected Brand was not found in your account.');
    }

    // 4. Validate Accounting Revenue Account relation
    const revenueAccount = await accountingAccountRepository.findByIdInTenant(tenantId, data.accountingAccountRevenueId);
    if (!revenueAccount) {
      throw new NotFoundError('Selected Revenue Accounting Account was not found in your account.');
    }
    if (!revenueAccount.allowsMovement) {
      throw new BadRequestError(`Revenue Accounting Account '${revenueAccount.code}' does not allow transactional movement (auxiliary account level required).`);
    }

    // 5. Validate Accounting Expense Account relation
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

    // 1. Check SKU Barcode uniqueness if changing
    if (data.skuBarcode && data.skuBarcode !== product.skuBarcode) {
      const existing = await productRepository.findBySku(tenantId, data.skuBarcode);
      if (existing && existing.id !== id) {
        throw new ConflictError(`A product or service with SKU / Barcode '${data.skuBarcode}' already exists in your account.`);
      }
    }

    // 2. Validate Category relation if updating
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await categoryRepository.findByIdInTenant(tenantId, data.categoryId);
      if (!category) {
        throw new NotFoundError('Selected Category was not found in your account.');
      }
    }

    // 3. Validate Brand relation if updating
    if (data.brandId && data.brandId !== product.brandId) {
      const brand = await brandRepository.findByIdInTenant(tenantId, data.brandId);
      if (!brand) {
        throw new NotFoundError('Selected Brand was not found in your account.');
      }
    }

    // 4. Validate Accounting Revenue Account relation if updating
    if (data.accountingAccountRevenueId && data.accountingAccountRevenueId !== product.accountingAccountRevenueId) {
      const revenueAccount = await accountingAccountRepository.findByIdInTenant(tenantId, data.accountingAccountRevenueId);
      if (!revenueAccount) {
        throw new NotFoundError('Selected Revenue Accounting Account was not found in your account.');
      }
      if (!revenueAccount.allowsMovement) {
        throw new BadRequestError(`Revenue Accounting Account '${revenueAccount.code}' does not allow transactional movement.`);
      }
    }

    // 5. Validate Accounting Expense Account relation if updating
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

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await productRepository.deleteInTenant(tenantId, id);
  }
}
