import { TenantRepository } from '../repositories/tenant.repository';
import { NotFoundError } from '../utils/errors';

const tenantRepository = new TenantRepository();

export interface TenantFeatureConfig {
  expiration_control: boolean;
  batch_tracking: boolean;
  recipe_management: boolean;
  tables_layout: boolean;
  specialist_commission: boolean;
}

export class TenantService {
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
