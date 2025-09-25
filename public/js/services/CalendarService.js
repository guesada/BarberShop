/**
 * Elite Barber Shop - Calendar Service
 * Handles appointment scheduling, availability, and calendar management
 * @version 2.0.0
 */

class CalendarService {
  constructor() {
    this.appointments = [];
    this.availability = new Map();
    this.workingHours = {
      monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      saturday: { start: '08:00', end: '16:00', breaks: [] },
      sunday: { closed: true }
    };
    this.holidays = [];
    this.timeSlotDuration = 30; // minutes
    this.bufferTime = 15; // minutes between appointments
    
    this.init();
  }

  async init() {
    await this.loadAppointments();
    await this.loadAvailability();
    await this.loadHolidays();
    this.generateAvailabilityCache();
    console.log('📅 Calendar Service initialized');
  }

  /**
   * Load appointments from storage
   */
  async loadAppointments() {
    try {
      const stored = localStorage.getItem('appointments');
      this.appointments = stored ? JSON.parse(stored) : [];
      
      // Load from IndexedDB if available
      if (window.storageService) {
        const dbAppointments = await window.storageService.getAppointments();
        if (dbAppointments.length > 0) {
          this.appointments = dbAppointments;
        }
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      this.appointments = [];
    }
  }

  /**
   * Load barber availability
   */
  async loadAvailability() {
    try {
      const stored = localStorage.getItem('barberAvailability');
      if (stored) {
        const availabilityData = JSON.parse(stored);
        this.availability = new Map(Object.entries(availabilityData));
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  }

  /**
   * Load holidays and special dates
   */
  async loadHolidays() {
    try {
      const stored = localStorage.getItem('holidays');
      this.holidays = stored ? JSON.parse(stored) : this.getDefaultHolidays();
    } catch (error) {
      console.error('Failed to load holidays:', error);
      this.holidays = this.getDefaultHolidays();
    }
  }

  /**
   * Get default Brazilian holidays
   */
  getDefaultHolidays() {
    const currentYear = new Date().getFullYear();
    return [
      { date: `${currentYear}-01-01`, name: 'Ano Novo' },
      { date: `${currentYear}-04-21`, name: 'Tiradentes' },
      { date: `${currentYear}-05-01`, name: 'Dia do Trabalhador' },
      { date: `${currentYear}-09-07`, name: 'Independência do Brasil' },
      { date: `${currentYear}-10-12`, name: 'Nossa Senhora Aparecida' },
      { date: `${currentYear}-11-02`, name: 'Finados' },
      { date: `${currentYear}-11-15`, name: 'Proclamação da República' },
      { date: `${currentYear}-12-25`, name: 'Natal' }
    ];
  }

  /**
   * Book appointment
   */
  async bookAppointment(appointmentData) {
    try {
      // Validate appointment data
      this.validateAppointmentData(appointmentData);

      // Check availability
      const isAvailable = await this.checkAvailability(
        appointmentData.barberId,
        appointmentData.date,
        appointmentData.time,
        appointmentData.duration
      );

      if (!isAvailable) {
        throw new Error('Horário não disponível');
      }

      const appointment = {
        id: this.generateAppointmentId(),
        ...appointmentData,
        status: 'confirmed',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.appointments.push(appointment);
      await this.saveAppointments();

      // Update availability cache
      this.updateAvailabilityCache(appointment);

      // Emit appointment booked event
      document.dispatchEvent(new CustomEvent('appointment-booked', {
        detail: appointment
      }));

      return appointment;

    } catch (error) {
      console.error('Failed to book appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, reason = '') {
    try {
      const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
      if (appointmentIndex === -1) {
        throw new Error('Agendamento não encontrado');
      }

      const appointment = this.appointments[appointmentIndex];
      appointment.status = 'cancelled';
      appointment.cancellationReason = reason;
      appointment.cancelledAt = Date.now();
      appointment.updatedAt = Date.now();

      await this.saveAppointments();

      // Update availability cache
      this.updateAvailabilityCache(appointment, true);

      // Emit appointment cancelled event
      document.dispatchEvent(new CustomEvent('appointment-cancelled', {
        detail: { appointment, reason }
      }));

      return appointment;

    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw error;
    }
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId, newDate, newTime) {
    try {
      const appointment = this.appointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        throw new Error('Agendamento não encontrado');
      }

      // Check new slot availability
      const isAvailable = await this.checkAvailability(
        appointment.barberId,
        newDate,
        newTime,
        appointment.duration
      );

      if (!isAvailable) {
        throw new Error('Novo horário não disponível');
      }

      // Store old date/time for history
      appointment.previousSchedule = {
        date: appointment.date,
        time: appointment.time,
        rescheduledAt: Date.now()
      };

      // Update appointment
      appointment.date = newDate;
      appointment.time = newTime;
      appointment.status = 'confirmed';
      appointment.updatedAt = Date.now();

      await this.saveAppointments();

      // Update availability cache
      this.generateAvailabilityCache();

      // Emit appointment rescheduled event
      document.dispatchEvent(new CustomEvent('appointment-rescheduled', {
        detail: appointment
      }));

      return appointment;

    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      throw error;
    }
  }

  /**
   * Check availability for specific date and time
   */
  async checkAvailability(barberId, date, time, duration = 30) {
    try {
      // Check if date is a holiday
      if (this.isHoliday(date)) {
        return false;
      }

      // Check working hours
      if (!this.isWithinWorkingHours(date, time, duration)) {
        return false;
      }

      // Check for existing appointments
      const conflictingAppointments = this.appointments.filter(apt => 
        apt.barberId === barberId &&
        apt.date === date &&
        apt.status !== 'cancelled' &&
        this.hasTimeConflict(apt.time, apt.duration, time, duration)
      );

      return conflictingAppointments.length === 0;

    } catch (error) {
      console.error('Failed to check availability:', error);
      return false;
    }
  }

  /**
   * Get available time slots for a specific date and barber
   */
  async getAvailableSlots(barberId, date) {
    try {
      const dayOfWeek = this.getDayOfWeek(date);
      const workingHours = this.workingHours[dayOfWeek];

      if (workingHours.closed || this.isHoliday(date)) {
        return [];
      }

      const slots = [];
      const startTime = this.parseTime(workingHours.start);
      const endTime = this.parseTime(workingHours.end);

      // Generate all possible slots
      let currentTime = startTime;
      while (currentTime < endTime) {
        const timeString = this.formatTime(currentTime);
        
        // Skip break times
        const isBreakTime = workingHours.breaks.some(breakPeriod => {
          const breakStart = this.parseTime(breakPeriod.start);
          const breakEnd = this.parseTime(breakPeriod.end);
          return currentTime >= breakStart && currentTime < breakEnd;
        });

        if (!isBreakTime) {
          const isAvailable = await this.checkAvailability(
            barberId, 
            date, 
            timeString, 
            this.timeSlotDuration
          );

          if (isAvailable) {
            slots.push({
              time: timeString,
              available: true,
              duration: this.timeSlotDuration
            });
          }
        }

        currentTime += this.timeSlotDuration;
      }

      return slots;

    } catch (error) {
      console.error('Failed to get available slots:', error);
      return [];
    }
  }

  /**
   * Get appointments for a specific date range
   */
  getAppointments(startDate, endDate, filters = {}) {
    let appointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return aptDate >= start && aptDate <= end;
    });

    // Apply filters
    if (filters.barberId) {
      appointments = appointments.filter(apt => apt.barberId === filters.barberId);
    }

    if (filters.status) {
      appointments = appointments.filter(apt => apt.status === filters.status);
    }

    if (filters.customerId) {
      appointments = appointments.filter(apt => apt.customerId === filters.customerId);
    }

    return appointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
  }

  /**
   * Get today's appointments
   */
  getTodayAppointments(barberId = null) {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments(today, today, { barberId });
  }

  /**
   * Get upcoming appointments
   */
  getUpcomingAppointments(customerId = null, limit = 10) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let appointments = this.appointments.filter(apt => {
      if (apt.status === 'cancelled') return false;
      
      const aptDate = new Date(apt.date);
      const aptTime = this.parseTime(apt.time);
      
      // Future dates
      if (aptDate > now) return true;
      
      // Today but future time
      if (apt.date === today && aptTime > currentTime) return true;
      
      return false;
    });

    if (customerId) {
      appointments = appointments.filter(apt => apt.customerId === customerId);
    }

    return appointments
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      })
      .slice(0, limit);
  }

