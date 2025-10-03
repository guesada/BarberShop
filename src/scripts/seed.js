const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const logger = require('../utils/logger');

// Seed data
const seedData = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    // Check if data already exists
    const existingUsers = await executeQuery('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      logger.info('📊 Database already has data. Skipping seed...');
      return;
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Insert admin user
    const adminResult = await executeQuery(`
      INSERT INTO users (name, email, password, role, phone, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['Admin User', 'admin@barbershop.com', hashedPassword, 'admin', '+55 11 99999-9999', 1, 1]);
    logger.info('✅ Admin user created');

    // Insert barber users
    const barberUsers = [
      {
        name: 'João Silva',
        email: 'joao@barbershop.com',
        phone: '+55 11 98888-8888',
        specialties: ['Corte Masculino', 'Barba', 'Bigode'],
        bio: 'Barbeiro profissional com 10 anos de experiência. Especialista em cortes clássicos e modernos.',
        experience_years: 10,
        working_hours: {
          mon: { start: '08:00', end: '18:00' },
          tue: { start: '08:00', end: '18:00' },
          wed: { start: '08:00', end: '18:00' },
          thu: { start: '08:00', end: '18:00' },
          fri: { start: '08:00', end: '18:00' },
          sat: { start: '08:00', end: '16:00' },
          sun: { start: '', end: '' }
        }
      },
      {
        name: 'Pedro Santos',
        email: 'pedro@barbershop.com',
        phone: '+55 11 97777-7777',
        specialties: ['Corte Moderno', 'Barba', 'Sobrancelha'],
        bio: 'Barbeiro especializado em cortes modernos e tendências. Atendimento personalizado para cada cliente.',
        experience_years: 7,
        working_hours: {
          mon: { start: '09:00', end: '19:00' },
          tue: { start: '09:00', end: '19:00' },
          wed: { start: '09:00', end: '19:00' },
          thu: { start: '09:00', end: '19:00' },
          fri: { start: '09:00', end: '19:00' },
          sat: { start: '09:00', end: '17:00' },
          sun: { start: '', end: '' }
        }
      },
      {
        name: 'Carlos Oliveira',
        email: 'carlos@barbershop.com',
        phone: '+55 11 96666-6666',
        specialties: ['Corte Social', 'Barba', 'Tratamentos'],
        bio: 'Barbeiro tradicional com foco em cortes sociais e cuidados com a barba. Mais de 15 anos de experiência.',
        experience_years: 15,
        working_hours: {
          mon: { start: '07:00', end: '17:00' },
          tue: { start: '07:00', end: '17:00' },
          wed: { start: '07:00', end: '17:00' },
          thu: { start: '07:00', end: '17:00' },
          fri: { start: '07:00', end: '17:00' },
          sat: { start: '07:00', end: '15:00' },
          sun: { start: '', end: '' }
        }
      }
    ];

    const barberIds = [];
    for (const barber of barberUsers) {
      // Insert user
      const userResult = await executeQuery(`
        INSERT INTO users (name, email, password, role, phone, is_active, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [barber.name, barber.email, hashedPassword, 'barber', barber.phone, 1, 1]);

      // Insert barber profile
      const barberResult = await executeQuery(`
        INSERT INTO barbers (user_id, specialties, bio, experience_years, working_hours, is_available)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userResult.insertId,
        JSON.stringify(barber.specialties),
        barber.bio,
        barber.experience_years,
        JSON.stringify(barber.working_hours),
        1
      ]);

      barberIds.push(barberResult.insertId);
    }
    logger.info('✅ Barber users and profiles created');

    // Insert client users
    const clientUsers = [
      { name: 'Maria Silva', email: 'maria@cliente.com', phone: '+55 11 95555-5555' },
      { name: 'José Santos', email: 'jose@cliente.com', phone: '+55 11 94444-4444' },
      { name: 'Ana Costa', email: 'ana@cliente.com', phone: '+55 11 93333-3333' },
      { name: 'Roberto Lima', email: 'roberto@cliente.com', phone: '+55 11 92222-2222' },
      { name: 'Fernanda Oliveira', email: 'fernanda@cliente.com', phone: '+55 11 91111-1111' }
    ];

    const clientIds = [];
    for (const client of clientUsers) {
      const result = await executeQuery(`
        INSERT INTO users (name, email, password, role, phone, is_active, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [client.name, client.email, hashedPassword, 'client', client.phone, 1, 1]);
      
      clientIds.push(result.insertId);
    }
    logger.info('✅ Client users created');

    // Insert services
    const services = [
      { name: 'Corte Masculino', description: 'Corte de cabelo masculino tradicional', price: 25.00, duration: 30, category: 'Corte' },
      { name: 'Corte + Barba', description: 'Corte de cabelo + barba completa', price: 40.00, duration: 45, category: 'Combo' },
      { name: 'Barba', description: 'Aparar e modelar barba', price: 20.00, duration: 20, category: 'Barba' },
      { name: 'Bigode', description: 'Aparar e modelar bigode', price: 15.00, duration: 15, category: 'Barba' },
      { name: 'Sobrancelha', description: 'Aparar sobrancelha masculina', price: 10.00, duration: 10, category: 'Estética' },
      { name: 'Corte Social', description: 'Corte social para trabalho', price: 30.00, duration: 35, category: 'Corte' },
      { name: 'Corte Moderno', description: 'Corte moderno e estiloso', price: 35.00, duration: 40, category: 'Corte' },
      { name: 'Tratamento Capilar', description: 'Tratamento para couro cabeludo', price: 50.00, duration: 60, category: 'Tratamento' },
      { name: 'Lavagem + Corte', description: 'Lavagem completa + corte', price: 35.00, duration: 45, category: 'Combo' },
      { name: 'Corte Infantil', description: 'Corte especial para crianças', price: 20.00, duration: 25, category: 'Corte' }
    ];

    const serviceIds = [];
    for (const service of services) {
      const result = await executeQuery(`
        INSERT INTO services (name, description, price, duration, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [service.name, service.description, service.price, service.duration, service.category, 1]);
      
      serviceIds.push(result.insertId);
    }
    logger.info('✅ Services created');

    // Insert sample appointments
    const appointments = [
      {
        user_id: clientIds[0],
        barber_id: barberIds[0],
        service_id: serviceIds[0],
        appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'confirmed',
        notes: 'Cliente preferencial, corte usual'
      },
      {
        user_id: clientIds[1],
        barber_id: barberIds[1],
        service_id: serviceIds[1],
        appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        status: 'pending',
        notes: 'Primeiro agendamento'
      },
      {
        user_id: clientIds[2],
        barber_id: barberIds[2],
        service_id: serviceIds[2],
        appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'confirmed',
        notes: 'Barba bem aparada'
      },
      {
        user_id: clientIds[0],
        barber_id: barberIds[0],
        service_id: serviceIds[1],
        appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        status: 'completed',
        notes: 'Serviço realizado com sucesso'
      },
      {
        user_id: clientIds[3],
        barber_id: barberIds[1],
        service_id: serviceIds[3],
        appointment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'pending',
        notes: 'Bigode estilo vintage'
      }
    ];

    for (const appointment of appointments) {
      await executeQuery(`
        INSERT INTO appointments (user_id, barber_id, service_id, appointment_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        appointment.user_id,
        appointment.barber_id,
        appointment.service_id,
        appointment.appointment_date,
        appointment.status,
        appointment.notes
      ]);
    }
    logger.info('✅ Sample appointments created');

    // Insert sample reviews
    const reviews = [
      {
        appointment_id: 4, // Completed appointment
        user_id: clientIds[0],
        barber_id: barberIds[0],
        rating: 5,
        comment: 'Excelente serviço! João é muito profissional e atencioso.'
      }
    ];

    for (const review of reviews) {
      await executeQuery(`
        INSERT INTO reviews (appointment_id, user_id, barber_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [review.appointment_id, review.user_id, review.barber_id, review.rating, review.comment]);
    }
    logger.info('✅ Sample reviews created');

    // Update barber ratings based on reviews
    for (const barberId of barberIds) {
      await executeQuery(`
        UPDATE barbers b
        SET 
          rating = COALESCE((
            SELECT AVG(r.rating)
            FROM reviews r
            WHERE r.barber_id = b.id
          ), 0),
          total_reviews = COALESCE((
            SELECT COUNT(r.id)
            FROM reviews r
            WHERE r.barber_id = b.id
          ), 0)
        WHERE b.id = ?
      `, [barberId]);
    }
    logger.info('✅ Barber ratings updated');

    // Insert sample favorites
    const favorites = [
      { user_id: clientIds[0], barber_id: barberIds[0] },
      { user_id: clientIds[0], barber_id: barberIds[1] },
      { user_id: clientIds[1], barber_id: barberIds[0] },
      { user_id: clientIds[2], barber_id: barberIds[2] }
    ];

    for (const favorite of favorites) {
      await executeQuery(`
        INSERT INTO favorites (user_id, barber_id)
        VALUES (?, ?)
      `, [favorite.user_id, favorite.barber_id]);
    }
    logger.info('✅ Sample favorites created');

    logger.info('🎉 Database seeding completed successfully!');
    
    // Display sample credentials
    logger.info('\n📋 Sample Credentials:');
    logger.info('👨‍💼 Admin: admin@barbershop.com / 123456');
    logger.info('✂️  Barber: joao@barbershop.com / 123456');
    logger.info('✂️  Barber: pedro@barbershop.com / 123456');
    logger.info('✂️  Barber: carlos@barbershop.com / 123456');
    logger.info('👤 Client: maria@cliente.com / 123456');
    logger.info('👤 Client: jose@cliente.com / 123456');
    
  } catch (error) {
    logger.error('❌ Database seeding failed:', error.message);
    throw error;
  }
};

// Run seeding
const runSeed = async () => {
  try {
    await seedData();
    logger.info('✅ Database is ready with sample data!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedData, runSeed };
