import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export interface ServiceSpecialistAttributes {
  id: string;
  tenantId: string;
  userId: string;
  commissionPercentage: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type ServiceSpecialistCreationAttributes = Omit<
  ServiceSpecialistAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class ServiceSpecialist extends Model<ServiceSpecialistAttributes, ServiceSpecialistCreationAttributes> implements ServiceSpecialistAttributes {
  declare id: string;
  declare tenantId: string;
  declare userId: string;
  declare commissionPercentage: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

ServiceSpecialist.init(
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    commissionPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('commissionPercentage');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
      field: 'commission_percentage',
    },
  },
  {
    sequelize,
    tableName: 'service_specialists',
    modelName: 'ServiceSpecialist',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'user_id'],
        name: 'idx_specialists_tenant_user',
      },
    ],
  }
);