  /**
   * Set barber availability
   */
  async setBarberAvailability(barberId, availability) {
    try {
      this.availability.set(barberId, availability);
      
      // Save to localStorage
      const availabilityObj = Object.fromEntries(this.availability);
      localStorage.setItem('barberAvailability', JSON.stringify(availabilityObj));

      // Regenerate availability cache
      this.generateAvailabilityCache();

      return true;

    } catch (error) {
      console.error('Failed to set barber availability:', error);
      throw error;
    }
  }

  /**
   * Get barber availability
   */
  getBarberAvailability(barberId) {
    return this.availability.get(barberId) || this.workingHours;
  }

  /**
   * Generate calendar view data
   */
  generateCalendarView(year, month, barberId = null) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = {
      year,
      month,
      monthName: firstDay.toLocaleString('pt-BR', { month: 'long' }),
      daysInMonth,
      startingDayOfWeek,
      days: []
    };

    // Generate calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      const dayAppointments = this.getAppointments(dateString, dateString, { barberId });
      
      calendar.days.push({
        day,
        date: dateString,
        dayOfWeek: date.getDay(),
        isToday: dateString === new Date().toISOString().split('T')[0],
        isHoliday: this.isHoliday(dateString),
        appointmentCount: dayAppointments.length,
        appointments: dayAppointments,
        hasAvailability: this.hasDayAvailability(dateString, barberId)
      });
    }

    return calendar;
  }

  /**
   * Get appointment statistics
   */
  getStatistics(startDate, endDate, barberId = null) {
    const appointments = this.getAppointments(startDate, endDate, { barberId });
    
    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      revenue: 0,
      averageRating: 0,
      busyDays: {},
      busyHours: {}
    };

    // Calculate revenue and ratings
    let totalRating = 0;
    let ratedAppointments = 0;

    appointments.forEach(apt => {
      if (apt.price) {
        stats.revenue += apt.price;
      }
      
      if (apt.rating) {
        totalRating += apt.rating;
        ratedAppointments++;
      }

      // Track busy days
      const dayOfWeek = new Date(apt.date).toLocaleDateString('pt-BR', { weekday: 'long' });
      stats.busyDays[dayOfWeek] = (stats.busyDays[dayOfWeek] || 0) + 1;

      // Track busy hours
      const hour = apt.time.split(':')[0] + ':00';
      stats.busyHours[hour] = (stats.busyHours[hour] || 0) + 1;
    });

    stats.averageRating = ratedAppointments > 0 ? totalRating / ratedAppointments : 0;

    return stats;
  }

  // Utility methods
  validateAppointmentData(data) {
    const required = ['barberId', 'customerId', 'date', 'time', 'duration', 'serviceId'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios: ${missing.join(', ')}`);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('Formato de data inválido (YYYY-MM-DD)');
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(data.time)) {
      throw new Error('Formato de hora inválido (HH:MM)');
    }

    // Validate future date
    const appointmentDate = new Date(`${data.date} ${data.time}`);
    if (appointmentDate <= new Date()) {
      throw new Error('Data e hora devem ser no futuro');
    }
  }

  isHoliday(date) {
    return this.holidays.some(holiday => holiday.date === date);
  }

  isWithinWorkingHours(date, time, duration) {
    const dayOfWeek = this.getDayOfWeek(date);
    const workingHours = this.workingHours[dayOfWeek];

    if (workingHours.closed) return false;

    const appointmentStart = this.parseTime(time);
    const appointmentEnd = appointmentStart + duration;
    const workStart = this.parseTime(workingHours.start);
    const workEnd = this.parseTime(workingHours.end);

    // Check if appointment is within working hours
    if (appointmentStart < workStart || appointmentEnd > workEnd) {
      return false;
    }

    // Check if appointment conflicts with break times
    return !workingHours.breaks.some(breakPeriod => {
      const breakStart = this.parseTime(breakPeriod.start);
      const breakEnd = this.parseTime(breakPeriod.end);
      return this.hasTimeConflict(time, duration, this.formatTime(breakStart), breakEnd - breakStart);
    });
  }

  hasTimeConflict(time1, duration1, time2, duration2) {
    const start1 = this.parseTime(time1);
    const end1 = start1 + duration1;
    const start2 = this.parseTime(time2);
    const end2 = start2 + duration2;

    return start1 < end2 && start2 < end1;
  }

  hasDayAvailability(date, barberId) {
    const dayOfWeek = this.getDayOfWeek(date);
    const workingHours = barberId ? 
      this.getBarberAvailability(barberId)[dayOfWeek] : 
      this.workingHours[dayOfWeek];

    return !workingHours.closed && !this.isHoliday(date);
  }

  getDayOfWeek(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
  }

  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  generateAppointmentId() {
    return 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(this.appointments));
    
    if (window.storageService) {
      await window.storageService.saveAppointments(this.appointments);
    }
  }

  generateAvailabilityCache() {
    // Generate cache for next 30 days
    // This would be implemented based on specific needs
    console.log('Availability cache generated');
  }

  updateAvailabilityCache(appointment, removed = false) {
    // Update specific cache entries
    console.log('Availability cache updated for:', appointment.date);
  }
}

// Export for use in other modules
window.CalendarService = CalendarService;
