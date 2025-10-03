const { executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Service {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = parseFloat(data.price);
    this.duration = data.duration; // in minutes
    this.category = data.category;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new service
  static async create(serviceData) {
    const { name, description, price, duration, category } = serviceData;
    
    const query = `
      INSERT INTO services (name, description, price, duration, category, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [name, description, price, duration, category]);
    
    if (result.insertId) {
      return await Service.findById(result.insertId);
    }
    
    throw new AppError('Failed to create service', 500);
  }

  // Find service by ID
  static async findById(id) {
    const query = `
      SELECT * FROM services 
      WHERE id = ? AND is_active = 1
    `;
    
    const services = await executeQuery(query, [id]);
    
    if (services.length > 0) {
      return new Service(services[0]);
    }
    
    return null;
  }

  // Get all services with filters
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      min_price = 0, 
      max_price = null,
      search,
      sortBy = 'name',
      sortOrder = 'ASC' 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE is_active = 1';
    let queryParams = [];
    
    if (category) {
      whereClause += ' AND category = ?';
      queryParams.push(category);
    }
    
    if (min_price > 0) {
      whereClause += ' AND price >= ?';
      queryParams.push(min_price);
    }
    
    if (max_price) {
      whereClause += ' AND price <= ?';
      queryParams.push(max_price);
    }
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const query = `
      SELECT * FROM services 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    const services = await executeQuery(query, queryParams);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM services ${whereClause}`;
    const countResult = await executeQuery(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    
    return {
      services: services.map(service => new Service(service)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update service
  static async updateById(id, updateData) {
    const allowedFields = ['name', 'description', 'price', 'duration', 'category', 'is_active'];
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
      UPDATE services 
      SET ${updates.join(', ')}, updated_at = ?
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.affectedRows === 0) {
      throw new AppError('Service not found or no changes made', 404);
    }
    
    return await Service.findById(id);
  }

  // Soft delete service
  static async deleteById(id) {
    const query = `
      UPDATE services 
      SET is_active = 0, updated_at = NOW()
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.affectedRows === 0) {
      throw new AppError('Service not found', 404);
    }
    
    return { message: 'Service deleted successfully' };
  }

  // Get services by category
  static async findByCategory(category, options = {}) {
    const { limit = 10, sortBy = 'price', sortOrder = 'ASC' } = options;
    
    const query = `
      SELECT * FROM services 
      WHERE category = ? AND is_active = 1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ?
    `;
    
    const services = await executeQuery(query, [category, limit]);
    
    return services.map(service => new Service(service));
  }

  // Get popular services (most booked)
  static async getPopularServices(limit = 10) {
    const query = `
      SELECT s.*, COUNT(a.id) as booking_count
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      WHERE s.is_active = 1
      GROUP BY s.id
      ORDER BY booking_count DESC, s.name ASC
      LIMIT ?
    `;
    
    const services = await executeQuery(query, [limit]);
    
    return services.map(service => {
      const serviceObj = new Service(service);
      serviceObj.booking_count = service.booking_count || 0;
      return serviceObj;
    });
  }

  // Get service categories
  static async getCategories() {
    const query = `
      SELECT category, COUNT(*) as service_count, AVG(price) as avg_price
      FROM services 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category ASC
    `;
    
    const categories = await executeQuery(query);
    
    return categories.map(cat => ({
      category: cat.category,
      service_count: cat.service_count,
      avg_price: parseFloat(cat.avg_price) || 0
    }));
  }

  // Get service statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_services,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(duration) as avg_duration
      FROM services
    `;
    
    const stats = await executeQuery(query);
    
    if (stats.length > 0) {
      return {
        total_services: stats[0].total_services || 0,
        active_services: stats[0].active_services || 0,
        avg_price: parseFloat(stats[0].avg_price) || 0,
        min_price: parseFloat(stats[0].min_price) || 0,
        max_price: parseFloat(stats[0].max_price) || 0,
        avg_duration: parseInt(stats[0].avg_duration) || 0
      };
    }
    
    return {
      total_services: 0,
      active_services: 0,
      avg_price: 0,
      min_price: 0,
      max_price: 0,
      avg_duration: 0
    };
  }

  // Search services
  static async search(searchTerm, options = {}) {
    const { limit = 10, category } = options;
    
    let whereClause = 'WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?)';
    let queryParams = [`%${searchTerm}%`, `%${searchTerm}%`];
    
    if (category) {
      whereClause += ' AND category = ?';
      queryParams.push(category);
    }
    
    const query = `
      SELECT * FROM services 
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN name LIKE ? THEN 1
          WHEN description LIKE ? THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT ?
    `;
    
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, limit);
    
    const services = await executeQuery(query, queryParams);
    
    return services.map(service => new Service(service));
  }

  // Get services available for a specific barber
  static async getServicesForBarber(barberId) {
    // In a more complex system, you might have barber-specific services
    // For now, we'll return all active services
    const query = `
      SELECT * FROM services 
      WHERE is_active = 1
      ORDER BY category ASC, name ASC
    `;
    
    const services = await executeQuery(query);
    
    return services.map(service => new Service(service));
  }

  // Check if service is available
  isAvailable() {
    return this.is_active;
  }

  // Get formatted price
  getFormattedPrice() {
    return `R$ ${this.price.toFixed(2).replace('.', ',')}`;
  }

  // Get formatted duration
  getFormattedDuration() {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    
    return `${minutes}min`;
  }
}

module.exports = Service;
