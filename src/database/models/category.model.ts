import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export interface CategoryAttributes {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type CategoryCreationAttributes = Omit<
  CategoryAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: string;
  declare tenantId: string;
  declare name: string;
  declare slug: string;
  declare parentId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

Category.init(
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'slug',
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
    },
  },
  {
    sequelize,
    tableName: 'categories',
    modelName: 'Category',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'slug'],
        name: 'idx_categories_tenant_slug',
      },
    ],
  }
);
