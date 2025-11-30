import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import 'dotenv/config';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASSWORD || 'Jai@123';
const DB_NAME = process.env.DB_NAME || 'Employee_Attendance_System';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

// Enable SSL for production (Render, Supabase, etc.)
const isProduction = process.env.NODE_ENV === 'production' || 
                     DB_HOST.includes('render.com') || 
                     DB_HOST.includes('supabase.co') ||
                     DB_HOST !== 'localhost';

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  employeeId?: string;
  department?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export const User = sequelize.define<Model<UserAttributes, UserCreationAttributes>>('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'employee',
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
  },
  department: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'Users',
  timestamps: true,
});

interface AttendanceAttributes {
  id: number;
  userId: number;
  date?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status?: string;
  totalHours?: number;
}

interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id'> {}

export const Attendance = sequelize.define<Model<AttendanceAttributes, AttendanceCreationAttributes>>('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  checkInTime: {
    type: DataTypes.DATE,
  },
  checkOutTime: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.STRING,
  },
  totalHours: {
    type: DataTypes.FLOAT,
  },
}, {
  tableName: 'Attendances',
  timestamps: true,
});

// Associations
User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

// Export models and sequelize instance for application use
export default { sequelize, User, Attendance };
