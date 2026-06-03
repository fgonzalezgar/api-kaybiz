import { BaseRepository } from './base.repository';
import { Tenant } from '../database/models/tenant.model';

export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(Tenant);
  }
}
