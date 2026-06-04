import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export interface TenantAttributes {
  id: string;
  businessName: string;
  nit: string;
  dv: string;
  fiscalRegimen: string;
  department: string;
  city: string;
  address: string;
  phone: string;
  trialStartDate: Date;
  trialEndDate: Date;
  isTrialActive: boolean;
  accountStatus: 'trial' | 'active' | 'suspended';
  businessType: 'generic' | 'restaurant' | 'drugstore' | 'supermarket' | 'salon' | 'hardware_store';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type TenantCreationAttributes = Omit<
  TenantAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Tenant extends Model<TenantAttributes, TenantCreationAttributes> implements TenantAttributes {
  declare id: string;
  declare businessName: string;
  declare nit: string;
  declare dv: string;
  declare fiscalRegimen: string;
  declare department: string;
  declare city: string;
  declare address: string;
  declare phone: string;
  declare trialStartDate: Date;
  declare trialEndDate: Date;
  declare isTrialActive: boolean;
  declare accountStatus: 'trial' | 'active' | 'suspended';
  declare businessType: 'generic' | 'restaurant' | 'drugstore' | 'supermarket' | 'salon' | 'hardware_store';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'business_name',
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'nit',
    },
    dv: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: 'dv',
    },
    fiscalRegimen: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'fiscal_regimen',
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Cundinamarca',
      field: 'department',
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'city',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'address',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phone',
    },
    trialStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'trial_start_date',
    },
    trialEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'trial_end_date',
    },
    isTrialActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_trial_active',
    },
    accountStatus: {
      type: DataTypes.ENUM('trial', 'active', 'suspended'),
      defaultValue: 'trial',
      allowNull: false,
      field: 'account_status',
    },
    businessType: {
      type: DataTypes.ENUM('generic', 'restaurant', 'drugstore', 'supermarket', 'salon', 'hardware_store'),
      defaultValue: 'generic',
      allowNull: false,
      field: 'business_type',
    },
  },
  {
    sequelize,
    tableName: 'tenants',
    modelName: 'Tenant',
    paranoid: true,
  }
);
