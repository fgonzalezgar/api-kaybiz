import { BaseRepository } from './base.repository';
import { AccountingAccount } from '../database/models/accountingAccount.model';
import { CreateOptions, BulkCreateOptions } from 'sequelize';

export class AccountingAccountRepository extends BaseRepository<AccountingAccount> {
  constructor() {
    super(AccountingAccount);
  }

  async findByCode(tenantId: string, code: string): Promise<AccountingAccount | null> {
    return this.findOne({ tenantId, code });
  }

  async createInTenant(tenantId: string, data: any, options?: CreateOptions): Promise<AccountingAccount> {
    return this.create({ ...data, tenantId }, options);
  }

  async findByIdInTenant(tenantId: string, id: string): Promise<AccountingAccount | null> {
    return this.findOne({ id, tenantId });
  }

  async findAllInTenant(tenantId: string): Promise<AccountingAccount[]> {
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

  async bulkCreateInTenant(tenantId: string, accounts: any[], options?: BulkCreateOptions): Promise<AccountingAccount[]> {
    const prepared = accounts.map((acc) => ({ ...acc, tenantId }));
    return AccountingAccount.bulkCreate(prepared, options);
  }
}
