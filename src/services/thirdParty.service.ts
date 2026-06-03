import { ThirdPartyRepository } from '../repositories/thirdParty.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { ThirdParty } from '../database/models/thirdParty.model';

const thirdPartyRepository = new ThirdPartyRepository();

export class ThirdPartyService {
  async getAll(tenantId: string): Promise<ThirdParty[]> {
    return thirdPartyRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<ThirdParty> {
    const thirdParty = await thirdPartyRepository.findByIdInTenant(tenantId, id);
    if (!thirdParty) {
      throw new NotFoundError('Third party record not found.');
    }
    return thirdParty;
  }

  async create(tenantId: string, data: any): Promise<ThirdParty> {
    // Validate role constraint
    if (!data.isClient && !data.isProvider) {
      throw new BadRequestError('The third party must be marked as either a client, a provider, or both.');
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

    // Validate role constraint
    const isClient = data.isClient !== undefined ? data.isClient : thirdParty.isClient;
    const isProvider = data.isProvider !== undefined ? data.isProvider : thirdParty.isProvider;
    if (!isClient && !isProvider) {
      throw new BadRequestError('The third party must be marked as either a client, a provider, or both.');
    }

    // Check document uniqueness if changing
    if (data.documentNumber && data.documentNumber !== thirdParty.documentNumber) {
      const existing = await thirdPartyRepository.findByDocumentNumber(tenantId, data.documentNumber);
      if (existing && existing.id !== id) {
        throw new ConflictError('A third party with this document number already exists in your account.');
      }
    }

    await thirdPartyRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    // Verify existence first
    await this.getById(tenantId, id);
    await thirdPartyRepository.deleteInTenant(tenantId, id);
  }
}
