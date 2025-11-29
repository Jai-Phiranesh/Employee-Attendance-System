/**
 * Auth Service
 * Encapsulates business logic for registering and authenticating users.
 * Uses Sequelize `User` model for persistence.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models';

const register = async (userData: any) => {
  const { name, email, password, role, employeeId, department } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await (User as any).create({
    name,
    email,
    password: hashedPassword,
    role,
    employeeId,
    department,
  });
  return user;
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
