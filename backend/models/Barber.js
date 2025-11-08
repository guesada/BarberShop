const { executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Barber {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.specialties = data.specialties ? JSON.parse(data.specialties) : [];
    this.bio = data.bio;
    this.experience_years = data.experience_years;
    this.rating = parseFloat(data.rating) || 0;
    this.total_reviews = data.total_reviews || 0;
    this.working_hours = data.working_hours ? JSON.parse(data.working_hours) : {};
    this.is_available = data.is_available !== undefined ? data.is_available : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // User data (from JOIN)
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.avatar_url = data.avatar_url;
  }

  // Create barber profile
  static async create(userId, barberData) {
    const { 
      specialties = [], 
      bio, 
      experience_years = 0, 
      working_hours = {} 
    } = barberData;
    
    const query = `
      INSERT INTO barbers (user_id, specialties, bio, experience_years, working_hours, is_available, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      userId,
      JSON.stringify(specialties),
      bio,
      experience_years,
      JSON.stringify(working_hours)
    ]);
    
    if (result.insertId) {
      return await Barber.findById(result.insertId);
    }
    
    throw new AppError('Failed to create barber profile', 500);
  }

  // Find barber by ID
  static async findById(id) {
    const query = `
      SELECT 
        b.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ? AND u.is_active = 1
    `;
    
    const barbers = await executeQuery(query, [id]);
    
    if (barbers.length > 0) {
      return new Barber(barbers[0]);
    }
    
    return null;
  }

  // Find barber by user ID
  static async findByUserId(userId) {
    const query = `
      SELECT 
        b.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = ? AND u.is_active = 1
    `;
    
    const barbers = await executeQuery(query, [userId]);
    
    if (barbers.length > 0) {
      return new Barber(barbers[0]);
    }
    
    return null;
  }

  // Get all barbers with filters
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      specialty, 
      available_only = false, 
      min_rating = 0,
      search,
      sortBy = 'rating',
      sortOrder = 'DESC' 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE u.is_active = 1';
    let queryParams = [];
    
    if (specialty) {
      whereClause += ' AND JSON_CONTAINS(b.specialties, ?)';
      queryParams.push(`"${specialty}"`);
    }
    
    if (available_only) {
      whereClause += ' AND b.is_available = 1';
    }
    
    if (min_rating > 0) {
      whereClause += ' AND b.rating >= ?';
      queryParams.push(min_rating);
    }
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR b.bio LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const query = `
      SELECT 
        b.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    const barbers = await executeQuery(query, queryParams);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    
    return {
      barbers: barbers.map(barber => new Barber(barber)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update barber profile
  static async updateById(id, updateData) {
    const allowedFields = ['specialties', 'bio', 'experience_years', 'working_hours', 'is_available'];
    const updates = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (key === 'specialties' || key === 'working_hours') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          updates.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (updates.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }
    
    values.push(new Date(), id);
    
    const query = `
      UPDATE barbers 
      SET ${updates.join(', ')}, updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.affectedRows === 0) {
      throw new AppError('Barber not found or no changes made', 404);
    }
    
    return await Barber.findById(id);
  }

  // Get barber availability for a specific date
  static async getAvailability(barberId, date) {
    // Get barber's working hours
    const barber = await Barber.findById(barberId);
    if (!barber) {
      throw new AppError('Barber not found', 404);
    }
    
    const dayOfWeek = new Date(date).toLocaleLowerCase().substring(0, 3); // mon, tue, etc.
    const workingHours = barber.working_hours[dayOfWeek];
    
    if (!workingHours || !workingHours.start || !workingHours.end) {
      return { available_slots: [] };
    }
    
    // Get existing appointments for the date
    const appointmentsQuery = `
      SELECT TIME(appointment_date) as appointment_time, duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = ? 
      AND DATE(a.appointment_date) = ?
      AND a.status IN ('confirmed', 'pending')
    `;
    
    const appointments = await executeQuery(appointmentsQuery, [barberId, date]);
    
    // Generate available time slots (simplified logic)
    const slots = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      
      // Check if slot is available (not overlapping with existing appointments)
      const isAvailable = !appointments.some(apt => {
        const aptHour = parseInt(apt.appointment_time.split(':')[0]);
        const aptDuration = apt.duration || 60; // default 60 minutes
        const aptEndHour = aptHour + Math.ceil(aptDuration / 60);
        
        return hour >= aptHour && hour < aptEndHour;
      });
      
      if (isAvailable) {
        slots.push(timeSlot);
      }
    }
    
    return { available_slots: slots };
  }

  // Get barber statistics
  static async getStats(barberId) {
    const query = `
      SELECT 
        COUNT(a.id) as total_appointments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
        AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END) as avg_rating,
        COUNT(r.id) as total_reviews,
        SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END) as total_revenue
      FROM barbers b
      LEFT JOIN appointments a ON b.id = a.barber_id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN reviews r ON a.id = r.appointment_id
      WHERE b.id = ?
      GROUP BY b.id
    `;
    
    const stats = await executeQuery(query, [barberId]);
    
    if (stats.length > 0) {
      return {
        total_appointments: stats[0].total_appointments || 0,
        completed_appointments: stats[0].completed_appointments || 0,
        cancelled_appointments: stats[0].cancelled_appointments || 0,
        avg_rating: parseFloat(stats[0].avg_rating) || 0,
        total_reviews: stats[0].total_reviews || 0,
        total_revenue: parseFloat(stats[0].total_revenue) || 0
      };
    }
    
    return {
      total_appointments: 0,
      completed_appointments: 0,
      cancelled_appointments: 0,
      avg_rating: 0,
      total_reviews: 0,
      total_revenue: 0
    };
  }

  // Update barber rating (called after new review)
  static async updateRating(barberId) {
    const query = `
      UPDATE barbers b
      SET 
        rating = (
          SELECT AVG(r.rating)
          FROM reviews r
          JOIN appointments a ON r.appointment_id = a.id
          WHERE a.barber_id = b.id
        ),
        total_reviews = (
          SELECT COUNT(r.id)
          FROM reviews r
          JOIN appointments a ON r.appointment_id = a.id
          WHERE a.barber_id = b.id
        ),
        updated_at = NOW()
      WHERE b.id = ?
    `;
    
    await executeQuery(query, [barberId]);
  }

  // Get top barbers
  static async getTopBarbers(limit = 10) {
    const query = `
      SELECT 
        b.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE u.is_active = 1 AND b.is_available = 1
      ORDER BY b.rating DESC, b.total_reviews DESC
      LIMIT ?
    `;
    
    const barbers = await executeQuery(query, [limit]);
    
    return barbers.map(barber => new Barber(barber));
  }

  // Get barber's upcoming appointments
  async getUpcomingAppointments(limit = 10) {
    const query = `
      SELECT 
        a.*,
        s.name as service_name,
        s.duration,
        s.price,
        u.name as client_name,
        u.phone as client_phone
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.user_id = u.id
      WHERE a.barber_id = ? 
      AND a.appointment_date >= NOW()
      AND a.status IN ('confirmed', 'pending')
      ORDER BY a.appointment_date ASC
      LIMIT ?
    `;
    
    const appointments = await executeQuery(query, [this.id, limit]);
    
    return appointments;
  }

  // Check if barber is available at specific time
  async isAvailableAt(dateTime) {
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().split(' ')[0];
    
    // Check working hours
    const dayOfWeek = dateTime.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const workingHours = this.working_hours[dayOfWeek];
    
    if (!workingHours || time < workingHours.start || time > workingHours.end) {
      return false;
    }
    
    // Check for conflicting appointments
    const query = `
      SELECT COUNT(*) as conflicts
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = ? 
      AND DATE(a.appointment_date) = ?
      AND a.status IN ('confirmed', 'pending')
      AND (
        TIME(a.appointment_date) <= ? 
        AND TIME(DATE_ADD(a.appointment_date, INTERVAL s.duration MINUTE)) > ?
      )
    `;
    
    const result = await executeQuery(query, [this.id, date, time, time]);
    
    return result[0].conflicts === 0;
  }
}

module.exports = Barber;
