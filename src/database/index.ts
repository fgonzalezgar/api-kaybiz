import { sequelize } from '../config/database';
import { Tenant } from './models/tenant.model';
import { Branch } from './models/branch.model';
import { User } from './models/user.model';
import { ThirdParty } from './models/thirdParty.model';
import { Category } from './models/category.model';
import { Brand } from './models/brand.model';
import { Product } from './models/product.model';
import { AccountingAccount } from './models/accountingAccount.model';
import { RestaurantTable } from './models/restaurantTable.model';
import { ServiceSpecialist } from './models/serviceSpecialist.model';

// Re-export models for easier importing
export {
  sequelize,
  Tenant,
  Branch,
  User,
  ThirdParty,
  Category,
  Brand,
  Product,
  AccountingAccount,
  RestaurantTable,
  ServiceSpecialist,
};

export const initAssociations = () => {
  // Tenant <-> Branch
  Tenant.hasMany(Branch, { foreignKey: 'tenant_id', as: 'branches', onDelete: 'CASCADE' });
  Branch.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Tenant <-> User
  Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users', onDelete: 'CASCADE' });
  User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Branch <-> User
  Branch.hasMany(User, { foreignKey: 'branch_id', as: 'users', onDelete: 'SET NULL' });
  User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

  // Tenant <-> ThirdParty
  Tenant.hasMany(ThirdParty, { foreignKey: 'tenant_id', as: 'thirdParties', onDelete: 'CASCADE' });
  ThirdParty.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Tenant <-> Category
  Tenant.hasMany(Category, { foreignKey: 'tenant_id', as: 'categories', onDelete: 'CASCADE' });
  Category.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Category self-reference (parent/subcategory)
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories', onDelete: 'SET NULL' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parentCategory' });

  // Tenant <-> Brand
  Tenant.hasMany(Brand, { foreignKey: 'tenant_id', as: 'brands', onDelete: 'CASCADE' });
  Brand.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Tenant <-> Product
  Tenant.hasMany(Product, { foreignKey: 'tenant_id', as: 'products', onDelete: 'CASCADE' });
  Product.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Category <-> Product
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'RESTRICT' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // Brand <-> Product
  Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products', onDelete: 'RESTRICT' });
  Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

  // AccountingAccount <-> Product (Revenue Account)
  AccountingAccount.hasMany(Product, { foreignKey: 'accounting_account_revenue_id', as: 'revenueProducts', onDelete: 'RESTRICT' });
  Product.belongsTo(AccountingAccount, { foreignKey: 'accounting_account_revenue_id', as: 'revenueAccount' });

  // AccountingAccount <-> Product (Expense Account)
  AccountingAccount.hasMany(Product, { foreignKey: 'accounting_account_expense_id', as: 'expenseProducts', onDelete: 'RESTRICT' });
  Product.belongsTo(AccountingAccount, { foreignKey: 'accounting_account_expense_id', as: 'expenseAccount' });

  // Tenant <-> AccountingAccount
  Tenant.hasMany(AccountingAccount, { foreignKey: 'tenant_id', as: 'accountingAccounts', onDelete: 'CASCADE' });
  AccountingAccount.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Branch <-> RestaurantTable
  Branch.hasMany(RestaurantTable, { foreignKey: 'branch_id', as: 'restaurantTables', onDelete: 'CASCADE' });
  RestaurantTable.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

  // Tenant <-> RestaurantTable
  Tenant.hasMany(RestaurantTable, { foreignKey: 'tenant_id', as: 'restaurantTables', onDelete: 'CASCADE' });
  RestaurantTable.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // User <-> ServiceSpecialist
  User.hasOne(ServiceSpecialist, { foreignKey: 'user_id', as: 'serviceSpecialist', onDelete: 'CASCADE' });
  ServiceSpecialist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Tenant <-> ServiceSpecialist
  Tenant.hasMany(ServiceSpecialist, { foreignKey: 'tenant_id', as: 'serviceSpecialists', onDelete: 'CASCADE' });
  ServiceSpecialist.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
};

export const connectAndSyncDB = async (syncForce = false) => {
  try {
    initAssociations();
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const isDevelopment = process.env.NODE_ENV === 'development';
    await sequelize.sync({ force: syncForce, alter: isDevelopment });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Database connection or synchronization failed:', error);
    throw error;
  }
};
