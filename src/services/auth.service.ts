import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../database';
import { TenantRepository } from '../repositories/tenant.repository';
import { BranchRepository } from '../repositories/branch.repository';
import { UserRepository } from '../repositories/user.repository';
import { AccountingAccountRepository } from '../repositories/accountingAccount.repository';
import { RestaurantTableRepository } from '../repositories/restaurantTable.repository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { COLOMBIA_BASE_PUC } from '../utils/puc-colombia';

const tenantRepository = new TenantRepository();
const branchRepository = new BranchRepository();
const userRepository = new UserRepository();
const accountingAccountRepository = new AccountingAccountRepository();
const restaurantTableRepository = new RestaurantTableRepository();

export class AuthService {
  async register(tenantData: {
    businessName: string;
    nit: string;
    dv: string;
    fiscalRegimen: string;
    city: string;
    address: string;
    phone: string;
    businessType: 'generic' | 'restaurant' | 'drugstore' | 'supermarket' | 'salon' | 'hardware_store';
  }, adminData: {
    name: string;
    email: string;
    password: string;
  }) {
    // Check if NIT or Admin Email already exists
    const existingTenant = await tenantRepository.findOne({ nit: tenantData.nit });
    if (existingTenant) {
      throw new ConflictError('A tenant with this NIT Tax ID already exists.');
    }

    const existingUser = await userRepository.findByEmail(adminData.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(now.getDate() + 14); // 14 days trial

    const transaction = await sequelize.transaction();

    try {
      // 1. Create Tenant
      const tenant = await tenantRepository.create({
        ...tenantData,
        trialStartDate: now,
        trialEndDate: trialEndDate,
        isTrialActive: true,
        accountStatus: 'trial',
      }, { transaction });

      // 2. Create Default Branch
      const branch = await branchRepository.create({
        tenantId: tenant.id,
        branchName: 'Sucursal Principal',
        code: '01',
        address: tenantData.address,
        city: tenantData.city,
        phone: tenantData.phone,
        isWarehouse: false,
      }, { transaction });

      // If restaurant business type, seed 5 default tables
      if (tenantData.businessType === 'restaurant') {
        const tableNames = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5'];
        for (const tableCode of tableNames) {
          await restaurantTableRepository.create({
            tenantId: tenant.id,
            branchId: branch.id,
            tableCode,
            status: 'available',
          }, { transaction });
        }
      }

      // 3. Create Admin User
      const passwordHash = await bcrypt.hash(adminData.password, 10);
      const user = await userRepository.create({
        tenantId: tenant.id,
        branchId: branch.id,
        name: adminData.name,
        email: adminData.email,
        passwordHash,
        role: 'Admin',
        isActive: true,
      }, { transaction });

      // 4. Seed Colombia PUC Accounts Matrix
      await accountingAccountRepository.bulkCreateInTenant(
        tenant.id,
        COLOMBIA_BASE_PUC,
        { transaction }
      );

      await transaction.commit();

      // Exclude password hash from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...safeUser } = user.toJSON() as any;

      return {
        tenant,
        branch,
        user: safeUser,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }) {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated.');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-kaybiz-total-gestion-1234';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        userRole: user.role,
        userBranchId: user.branchId,
      },
      jwtSecret,
      { expiresIn: expiresIn as any }
    );

    // Fetch associated branch details if applicable
    let branchCode = null;
    if (user.branchId) {
      const branch = await branchRepository.findById(user.branchId);
      if (branch) {
        branchCode = branch.code;
      }
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        branchId: user.branchId,
        branchCode,
      },
    };
  }
}
