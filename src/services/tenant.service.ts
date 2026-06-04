import { TenantRepository } from '../repositories/tenant.repository';
import { NotFoundError, ConflictError } from '../utils/errors';

const tenantRepository = new TenantRepository();

export interface TenantFeatureConfig {
  expiration_control: boolean;
  batch_tracking: boolean;
  recipe_management: boolean;
  tables_layout: boolean;
  specialist_commission: boolean;
}

export class TenantService {
  async getAll() {
    return tenantRepository.findAll({});
  }

  async getById(id: string) {
    const tenant = await tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant profile not found.');
    }
    return tenant;
  }

  async create(data: {
    businessName: string;
    nit: string;
    dv: string;
    fiscalRegimen?: string;
    city?: string;
    address?: string;
    phone: string;
    businessType: 'generic' | 'restaurant' | 'drugstore' | 'supermarket' | 'salon' | 'hardware_store';
  }) {
    const existingTenant = await tenantRepository.findOne({ nit: data.nit });
    if (existingTenant) {
      throw new ConflictError('A tenant with this NIT Tax ID already exists.');
    }

    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(now.getDate() + 14); // 14 days trial

    const finalAddress = data.address || 'Calle Principal 123';
    const finalCity = data.city || 'Bogotá';
    const finalFiscalRegimen = data.fiscalRegimen || 'Simplificado';

    return tenantRepository.create({
      ...data,
      address: finalAddress,
      city: finalCity,
      fiscalRegimen: finalFiscalRegimen,
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialActive: true,
      accountStatus: 'trial',
    });
  }

  async update(id: string, data: any) {
    await this.getById(id);
    await tenantRepository.update({ id }, data);
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await tenantRepository.delete({ id });
    return { id, deleted: true };
  }

  async getConfig(tenantId: string) {
    const tenant = await tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant profile not found.');
    }

    const businessType = tenant.businessType;
    let features: TenantFeatureConfig = {
      expiration_control: false,
      batch_tracking: false,
      recipe_management: false,
      tables_layout: false,
      specialist_commission: false,
    };

    switch (businessType) {
      case 'restaurant':
        features = {
          expiration_control: false,
          batch_tracking: false,
          recipe_management: true,
          tables_layout: true,
          specialist_commission: false,
        };
        break;
      case 'drugstore':
      case 'supermarket':
        features = {
          expiration_control: true,
          batch_tracking: true,
          recipe_management: false,
          tables_layout: false,
          specialist_commission: false,
        };
        break;
      case 'salon':
        features = {
          expiration_control: false,
          batch_tracking: false,
          recipe_management: false,
          tables_layout: false,
          specialist_commission: true,
        };
        break;
      case 'generic':
      case 'hardware_store':
      default:
        // Keep default false values
        break;
    }

    return {
      business_type: businessType,
      features,
    };
  }
}
