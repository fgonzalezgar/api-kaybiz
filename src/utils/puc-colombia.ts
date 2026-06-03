export interface RawPucAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  level: number;
  allowsMovement: boolean;
  requiresCostCenter: boolean;
}

export const COLOMBIA_BASE_PUC: RawPucAccount[] = [
  // Class 1: Activos
  { code: '1', name: 'Activo', type: 'Asset', level: 1, allowsMovement: false, requiresCostCenter: false },
  { code: '11', name: 'Disponible', type: 'Asset', level: 2, allowsMovement: false, requiresCostCenter: false },
  { code: '1105', name: 'Caja', type: 'Asset', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '110505', name: 'Caja General', type: 'Asset', level: 4, allowsMovement: true, requiresCostCenter: false },
  { code: '1110', name: 'Bancos', type: 'Asset', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '111005', name: 'Bancos Nacionales', type: 'Asset', level: 4, allowsMovement: true, requiresCostCenter: false },
  { code: '13', name: 'Deudores', type: 'Asset', level: 2, allowsMovement: false, requiresCostCenter: false },
  { code: '1305', name: 'Clientes', type: 'Asset', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '130505', name: 'Clientes Nacionales (Cuentas por Cobrar)', type: 'Asset', level: 4, allowsMovement: true, requiresCostCenter: false },
  
  // Class 2: Pasivos
  { code: '2', name: 'Pasivo', type: 'Liability', level: 1, allowsMovement: false, requiresCostCenter: false },
  { code: '22', name: 'Proveedores', type: 'Liability', level: 2, allowsMovement: false, requiresCostCenter: false },
  { code: '2205', name: 'Proveedores Nacionales', type: 'Liability', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '220505', name: 'Proveedores Nacionales Locales', type: 'Liability', level: 4, allowsMovement: true, requiresCostCenter: false },
  
  // Class 3: Patrimonio
  { code: '3', name: 'Patrimonio', type: 'Equity', level: 1, allowsMovement: false, requiresCostCenter: false },
  { code: '31', name: 'Capital Social', type: 'Equity', level: 2, allowsMovement: false, requiresCostCenter: false },
  { code: '3115', name: 'Aportes Sociales', type: 'Equity', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '311505', name: 'Aportes de Socios', type: 'Equity', level: 4, allowsMovement: true, requiresCostCenter: false },

  // Class 4: Ingresos
  { code: '4', name: 'Ingresos', type: 'Revenue', level: 1, allowsMovement: false, requiresCostCenter: false },
  { code: '41', name: 'Operacionales', type: 'Revenue', level: 2, allowsMovement: false, requiresCostCenter: false },
  { code: '4135', name: 'Comercio al por Mayor y al por Menor', type: 'Revenue', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '413505', name: 'Venta de Productos / Mercancías', type: 'Revenue', level: 4, allowsMovement: true, requiresCostCenter: true },
  { code: '413510', name: 'Venta de Servicios / Actividades', type: 'Revenue', level: 4, allowsMovement: true, requiresCostCenter: true },

  // Class 5: Gastos
  { code: '5', name: 'Gastos', type: 'Expense', level: 1, allowsMovement: false, requiresCostCenter: false },
  { code: '51', name: 'Operacionales de Administración', type: 'Expense', level: 2, allowsMovement: false, requiresCostCenter: false },
  { code: '5105', name: 'Gastos de Personal', type: 'Expense', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '510506', name: 'Sueldos', type: 'Expense', level: 4, allowsMovement: true, requiresCostCenter: true },
  { code: '5135', name: 'Servicios', type: 'Expense', level: 3, allowsMovement: false, requiresCostCenter: false },
  { code: '513550', name: 'Transporte, Fletes y Acarreos', type: 'Expense', level: 4, allowsMovement: true, requiresCostCenter: true },
];
