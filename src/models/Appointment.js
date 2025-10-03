const { executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class Appointment {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.barber_id = data.barber_id;
    this.service_id = data.service_id;
    this.appointment_date = data.appointment_date;
    this.status = data.status || 'pending';
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Joined data
    this.client_name = data.client_name;
    this.client_email = data.client_email;
    this.client_phone = data.client_phone;
    this.barber_name = data.barber_name;
    this.service_name = data.service_name;
    this.service_price = data.service_price ? parseFloat(data.service_price) : null;
    this.service_duration = data.service_duration;
  }

  // Create a new appointment
  static async create(appointmentData) {
    const { user_id, barber_id, service_id, appointment_date, notes } = appointmentData;
    
    // Check if the time slot is available
    const isAvailable = await Appointment.isTimeSlotAvailable(barber_id, appointment_date, service_id);
    if (!isAvailable) {
      throw new AppError('The selected time slot is not available', 409);
    }
    
    const query = `
      INSERT INTO appointments (user_id, barber_id, service_id, appointment_date, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [user_id, barber_id, service_id, appointment_date, notes]);
    
    if (result.insertId) {
      return await Appointment.findById(result.insertId);
    }
    
    throw new AppError('Failed to create appointment', 500);
  }

  // Find appointment by ID
  static async findById(id) {
    const query = `
      SELECT 
        a.*,
        u.name as client_name,
        u.email as client_email,
        u.phone as client_phone,
        bu.name as barber_name,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users bu ON b.user_id = bu.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `;
    
    const appointments = await executeQuery(query, [id]);
    
    if (appointments.length > 0) {
      return new Appointment(appointments[0]);
    }
    
    return null;
  }

  // Get all appointments with filters
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      user_id,
      barber_id,
      status,
      start_date,
      end_date,
      sortBy = 'appointment_date',
      sortOrder = 'DESC' 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    
    if (user_id) {
      whereClause += ' AND a.user_id = ?';
      queryParams.push(user_id);
    }
    
    if (barber_id) {
      whereClause += ' AND a.barber_id = ?';
      queryParams.push(barber_id);
    }
    
    if (status) {
      whereClause += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    if (start_date) {
      whereClause += ' AND DATE(a.appointment_date) >= ?';
      queryParams.push(start_date);
    }
    
    if (end_date) {
      whereClause += ' AND DATE(a.appointment_date) <= ?';
      queryParams.push(end_date);
    }
    
    const query = `
      SELECT 
        a.*,
        u.name as client_name,
        u.email as client_email,
        u.phone as client_phone,
        bu.name as barber_name,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users bu ON b.user_id = bu.id
      JOIN services s ON a.service_id = s.id
      ${whereClause}
      ORDER BY a.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    const appointments = await executeQuery(query, queryParams);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users bu ON b.user_id = bu.id
      JOIN services s ON a.service_id = s.id
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    
    return {
      appointments: appointments.map(appointment => new Appointment(appointment)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update appointment
  static async updateById(id, updateData) {
    const allowedFields = ['status', 'appointment_date', 'notes'];
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
    
    // If updating appointment_date, check availability
    if (updateData.appointment_date) {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }
      
      const isAvailable = await Appointment.isTimeSlotAvailable(
        appointment.barber_id, 
        updateData.appointment_date, 
        appointment.service_id,
        id // exclude current appointment
      );
      
      if (!isAvailable) {
        throw new AppError('The selected time slot is not available', 409);
      }
    }
    
    values.push(new Date(), id);
    
    const query = `
      UPDATE appointments 
      SET ${updates.join(', ')}, updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.affectedRows === 0) {
      throw new AppError('Appointment not found or no changes made', 404);
    }
    
    return await Appointment.findById(id);
  }

  // Cancel appointment
  static async cancelById(id) {
    const query = `
      UPDATE appointments 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ? AND status IN ('pending', 'confirmed')
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.affectedRows === 0) {
      throw new AppError('Appointment not found or cannot be cancelled', 404);
    }
    
    return await Appointment.findById(id);
  }

  // Check if time slot is available
  static async isTimeSlotAvailable(barberId, appointmentDate, serviceId, excludeAppointmentId = null) {
    // Get service duration
    const serviceQuery = 'SELECT duration FROM services WHERE id = ?';
    const services = await executeQuery(serviceQuery, [serviceId]);
    
    if (services.length === 0) {
      throw new AppError('Service not found', 404);
    }
    
    const serviceDuration = services[0].duration;
    const appointmentDateTime = new Date(appointmentDate);
    const endDateTime = new Date(appointmentDateTime.getTime() + serviceDuration * 60000);
    
    // Check for conflicting appointments
    let conflictQuery = `
      SELECT COUNT(*) as conflicts
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = ? 
      AND a.status IN ('pending', 'confirmed')
      AND (
        (a.appointment_date < ? AND DATE_ADD(a.appointment_date, INTERVAL s.duration MINUTE) > ?) OR
        (a.appointment_date < ? AND DATE_ADD(a.appointment_date, INTERVAL s.duration MINUTE) > ?) OR
        (a.appointment_date >= ? AND a.appointment_date < ?)
      )
    `;
    
    let queryParams = [
      barberId,
      appointmentDate, appointmentDate,
      endDateTime, endDateTime,
      appointmentDate, endDateTime
    ];
    
    if (excludeAppointmentId) {
      conflictQuery += ' AND a.id != ?';
      queryParams.push(excludeAppointmentId);
    }
    
    const result = await executeQuery(conflictQuery, queryParams);
    
    return result[0].conflicts === 0;
  }

  // Get upcoming appointments
  static async getUpcoming(options = {}) {
    const { limit = 10, user_id, barber_id } = options;
    
    let whereClause = 'WHERE a.appointment_date >= NOW() AND a.status IN (\'pending\', \'confirmed\')';
    let queryParams = [];
    
    if (user_id) {
      whereClause += ' AND a.user_id = ?';
      queryParams.push(user_id);
    }
    
    if (barber_id) {
      whereClause += ' AND a.barber_id = ?';
      queryParams.push(barber_id);
    }
    
    const query = `
      SELECT 
        a.*,
        u.name as client_name,
        u.email as client_email,
        u.phone as client_phone,
        bu.name as barber_name,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users bu ON b.user_id = bu.id
      JOIN services s ON a.service_id = s.id
      ${whereClause}
      ORDER BY a.appointment_date ASC
      LIMIT ?
    `;
    
    queryParams.push(limit);
    
    const appointments = await executeQuery(query, queryParams);
    
    return appointments.map(appointment => new Appointment(appointment));
  }

  // Get appointment statistics
  static async getStats(options = {}) {
    const { user_id, barber_id, start_date, end_date } = options;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    
    if (user_id) {
      whereClause += ' AND user_id = ?';
      queryParams.push(user_id);
    }
    
    if (barber_id) {
      whereClause += ' AND barber_id = ?';
      queryParams.push(barber_id);
    }
    
    if (start_date) {
      whereClause += ' AND DATE(appointment_date) >= ?';
      queryParams.push(start_date);
    }
    
    if (end_date) {
      whereClause += ' AND DATE(appointment_date) <= ?';
      queryParams.push(end_date);
    }
    
    const query = `
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN appointment_date >= NOW() THEN 1 END) as upcoming_appointments
      FROM appointments
      ${whereClause}
    `;
    
    const stats = await executeQuery(query, queryParams);
    
    if (stats.length > 0) {
      return {
        total_appointments: stats[0].total_appointments || 0,
        pending_appointments: stats[0].pending_appointments || 0,
        confirmed_appointments: stats[0].confirmed_appointments || 0,
        completed_appointments: stats[0].completed_appointments || 0,
        cancelled_appointments: stats[0].cancelled_appointments || 0,
        upcoming_appointments: stats[0].upcoming_appointments || 0
      };
    }
    
    return {
      total_appointments: 0,
      pending_appointments: 0,
      confirmed_appointments: 0,
      completed_appointments: 0,
      cancelled_appointments: 0,
      upcoming_appointments: 0
    };
  }

  // Get appointments by date range
  static async getByDateRange(startDate, endDate, options = {}) {
    const { barber_id, status } = options;
    
    let whereClause = 'WHERE DATE(a.appointment_date) BETWEEN ? AND ?';
    let queryParams = [startDate, endDate];
    
    if (barber_id) {
      whereClause += ' AND a.barber_id = ?';
      queryParams.push(barber_id);
    }
    
    if (status) {
      whereClause += ' AND a.status = ?';
      queryParams.push(status);
    }
    
    const query = `
      SELECT 
        a.*,
        u.name as client_name,
        u.email as client_email,
        u.phone as client_phone,
        bu.name as barber_name,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users bu ON b.user_id = bu.id
      JOIN services s ON a.service_id = s.id
      ${whereClause}
      ORDER BY a.appointment_date ASC
    `;
    
    const appointments = await executeQuery(query, queryParams);
    
    return appointments.map(appointment => new Appointment(appointment));
  }

  // Check if appointment can be modified
  canBeModified() {
    const now = new Date();
    const appointmentTime = new Date(this.appointment_date);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Can be modified if it's more than 2 hours away and status is pending or confirmed
    return hoursDiff > 2 && ['pending', 'confirmed'].includes(this.status);
  }

  // Check if appointment can be cancelled
  canBeCancelled() {
    const now = new Date();
    const appointmentTime = new Date(this.appointment_date);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Can be cancelled if it's more than 1 hour away and status is pending or confirmed
    return hoursDiff > 1 && ['pending', 'confirmed'].includes(this.status);
  }

  // Get formatted appointment date
  getFormattedDate() {
    const date = new Date(this.appointment_date);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get formatted appointment time
  getFormattedTime() {
    const date = new Date(this.appointment_date);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get status in Portuguese
  getStatusInPortuguese() {
    const statusMap = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[this.status] || this.status;
  }
}

module.exports = Appointment;
