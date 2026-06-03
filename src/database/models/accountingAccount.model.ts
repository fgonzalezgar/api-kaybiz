import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface AccountingAccountAttributes {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  level: number; // 1 to 4
  allowsMovement: boolean;
  requiresCostCenter: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type AccountingAccountCreationAttributes = Omit<
  AccountingAccountAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class AccountingAccount extends Model<AccountingAccountAttributes, AccountingAccountCreationAttributes> implements AccountingAccountAttributes {
  declare id: string;
  declare tenantId: string;
  declare code: string;
  declare name: string;
  declare type: AccountType;
  declare level: number;
  declare allowsMovement: boolean;
  declare requiresCostCenter: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

AccountingAccount.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'tenant_id',
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'code',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
    type: {
      type: DataTypes.ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
      allowNull: false,
      field: 'type',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4,
      },
      field: 'level',
    },
    allowsMovement: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'allows_movement',
    },
    requiresCostCenter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'requires_cost_center',
    },
  },
  {
    sequelize,
    tableName: 'accounting_accounts',
    modelName: 'AccountingAccount',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'code'],
        name: 'idx_accounting_accounts_tenant_code',
      },
    ],
  }
);
