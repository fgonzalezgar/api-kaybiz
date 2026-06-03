import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export interface BrandAttributes {
  id: string;
  tenantId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type BrandCreationAttributes = Omit<
  BrandAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Brand extends Model<BrandAttributes, BrandCreationAttributes> implements BrandAttributes {
  declare id: string;
  declare tenantId: string;
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

Brand.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
  },
  {
    sequelize,
    tableName: 'brands',
    modelName: 'Brand',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'name'],
        name: 'idx_brands_tenant_name',
      },
    ],
  }
);
