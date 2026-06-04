import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export interface BranchAttributes {
  id: string;
  tenantId: string;
  branchName: string;
  code: string;
  address: string;
  department: string;
  city: string;
  phone: string;
  isWarehouse: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type BranchCreationAttributes = Omit<
  BranchAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Branch extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  declare id: string;
  declare tenantId: string;
  declare branchName: string;
  declare code: string;
  declare address: string;
  declare department: string;
  declare city: string;
  declare phone: string;
  declare isWarehouse: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

Branch.init(
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
    branchName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'branch_name',
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'code',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'address',
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phone',
    },
    isWarehouse: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_warehouse',
    },
  },
  {
    sequelize,
    tableName: 'branches',
    modelName: 'Branch',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'code'],
        name: 'idx_branches_tenant_code',
      },
    ],
  }
);
