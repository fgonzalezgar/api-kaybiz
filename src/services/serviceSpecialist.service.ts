import { ServiceSpecialistRepository } from '../repositories/serviceSpecialist.repository';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { ServiceSpecialist } from '../database/models/serviceSpecialist.model';

const serviceSpecialistRepository = new ServiceSpecialistRepository();
const userRepository = new UserRepository();

export class ServiceSpecialistService {
  async getAll(tenantId: string): Promise<ServiceSpecialist[]> {
    return serviceSpecialistRepository.findAllInTenant(tenantId);
  }

  async getById(tenantId: string, id: string): Promise<ServiceSpecialist> {
    const specialist = await serviceSpecialistRepository.findByIdInTenant(tenantId, id);
    if (!specialist) {
      throw new NotFoundError('Service specialist configuration not found.');
    }
    return specialist;
  }

  async create(tenantId: string, data: any): Promise<ServiceSpecialist> {
    // 1. Check commission limits
    if (data.commissionPercentage < 0 || data.commissionPercentage > 100) {
      throw new BadRequestError('Commission percentage must be between 0.00% and 100.00%.');
    }

    // 2. Validate user exists in tenant
    const user = await userRepository.findByIdInTenant(tenantId, data.userId);
    if (!user) {
      throw new NotFoundError('Selected user was not found in your account.');
    }

    // 3. Check if user is already configured as a specialist
    const existing = await serviceSpecialistRepository.findByUserId(tenantId, data.userId);
    if (existing) {
      throw new ConflictError('Selected user is already registered as a service specialist.');
    }

    return serviceSpecialistRepository.createInTenant(tenantId, data);
  }

  async update(tenantId: string, id: string, data: any): Promise<ServiceSpecialist> {
    const specialist = await this.getById(tenantId, id);

    // 1. Check commission limits if updating
    if (data.commissionPercentage !== undefined) {
      if (data.commissionPercentage < 0 || data.commissionPercentage > 100) {
        throw new BadRequestError('Commission percentage must be between 0.00% and 100.00%.');
      }
    }

    // 2. Validate user if changing
    if (data.userId && data.userId !== specialist.userId) {
      const user = await userRepository.findByIdInTenant(tenantId, data.userId);
      if (!user) {
        throw new NotFoundError('Selected user was not found in your account.');
      }

      const existing = await serviceSpecialistRepository.findByUserId(tenantId, data.userId);
      if (existing && existing.id !== id) {
        throw new ConflictError('Selected user is already registered as a service specialist.');
      }
    }

    await serviceSpecialistRepository.updateInTenant(tenantId, id, data);
    return this.getById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.getById(tenantId, id);
    await serviceSpecialistRepository.deleteInTenant(tenantId, id);
  }
}
