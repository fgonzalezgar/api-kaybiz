import { ThirdPartyRepository } from '../repositories/thirdParty.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { ThirdParty } from '../database/models/thirdParty.model';
import { Op, WhereOptions } from 'sequelize';

const thirdPartyRepository = new ThirdPartyRepository();

export class ThirdPartyService {
  async getAll(
    tenantId: string,
    filters: {
      type?: 'client' | 'provider' | 'employee';
      search?: string;
      include_inactive?: boolean | string;
      page?: number | string;
      limit?: number | string;
    } = {}
  ): Promise<{ rows: ThirdParty[]; count: number; page: number; limit: number }> {
    const where: WhereOptions = { tenantId };

    // Default: exclude inactive unless requested
    const includeInactive = filters.include_inactive === true || filters.include_inactive === 'true';
    if (!includeInactive) {
      where.isActive = true;
    }

    // Role-based type filtering
    if (filters.type === 'client') {
      where.isClient = true;
    } else if (filters.type === 'provider') {
      where.isProvider = true;
    } else if (filters.type === 'employee') {
      where.isEmployee = true;
    }

    // Search query: matches document number, first/last names, or company name
    if (filters.search && filters.search.trim() !== '') {
      const searchPattern = `%${filters.search.trim()}%`;
      where[Op.or as any] = [
        { documentNumber: { [Op.like]: searchPattern } },
        { firstName: { [Op.like]: searchPattern } },
        { lastName: { [Op.like]: searchPattern } },
        { companyName: { [Op.like]: searchPattern } },
      ];
    }

    // Parse pagination
    const page = parseInt(filters.page as string, 10) || 1;
    const limit = parseInt(filters.limit as string, 10) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await ThirdParty.findAndCountAll({
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

  async getById(tenantId: string, id: string): Promise<ThirdParty> {
    const thirdParty = await thirdPartyRepository.findByIdInTenant(tenantId, id);
    if (!thirdParty) {
      throw new NotFoundError('Third party record not found.');
    }
    return thirdParty;
  }

  async create(tenantId: string, data: any): Promise<ThirdParty> {
    // Validate role constraint: must possess at least one flag
    if (!data.isClient && !data.isProvider && !data.isEmployee) {
      throw new BadRequestError('The third party must be marked as either a client, a provider, or an employee.');
    }

    // Check document uniqueness per tenant
    const existing = await thirdPartyRepository.findByDocumentNumber(tenantId, data.documentNumber);
    if (existing) {
      throw new ConflictError('A third party with this document number already exists in your account.');
    }

    return thirdPartyRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<ThirdParty> {
    const thirdParty = await this.getById(tenantId, id);

    // Validate role constraints on update
    const isClient = data.isClient !== undefined ? data.isClient : thirdParty.isClient;
    const isProvider = data.isProvider !== undefined ? data.isProvider : thirdParty.isProvider;
    const isEmployee = data.isEmployee !== undefined ? data.isEmployee : thirdParty.isEmployee;
    if (!isClient && !isProvider && !isEmployee) {
      throw new BadRequestError('The third party must be marked as either a client, a provider, or an employee.');
    }

    // Validate NIT conditional details if documentType is changing or updating
    const docType = data.documentType || thirdParty.documentType;
    if (docType === 'NIT') {
      const companyName = data.companyName !== undefined ? data.companyName : thirdParty.companyName;
      const verificationDigit = data.verificationDigit !== undefined ? data.verificationDigit : thirdParty.verificationDigit;
      if (!companyName || companyName.trim() === '') {
        throw new BadRequestError('companyName is mandatory when documentType is NIT');
      }
      if (!verificationDigit || !/^[0-9]$/.test(verificationDigit)) {
        throw new BadRequestError('verificationDigit is mandatory and must be a single digit (0-9) when documentType is NIT');
      }
    }

    // Check document uniqueness if changing number
    if (data.documentNumber && data.documentNumber !== thirdParty.documentNumber) {
      const existing = await thirdPartyRepository.findByDocumentNumber(tenantId, data.documentNumber);
      if (existing && existing.id !== id) {
        throw new ConflictError('A third party with this document number already exists in your account.');
      }
    }

    await thirdPartyRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async toggleStatus(tenantId: string, id: string): Promise<ThirdParty> {
    const thirdParty = await this.getById(tenantId, id);
    const updatedStatus = !thirdParty.isActive;
    await thirdPartyRepository.updateInTenant(tenantId, id, { isActive: updatedStatus });
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await thirdPartyRepository.deleteInTenant(tenantId, id);
  }
}
