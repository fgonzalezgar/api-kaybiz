import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export type RestaurantTableStatus = 'available' | 'occupied' | 'reserved';

export interface RestaurantTableAttributes {
  id: string;
  tenantId: string;
  branchId: string;
  tableCode: string;
  status: RestaurantTableStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type RestaurantTableCreationAttributes = Omit<
  RestaurantTableAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class RestaurantTable extends Model<RestaurantTableAttributes, RestaurantTableCreationAttributes> implements RestaurantTableAttributes {
  declare id: string;
  declare tenantId: string;
  declare branchId: string;
  declare tableCode: string;
  declare status: RestaurantTableStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

RestaurantTable.init(
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
      allowNull: false,
      field: 'branch_id',
    },
    tableCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'table_code',
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved'),
      defaultValue: 'available',
      allowNull: false,
      field: 'status',
    },
  },
  {
    sequelize,
    tableName: 'restaurant_tables',
    modelName: 'RestaurantTable',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'branch_id', 'table_code'],
        name: 'idx_tables_tenant_branch_code',
      },
    ],
  }
);
