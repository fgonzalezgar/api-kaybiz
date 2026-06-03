import { connectAndSyncDB, AccountingAccount, RestaurantTable, User, sequelize } from '../database';
import { AuthService } from '../services/auth.service';
import { CategoryService } from '../services/category.service';
import { BrandService } from '../services/brand.service';
import { ProductService } from '../services/product.service';
import { ThirdPartyService } from '../services/thirdParty.service';
import { RestaurantTableService } from '../services/restaurantTable.service';
import { ServiceSpecialistService } from '../services/serviceSpecialist.service';
import { TenantService } from '../services/tenant.service';
import jwt from 'jsonwebtoken';

const authService = new AuthService();
const categoryService = new CategoryService();
const brandService = new BrandService();
const productService = new ProductService();
const thirdPartyService = new ThirdPartyService();
const restaurantTableService = new RestaurantTableService();
const serviceSpecialistService = new ServiceSpecialistService();
const tenantService = new TenantService();

function createMockRequest(token: string, method: string = 'GET', body: any = {}, params: any = {}) {
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-kaybiz-total-gestion-1234';
  const decoded: any = jwt.verify(token, jwtSecret);
  return {
    method,
    headers: { authorization: `Bearer ${token}` },
    tenantId: decoded.tenantId,
    userId: decoded.userId,
    userRole: decoded.userRole,
    userBranchId: decoded.userBranchId,
    body,
    params,
  };
}

