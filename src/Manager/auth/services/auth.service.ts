import { User } from '../../../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class ManagerAuthService {
  async register(userData: any) {
    const { name, email, password, employeeId, department } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
      employeeId,
      department,
    });
    return user;
  }

  async login(credentials: any) {
    const { email, password } = credentials;
    const user = await User.findOne({ where: { email, role: 'manager' } });
    if (!user) {
      throw new Error('Manager not found');
    }
    // @ts-ignore
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign(
        // @ts-ignore
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    return { user, token };
  }
}

export const managerAuthService = new ManagerAuthService();
