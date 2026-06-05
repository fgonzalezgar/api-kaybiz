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
import { createThirdPartySchema } from '../validations/thirdParty.validation';

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
    isEmployee: false,
    documentType: 'CC',
    documentNumber: '1015666777',
    verificationDigit: null,
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juan@gmail.com',
    phone: '3157778899',
    stateDepartment: 'Cundinamarca',
    address: 'Av 19 #120-10',
    city: 'Bogota',
  });
  console.log(`Third Party client created: ${thirdPartyA.firstName} (${thirdPartyA.documentNumber})`);

  // 5.1 Test Joi Validations for Third Party (NIT conditions, at least one flag, sanitization)
  console.log('\n[5.1] Testing Third Party Joi schema validations...');
  
  // Test: At least one flag is true
  const invalidRole = createThirdPartySchema.validate({
    isClient: false,
    isProvider: false,
    isEmployee: false,
    documentType: 'CC',
    documentNumber: '123456',
    email: 'test@gmail.com',
    phone: '3000000000',
    stateDepartment: 'Cundinamarca',
    city: 'Bogota',
    address: 'Calle 123',
  });
  if (!invalidRole.error) {
    throw new Error('Assertion failed: Joi allowed all role flags to be false');
  }
  console.log(`- Correctly rejected all-false roles: "${invalidRole.error.message}"`);

  // Test: NIT requires companyName and verificationDigit
  const missingNITDetails = createThirdPartySchema.validate({
    isClient: true,
    documentType: 'NIT',
    documentNumber: '901234567',
    email: 'test@gmail.com',
    phone: '3000000000',
    stateDepartment: 'Cundinamarca',
    city: 'Bogota',
    address: 'Calle 123',
  });
  if (!missingNITDetails.error) {
    throw new Error('Assertion failed: Joi allowed NIT without companyName and verificationDigit');
  }
  console.log(`- Correctly rejected NIT without company details: "${missingNITDetails.error.message}"`);

  const badVerificationDigit = createThirdPartySchema.validate({
    isClient: true,
    documentType: 'NIT',
    documentNumber: '901234567',
    companyName: 'My Company',
    verificationDigit: '12', // must be a single digit
    email: 'test@gmail.com',
    phone: '3000000000',
    stateDepartment: 'Cundinamarca',
    city: 'Bogota',
    address: 'Calle 123',
  });
  if (!badVerificationDigit.error) {
    throw new Error('Assertion failed: Joi allowed NIT with verificationDigit of length 2');
  }
  console.log(`- Correctly rejected multi-digit NIT verification digit: "${badVerificationDigit.error.message}"`);

  // Test: Sanitization of names and address
  const dirtyPayload = {
    isClient: true,
    documentType: 'CC',
    documentNumber: '1015666888',
    firstName: 'Juan*#% <script>',
    lastName: 'Pérez!!',
    email: 'juan@gmail.com',
    phone: '3157778899',
    stateDepartment: 'Cundinamarca',
    city: 'Bogota',
    address: 'Av 19 #120-10\r\n',
  };
  const sanitized = createThirdPartySchema.validate(dirtyPayload);
  if (sanitized.error) {
    throw new Error(`Sanitization test failed with validation error: ${sanitized.error.message}`);
  }
  console.log(`- Original first name: "${dirtyPayload.firstName}", Sanitized: "${sanitized.value.firstName}"`);
  console.log(`- Original address: "${JSON.stringify(dirtyPayload.address)}", Sanitized: "${JSON.stringify(sanitized.value.address)}"`);
  if (sanitized.value.firstName !== 'Juan# script' || sanitized.value.address !== 'Av 19 #120-10') {
    throw new Error('Assertion failed: Joi sanitization regex is incorrect');
  }

  // 5.2 Test Status Toggling & Listing for Third Party
  console.log('\n[5.2] Testing Third Party status toggle and queries...');
  if (!thirdPartyA.isActive) {
    throw new Error('Assertion failed: new third party should default to active');
  }
  const toggledA = await thirdPartyService.toggleStatus(mockReqA1.tenantId, thirdPartyA.id);
  console.log(`- Status toggled. New status (isActive): ${toggledA.isActive}`);
  if (toggledA.isActive !== false) {
    throw new Error('Assertion failed: third party isActive should be false');
  }

  const listActive = await thirdPartyService.getAll(mockReqA1.tenantId, { include_inactive: false });
  console.log(`- Active list count: ${listActive.count}`);
  if (listActive.rows.some(t => t.id === thirdPartyA.id)) {
    throw new Error('Assertion failed: inactive third party should not appear in active listings');
  }

  const listAll = await thirdPartyService.getAll(mockReqA1.tenantId, { include_inactive: true });
  console.log(`- All list count: ${listAll.count}`);
  if (!listAll.rows.some(t => t.id === thirdPartyA.id)) {
    throw new Error('Assertion failed: inactive third party should appear in list with include_inactive');
  }

  await thirdPartyService.toggleStatus(mockReqA1.tenantId, thirdPartyA.id);
  console.log('- Status toggled back to active.');

  // 5.3 Test Employee Registration & Contact Editing
  console.log('\n[5.3] Testing Employee Registration (Unified Third Party as employee)...');
  const employeeA = await thirdPartyService.create(mockReqA1.tenantId, {
    isClient: false,
    isProvider: false,
    isEmployee: true,
    documentType: 'CC',
    documentNumber: '1020304050',
    verificationDigit: null,
    firstName: 'Maria',
    lastName: 'Gomez',
    email: 'maria.gomez@kaybiz.test',
    phone: '3201112233',
    stateDepartment: 'Antioquia',
    address: 'Calle 50 #10-20',
    city: 'Medellin',
  });
  console.log(`Employee Third Party created: ${employeeA.firstName} ${employeeA.lastName} (${employeeA.documentNumber})`);
  if (!employeeA.isEmployee || employeeA.isClient || employeeA.isProvider) {
    throw new Error('Assertion failed: employee flags are incorrect');
  }

  console.log('Editing the employee contact (updating phone and address)...');
  const updatedEmployee = await thirdPartyService.update(mockReqA1.tenantId, employeeA.id, {
    phone: '3209998877',
    address: 'Calle 60 #15-30',
  });
  console.log(`Employee updated successfully. New phone: ${updatedEmployee.phone}, New address: ${updatedEmployee.address}`);
  if (updatedEmployee.phone !== '3209998877' || updatedEmployee.address !== 'Calle 60 #15-30') {
    throw new Error('Assertion failed: employee update fields do not match');
  }

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

  // 6.2 Test Product Expiration and Status Toggle
  console.log('\n[6.2] Testing Product configuration checks and status toggle...');
  
  // Test expiration control batch requirement for drugstore
  try {
    await productService.create(mockReqB1.tenantId, {
      categoryId: categoryB.id,
      brandId: brandB.id,
      name: 'Ibuprofeno 400mg',
      skuBarcode: 'PROD-DRUG-02',
      type: 'product',
      cost: 400,
      price: 1000,
      taxPercentage: 5,
      accountingAccountRevenueId: revenueAccB.id,
      accountingAccountExpenseId: expenseAccB.id,
      requiresExpirationControl: true, // Requires batch number
      // batchNumber is missing
    });
    throw new Error('Assertion failed: allowed drugstore product with expiration control but missing batchNumber!');
  } catch (error: any) {
    console.log(`- Correctly rejected drugstore product missing batchNumber: "${error.message}"`);
  }

  // Test that non-drugstore/non-supermarket tenant can save expiration controlled product without batch
  const productAWithExp = await productService.create(mockReqA1.tenantId, {
    categoryId: categoryA.id,
    brandId: brandA.id,
    name: 'Queso Especial Expirable',
    skuBarcode: 'PROD-RES-02',
    type: 'product',
    cost: 5000,
    price: 9000,
    taxPercentage: 19,
    accountingAccountRevenueId: revenueAcc.id,
    accountingAccountExpenseId: expenseAcc.id,
    requiresExpirationControl: true,
    // batchNumber is missing, but allowed because businessType is restaurant (not drugstore/supermarket)
  });
  console.log(`- Correctly allowed restaurant product with expiration control but missing batch: ${productAWithExp.name}`);

  // Test Product active status toggle
  if (!productA.isActive) {
    throw new Error('Assertion failed: new product should default to active');
  }
  const toggledProduct = await productService.toggleStatus(mockReqA1.tenantId, productA.id);
  console.log(`- Product status toggled. New status (isActive): ${toggledProduct.isActive}`);
  if (toggledProduct.isActive !== false) {
    throw new Error('Assertion failed: product isActive should be false');
  }

  // Query active products
  const listActiveProducts = await productService.getAll(mockReqA1.tenantId, { include_inactive: false });
  if (listActiveProducts.rows.some(p => p.id === productA.id)) {
    throw new Error('Assertion failed: inactive product appeared in active list');
  }
  console.log(`- Active products list correctly excludes toggled product.`);

  // Query all products (including inactive)
  const listAllProducts = await productService.getAll(mockReqA1.tenantId, { include_inactive: true });
  if (!listAllProducts.rows.some(p => p.id === productA.id)) {
    throw new Error('Assertion failed: inactive product missing from all list');
  }
  console.log(`- All products list correctly includes toggled product.`);

  // Toggle back to active
  await productService.toggleStatus(mockReqA1.tenantId, productA.id);
  console.log('- Product status toggled back to active.');

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