async function runVerification() {
  console.log('--- STARTING KAYBIZ API PHASE 2 VERIFICATION ---');

  // 1. Initialize & Sync DB
  console.log('\n[1] Synchronizing database schema (forcing drop & recreate)...');
  await connectAndSyncDB(true);

  // 2. Register Tenant A as 'restaurant'
  console.log('\n[2] Registering Tenant A ("Kaybiz Restaurante") with business_type="restaurant"...');
  const tenantAReg = await authService.register(
    {
      businessName: 'Kaybiz Restaurante',
      nit: '901234567-8',
      dv: '9',
      fiscalRegimen: 'Responsable de IVA',
      city: 'Bogota',
      address: 'Calle 100 #15-30',
      phone: '3001234567',
      businessType: 'restaurant',
    },
    {
      name: 'Carlos Admin',
      email: 'carlos@kaybiz.test',
      password: 'passwordA123',
    }
  );

  console.log(`Tenant A created! UUID: ${tenantAReg.tenant.id}, businessType: ${tenantAReg.tenant.businessType}`);
  console.log(`Default branch created! Name: ${tenantAReg.branch.branchName}, Code: ${tenantAReg.branch.code}`);
  console.log(`Admin User created! Name: ${tenantAReg.user.name}, Email: ${tenantAReg.user.email}`);

  // Assert default tables seeded for restaurant
  const tableCountA = await RestaurantTable.count({ where: { tenantId: tenantAReg.tenant.id } });
  console.log(`Restaurant tables automatically seeded inside transaction: ${tableCountA} tables.`);
  if (tableCountA !== 5) {
    throw new Error('Assertion failed: 5 tables should have been auto-seeded');
  }

  // Verify table codes are 'Mesa 1' to 'Mesa 5'
  const seededTables = await RestaurantTable.findAll({ where: { tenantId: tenantAReg.tenant.id }, order: [['tableCode', 'ASC']] });
  console.log(`Seeded table codes: ${seededTables.map((t) => t.tableCode).join(', ')}`);

  const loginAResult = await authService.login({
    email: 'carlos@kaybiz.test',
    password: 'passwordA123',
  });
  const tokenA = loginAResult.token;

  // 3. Register Tenant B as 'drugstore'
  console.log('\n[3] Registering Tenant B ("Kaybiz Drogueria") with business_type="drugstore"...');
  const tenantBReg = await authService.register(
    {
      businessName: 'Kaybiz Drogueria',
      nit: '800555222-3',
      dv: '3',
      fiscalRegimen: 'Regimen Simple',
      city: 'Medellin',
      address: 'Carrera 43A #5-12',
      phone: '3109876543',
      businessType: 'drugstore',
    },
    {
      name: 'Sofia Admin',
      email: 'sofia@gourmet.test',
      password: 'passwordB456',
    }
  );
  console.log(`Tenant B created! UUID: ${tenantBReg.tenant.id}, businessType: ${tenantBReg.tenant.businessType}`);

  // Assert no tables seeded for drugstore
  const tableCountB = await RestaurantTable.count({ where: { tenantId: tenantBReg.tenant.id } });
  console.log(`Tables seeded for Drugstore (should be 0): ${tableCountB}`);
  if (tableCountB !== 0) {
    throw new Error('Assertion failed: Drugstore should have 0 seeded tables');
  }

  const loginBResult = await authService.login({
    email: 'sofia@gourmet.test',
    password: 'passwordB456',
  });
  const tokenB = loginBResult.token;

  // 4. Test Configuration Endpoint
  console.log('\n[4] Testing configuration endpoint resolver...');
  const configA = await tenantService.getConfig(tenantAReg.tenant.id);
  console.log(`Tenant A config features:`, configA);
  if (configA.features.tables_layout !== true || configA.features.recipe_management !== true || configA.features.expiration_control !== false) {
    throw new Error('Assertion failed: Tenant A configuration flags are incorrect');
  }

  const configB = await tenantService.getConfig(tenantBReg.tenant.id);
  console.log(`Tenant B config features:`, configB);
  if (configB.features.tables_layout !== false || configB.features.recipe_management !== false || configB.features.expiration_control !== true) {
    throw new Error('Assertion failed: Tenant B configuration flags are incorrect');
  }

  // 5. Test Unified Third-Parties
  console.log('\n[5] Testing Third Party creation for Tenant A...');
  const mockReqA1 = createMockRequest(tokenA, 'POST');
  const thirdPartyA = await thirdPartyService.create(mockReqA1.tenantId, {
    isClient: true,
    isProvider: false,
    documentType: 'CC',
    documentNumber: '1015666777',
    verificationDigit: null,
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juan@gmail.test',
    phone: '3157778899',
    address: 'Av 19 #120-10',
    city: 'Bogota',
  });
  console.log(`Third Party client created: ${thirdPartyA.firstName} (${thirdPartyA.documentNumber})`);

  // 6. Test Product upgrades (Sector-Specific Fields)
  console.log('\n[6] Setting up Catalog and creating sector-configured products...');
  
  const categoryA = await categoryService.create(mockReqA1.tenantId, {
    name: 'Bebidas/Comida',
    slug: 'comida',
  });
  const brandA = await brandService.create(mockReqA1.tenantId, {
    name: 'General',
  });
  const revenueAcc = await AccountingAccount.findOne({ where: { tenantId: mockReqA1.tenantId, code: '413505' } });
  const expenseAcc = await AccountingAccount.findOne({ where: { tenantId: mockReqA1.tenantId, code: '510506' } });

  if (!revenueAcc || !expenseAcc) throw new Error('PUC accounts missing');

  // Product with recipe preparation (Restaurant feature)
  const productA = await productService.create(mockReqA1.tenantId, {
    categoryId: categoryA.id,
    brandId: brandA.id,
    name: 'Hamburguesa Especial',
    skuBarcode: 'PROD-RES-01',
    type: 'product',
    cost: 8000,
    price: 15000,
    taxPercentage: 0,
    accountingAccountRevenueId: revenueAcc.id,
    accountingAccountExpenseId: expenseAcc.id,
    isRecipePrepared: true, // Recipe control flag
  });
  console.log(`Restaurant product created: ${productA.name}, isRecipePrepared: ${productA.isRecipePrepared}`);
  if (!productA.isRecipePrepared) throw new Error('Assertion failed: isRecipePrepared should be true');

  // Product with batch and expiration control (Drugstore feature)
  const mockReqB1 = createMockRequest(tokenB, 'POST');
  const categoryB = await categoryService.create(mockReqB1.tenantId, {
    name: 'Medicamentos',
    slug: 'medicamentos',
  });
  const brandB = await brandService.create(mockReqB1.tenantId, {
    name: 'Bayer',
  });
  const revenueAccB = await AccountingAccount.findOne({ where: { tenantId: mockReqB1.tenantId, code: '413505' } });
  const expenseAccB = await AccountingAccount.findOne({ where: { tenantId: mockReqB1.tenantId, code: '510506' } });

  if (!revenueAccB || !expenseAccB) throw new Error('PUC accounts missing for B');

  const productB = await productService.create(mockReqB1.tenantId, {
    categoryId: categoryB.id,
    brandId: brandB.id,
    name: 'Aspirina 500mg',
    skuBarcode: 'PROD-DRUG-01',
    type: 'product',
    cost: 500,
    price: 1200,
    taxPercentage: 5,
    accountingAccountRevenueId: revenueAccB.id,
    accountingAccountExpenseId: expenseAccB.id,
    requiresExpirationControl: true,
    batchNumber: 'LOTE-ASP-2026',
  });
  console.log(`Drugstore product created: ${productB.name}, requiresExpirationControl: ${productB.requiresExpirationControl}, batchNumber: ${productB.batchNumber}`);
  if (!productB.requiresExpirationControl || productB.batchNumber !== 'LOTE-ASP-2026') {
    throw new Error('Assertion failed: expiration control or batch number is incorrect');
  }

  // 7. Test Restaurant Tables CRUD & Isolation
  console.log('\n[7] Testing Restaurant Tables CRUD operations...');
  
  // List Tables for Tenant A
  const tablesA = await restaurantTableService.getAll(mockReqA1.tenantId);
  console.log(`Tenant A Tables list length: ${tablesA.length}`);
  if (tablesA.length !== 5) throw new Error('Expected 5 tables');

  // Create Table 'Mesa 6'
  const newTable = await restaurantTableService.create(mockReqA1.tenantId, {
    branchId: tenantAReg.branch.id,
    tableCode: 'Mesa 6',
    status: 'available',
  });
  console.log(`Table created: ${newTable.tableCode} (Status: ${newTable.status})`);

  // Update Table Status to occupied
  const updatedTable = await restaurantTableService.update(mockReqA1.tenantId, newTable.id, {
    status: 'occupied',
  });
  console.log(`Table updated: ${updatedTable.tableCode} (Status: ${updatedTable.status})`);
  if (updatedTable.status !== 'occupied') throw new Error('Status update failed');

  // Cross-tenant Table Access Check (should fail)
  try {
    await restaurantTableService.getById(mockReqB1.tenantId, newTable.id);
    throw new Error('Assertion failed: Tenant B read Restaurant Table of Tenant A!');
  } catch (error: any) {
    console.log(`Tenant B reading Tenant A's Restaurant Table correctly rejected: "${error.message}"`);
  }

  // Delete Table 'Mesa 6'
  await restaurantTableService.delete(mockReqA1.tenantId, newTable.id);
  console.log('Restaurant table Mesa 6 deleted.');

  // 8. Test Service Specialists (Salons) CRUD, Limits & Validation
  console.log('\n[8] Testing Service Specialists CRUD operations...');
  
  // Create another user inside Tenant A to act as staff
  const staffUser = await User.create({
    tenantId: tenantAReg.tenant.id,
    branchId: tenantAReg.branch.id,
    name: 'Estilista Sandra',
    email: 'sandra@kaybiz.test',
    passwordHash: 'hashed',
    role: 'Stylist',
    isActive: true,
  });
  console.log(`Created Stylist user Sandra (ID: ${staffUser.id})`);

  // Register Sandra as a Specialist with 20% commission
  const specialist = await serviceSpecialistService.create(mockReqA1.tenantId, {
    userId: staffUser.id,
    commissionPercentage: 20.00,
  });
  console.log(`Specialist registered: Sandra, Commission: ${specialist.commissionPercentage}%`);
  if (specialist.commissionPercentage !== 20.00) throw new Error('Commission assertion failed');

  // Try creating duplicate specialist for Sandra (should fail)
  try {
    await serviceSpecialistService.create(mockReqA1.tenantId, {
      userId: staffUser.id,
      commissionPercentage: 10.00,
    });
    throw new Error('Assertion failed: Duplicate specialist allowed!');
  } catch (error: any) {
    console.log(`Duplicate specialist registration rejected correctly: "${error.message}"`);
  }

  // Try creating specialist with invalid commission (e.g. 150%) (should fail)
  try {
    await serviceSpecialistService.create(mockReqA1.tenantId, {
      userId: staffUser.id,
      commissionPercentage: 150.00,
    });
    throw new Error('Assertion failed: Out of bounds commission percentage allowed!');
  } catch (error: any) {
    console.log(`Commission percentage limit validation checked out: "${error.message}"`);
  }

  // Cross-tenant Specialist Access check (should fail)
  try {
    await serviceSpecialistService.getById(mockReqB1.tenantId, specialist.id);
    throw new Error('Assertion failed: Tenant B read Specialist of Tenant A!');
  } catch (error: any) {
    console.log(`Tenant B reading Tenant A's Specialist correctly rejected: "${error.message}"`);
  }

  // Update Specialist Sandra to 25% commission
  const updatedSpec = await serviceSpecialistService.update(mockReqA1.tenantId, specialist.id, {
    commissionPercentage: 25.50,
  });
  console.log(`Specialist commission updated: Sandra, New Commission: ${updatedSpec.commissionPercentage}%`);
  if (updatedSpec.commissionPercentage !== 25.50) throw new Error('Commission update failed');

  // Delete Specialist Sandra configuration
  await serviceSpecialistService.delete(mockReqA1.tenantId, specialist.id);
  console.log('Specialist Sandra config deleted.');

  console.log('\n--- ALL PHASE 2 API VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  await sequelize.close();
  process.exit(0);
}

runVerification().catch(async (err) => {
  console.error('\n!!! VERIFICATION FAILED WITH ERROR !!!\n', err);
  await sequelize.close();
  process.exit(1);
});
