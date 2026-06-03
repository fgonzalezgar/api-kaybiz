import { AccountingAccountRepository } from '../repositories/accountingAccount.repository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AccountingAccount } from '../database/models/accountingAccount.model';
import { COLOMBIA_BASE_PUC } from '../utils/puc-colombia';

const accountingAccountRepository = new AccountingAccountRepository();

export class AccountingAccountService {
  async getAll(tenantId: string): Promise<AccountingAccount[]> {
    return accountingAccountRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<AccountingAccount> {
    const account = await accountingAccountRepository.findByIdInTenant(tenantId, id);
    if (!account) {
      throw new NotFoundError('Accounting account not found.');
    }
    return account;
  }

  async create(tenantId: string, data: any): Promise<AccountingAccount> {
    // Check if code is already registered in this tenant
    const existing = await accountingAccountRepository.findByCode(tenantId, data.code);
    if (existing) {
      throw new ConflictError(`An accounting account with code '${data.code}' already exists in your account.`);
    }

    return accountingAccountRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<AccountingAccount> {
    const account = await this.getById(tenantId, id);

    // Verify code uniqueness if changing
    if (data.code && data.code !== account.code) {
      const existing = await accountingAccountRepository.findByCode(tenantId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`An accounting account with code '${data.code}' already exists in your account.`);
      }
    }

    await accountingAccountRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await accountingAccountRepository.deleteInTenant(tenantId, id);
  }

  /**
   * Service hook to seed base Colombia PUC accounts for a tenant.
   * Can be triggered programmatically or via onboarding flow.
   */
  async seedPucMatrix(tenantId: string): Promise<AccountingAccount[]> {
    // Prevent double seeding
    const existingCount = await accountingAccountRepository.findAll({ tenantId });
    if (existingCount.length > 0) {
      throw new ConflictError('Accounting accounts matrix is already seeded for this tenant.');
    }

    return accountingAccountRepository.bulkCreateInTenant(tenantId, COLOMBIA_BASE_PUC);
  }
}
