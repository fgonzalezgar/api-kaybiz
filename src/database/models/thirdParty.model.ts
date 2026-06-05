import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export type DocumentType = 'NIT' | 'CC' | 'CE' | 'RUT' | 'PP';

export interface ThirdPartyAttributes {
  id: string;
  tenantId: string;
  isClient: boolean;
  isProvider: boolean;
  isEmployee: boolean;
  documentType: DocumentType;
  documentNumber: string;
  verificationDigit: string | null;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  stateDepartment: string;
  city: string;
  address: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type ThirdPartyCreationAttributes = Omit<
  ThirdPartyAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class ThirdParty extends Model<ThirdPartyAttributes, ThirdPartyCreationAttributes> implements ThirdPartyAttributes {
  declare id: string;
  declare tenantId: string;
  declare isClient: boolean;
  declare isProvider: boolean;
  declare isEmployee: boolean;
  declare documentType: DocumentType;
  declare documentNumber: string;
  declare verificationDigit: string | null;
  declare companyName: string | null;
  declare firstName: string | null;
  declare lastName: string | null;
  declare email: string;
  declare phone: string;
  declare stateDepartment: string;
  declare address: string;
  declare city: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

ThirdParty.init(
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
    isClient: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_client',
    },
    isProvider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_provider',
    },
    isEmployee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_employee',
    },
    documentType: {
      type: DataTypes.ENUM('NIT', 'CC', 'CE', 'RUT', 'PP'),
      allowNull: false,
      field: 'document_type',
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'document_number',
    },
    verificationDigit: {
      type: DataTypes.STRING(1),
      allowNull: true,
      field: 'verification_digit',
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'company_name',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'email',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phone',
    },
    stateDepartment: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'state_department',
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'city',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'address',
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
    tableName: 'third_parties',
    modelName: 'ThirdParty',
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'document_number'],
        name: 'idx_third_parties_tenant_doc',
      },
    ],
  }
);
