/**
 * Auth Service
 * Encapsulates business logic for registering and authenticating users.
 * Uses Sequelize `User` model for persistence.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models';

// Normalize department name to Title Case (e.g., "it" -> "IT", "human resources" -> "Human Resources")
const normalizeDepartment = (department: string): string => {
  if (!department) return '';
  
  const trimmed = department.trim().toLowerCase();
  
  // Common abbreviations that should be all uppercase
  const abbreviations = ['it', 'hr', 'qa', 'ui', 'ux', 'ai', 'ml', 'dev', 'ops', 'devops', 'r&d'];
  
  if (abbreviations.includes(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Title Case for other department names
  return trimmed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Generate employee ID in format EMP001, EMP002, etc.
const generateEmployeeId = async (): Promise<string> => {
  // Get the latest employee by ID (highest number)
  const lastUser = await (User as any).findOne({
    order: [['id', 'DESC']],
  });
  
  let nextNumber = 1;
  if (lastUser && lastUser.employeeId) {
    // Extract number from existing employeeId (e.g., EMP005 -> 5)
    const match = lastUser.employeeId.match(/EMP(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    } else {
      // If format doesn't match, use user id + 1
      nextNumber = lastUser.id + 1;
    }
  } else if (lastUser) {
    nextNumber = lastUser.id + 1;
  }
  
  // Pad with zeros to make it 3 digits minimum
  return `EMP${nextNumber.toString().padStart(3, '0')}`;
};

const register = async (userData: any) => {
  try {
    const { name, email, password, role, department } = userData;
    
    // Check if user already exists
    const existingUser = await (User as any).findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already exists. Please use a different email.');
    }
    
    // Auto-generate employee ID
    const employeeId = await generateEmployeeId();
    
    // Normalize department name (case-insensitive storage)
    const normalizedDepartment = normalizeDepartment(department);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await (User as any).create({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      department: normalizedDepartment,
    });
    return user;
  } catch (error: any) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('Email already exists. Please use a different email.');
    }
    if (error.name === 'SequelizeValidationError') {
      throw new Error(error.errors.map((e: any) => e.message).join(', '));
    }
    throw error;
  }
};

const login = async (email: string, password: string) => {
  const user = await (User as any).findOne({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1h',
  });
  return { token, user };
};

const getMe = async (userId: number) => {
  const user = await (User as any).findByPk(userId);
  return user;
};

export default { register, login, getMe };
