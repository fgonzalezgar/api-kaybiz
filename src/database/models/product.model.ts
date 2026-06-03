import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export type ProductType = 'product' | 'service';
export type TaxPercentage = 0 | 5 | 19;

export interface ProductAttributes {
  id: string;
  tenantId: string;
  categoryId: string;
  brandId: string;
  name: string;
  skuBarcode: string;
  type: ProductType;
  cost: number;
  price: number;
  taxPercentage: TaxPercentage;
  accountingAccountRevenueId: string;
  accountingAccountExpenseId: string;
  requiresExpirationControl?: boolean;
  batchNumber?: string | null;
  isRecipePrepared?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type ProductCreationAttributes = Omit<
  ProductAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: string;
  declare tenantId: string;
  declare categoryId: string;
  declare brandId: string;
  declare name: string;
  declare skuBarcode: string;
  declare type: ProductType;
  declare cost: number;
  declare price: number;
  declare taxPercentage: TaxPercentage;
  declare accountingAccountRevenueId: string;
  declare accountingAccountExpenseId: string;
  declare requiresExpirationControl: boolean;
  declare batchNumber: string | null;
  declare isRecipePrepared: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

Product.init(
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
    },
    brandId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'brand_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
    skuBarcode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sku_barcode',
    },
    type: {
      type: DataTypes.ENUM('product', 'service'),
      allowNull: false,
      field: 'type',
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('cost');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
      field: 'cost',
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('price');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
      field: 'price',
    },
    taxPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 5, 19]],
      },
      field: 'tax_percentage',
    },
    accountingAccountRevenueId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'accounting_account_revenue_id',
    },
    accountingAccountExpenseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'accounting_account_expense_id',
    },
    requiresExpirationControl: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'requires_expiration_control',
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'batch_number',
    },
    isRecipePrepared: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_recipe_prepared',
    },
  },
  {
    sequelize,
    tableName: 'products_services',
    modelName: 'Product',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'sku_barcode'],
        name: 'idx_products_tenant_sku',
      },
    ],
  }
);
