const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'client';
    this.phone = data.phone;
    this.avatar_url = data.avatar_url;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.email_verified = data.email_verified || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'client', phone } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (name, email, password, role, phone, is_active, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [name, email, hashedPassword, role, phone]);
    
    if (result.insertId) {
      return await User.findById(result.insertId);
    }
    
    throw new AppError('Failed to create user', 500);
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT id, name, email, role, phone, avatar_url, is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE id = ? AND is_active = 1
    `;
    
    const users = await executeQuery(query, [id]);
    
    if (users.length > 0) {
      return new User(users[0]);
    }
    
    return null;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, role, phone, avatar_url, is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE email = ? AND is_active = 1
    `;
    
    const users = await executeQuery(query, [email]);
    
    if (users.length > 0) {
      return new User(users[0]);
    }
    
    return null;
  }

  // Get all users with pagination
  static async findAll(options = {}) {
    const { page = 1, limit = 10, role, search, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE is_active = 1';
    let queryParams = [];
    
    if (role) {
      whereClause += ' AND role = ?';
      queryParams.push(role);
    }
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const query = `
      SELECT id, name, email, role, phone, avatar_url, is_active, email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    const users = await executeQuery(query, queryParams);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await executeQuery(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    
    return {
      users: users.map(user => new User(user)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update user
  static async updateById(id, updateData) {
    const allowedFields = ['name', 'email', 'phone', 'avatar_url'];
    const updates = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (updates.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }
    
    values.push(new Date(), id);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = ?
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.affectedRows === 0) {
      throw new AppError('User not found or no changes made', 404);
    }
    
    return await User.findById(id);
  }

  // Update password
  static async updatePassword(id, currentPassword, newPassword) {
    // First, get the user with password
    const query = `
      SELECT id, password
      FROM users 
      WHERE id = ? AND is_active = 1
    `;
    
    const users = await executeQuery(query, [id]);
    
    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }
    
    const user = users[0];
    
    // Check current password
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordCorrect) {
      throw new AppError('Current password is incorrect', 400);
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    const updateQuery = `
      UPDATE users 
      SET password = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [hashedNewPassword, id]);
    
    return { message: 'Password updated successfully' };
  }

  // Soft delete user
  static async deleteById(id) {
    const query = `
      UPDATE users 
      SET is_active = 0, updated_at = NOW()
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.affectedRows === 0) {
      throw new AppError('User not found', 404);
    }
    
    return { message: 'User deleted successfully' };
  }

  // Verify password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Get user stats
  static async getUserStats() {
    const query = `
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count,
        COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_count
      FROM users 
      GROUP BY role
    `;
    
    const stats = await executeQuery(query);
    
    return stats;
  }

  // Verify email
  static async verifyEmail(id) {
    const query = `
      UPDATE users 
      SET email_verified = 1, updated_at = NOW()
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.affectedRows === 0) {
      throw new AppError('User not found', 404);
    }
    
    return { message: 'Email verified successfully' };
  }

  // Get user profile (without sensitive data)
  getProfile() {
    const { password, ...profile } = this;
    return profile;
  }

  // Check if user has role
  hasRole(role) {
    return this.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Check if user is barber
  isBarber() {
    return this.role === 'barber';
  }

  // Check if user is client
  isClient() {
    return this.role === 'client';
  }
}

module.exports = User;
