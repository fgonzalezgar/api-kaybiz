import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export type UserRole = 'Admin' | 'Cashier' | 'Accountant' | 'Waiter' | 'Stylist';

export interface UserAttributes {
  id: string;
  tenantId: string;
  branchId: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type UserCreationAttributes = Omit<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare tenantId: string;
  declare branchId: string | null;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

User.init(
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
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'branch_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'email',
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Cashier', 'Accountant', 'Waiter', 'Stylist'),
      allowNull: false,
      field: 'role',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    paranoid: true,
  }
);
