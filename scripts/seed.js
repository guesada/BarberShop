require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  let connection;
  
  try {
    // Conectar ao banco
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'barbershop_auth',
      authPlugins: {
        mysql_native_password: () => () => Buffer.alloc(0)
      }
    });

    logger.info('Conectado ao banco para seed');

    // Verificar se já existem dados
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      logger.info('Banco já possui dados. Seed cancelado.');
      return;
    }

    // Hash para senhas padrão
    const defaultPassword = await bcrypt.hash('123456789', 12);

    // Inserir usuários de exemplo
    const users = [
      {
        name: 'Admin Sistema',
        email: 'admin@elitebarber.com',
        password: defaultPassword,
        user_type: 'admin',
        phone: '(11) 99999-0000'
      },
      {
        name: 'Carlos Mendes',
        email: 'carlos@elitebarber.com',
        password: defaultPassword,
        user_type: 'barbeiro',
        phone: '(11) 99999-0001'
      },
      {
        name: 'Roberto Silva',
        email: 'roberto@elitebarber.com',
        password: defaultPassword,
        user_type: 'barbeiro',
        phone: '(11) 99999-0002'
      },
      {
        name: 'André Costa',
        email: 'andre@elitebarber.com',
        password: defaultPassword,
        user_type: 'barbeiro',
        phone: '(11) 99999-0003'
      },
      {
        name: 'João Cliente',
        email: 'joao@cliente.com',
        password: defaultPassword,
        user_type: 'cliente',
        phone: '(11) 99999-1001'
      },
      {
        name: 'Maria Cliente',
        email: 'maria@cliente.com',
        password: defaultPassword,
        user_type: 'cliente',
        phone: '(11) 99999-1002'
      }
    ];

    const userInsertSql = `
      INSERT INTO users (name, email, password, user_type, phone, email_verified) 
      VALUES (?, ?, ?, ?, ?, TRUE)
    `;

    const userIds = [];
    for (const user of users) {
      const [result] = await connection.execute(userInsertSql, [
        user.name, user.email, user.password, user.user_type, user.phone
      ]);
      userIds.push({ id: result.insertId, ...user });
      logger.info(`Usuário criado: ${user.name} (${user.email})`);
    }

    // Inserir perfis de barbeiros
    const barbers = [
      {
        user_id: userIds.find(u => u.email === 'carlos@elitebarber.com').id,
        specialties: JSON.stringify(['Corte Clássico', 'Barba', 'Bigode']),
        bio: 'Barbeiro experiente com mais de 10 anos no ramo. Especialista em cortes clássicos e modernos.',
        experience_years: 10,
        rating: 4.9,
        total_reviews: 150,
        base_price: 35.00,
        working_hours: JSON.stringify({
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '08:00', end: '17:00' },
          sunday: { closed: true }
        })
      },
      {
        user_id: userIds.find(u => u.email === 'roberto@elitebarber.com').id,
        specialties: JSON.stringify(['Degradê', 'Barba Moderna', 'Sobrancelha']),
        bio: 'Especialista em cortes modernos e degradês. Sempre atualizado com as últimas tendências.',
        experience_years: 8,
        rating: 4.8,
        total_reviews: 120,
        base_price: 40.00,
        working_hours: JSON.stringify({
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: { start: '08:00', end: '16:00' },
          sunday: { closed: true }
        })
      },
      {
        user_id: userIds.find(u => u.email === 'andre@elitebarber.com').id,
        specialties: JSON.stringify(['Corte Social', 'Barba Clássica', 'Tratamentos']),
        bio: 'Focado em cortes sociais e tratamentos capilares. Atendimento personalizado e cuidadoso.',
        experience_years: 6,
        rating: 4.7,
        total_reviews: 95,
        base_price: 30.00,
        working_hours: JSON.stringify({
          monday: { start: '10:00', end: '19:00' },
          tuesday: { start: '10:00', end: '19:00' },
          wednesday: { start: '10:00', end: '19:00' },
          thursday: { start: '10:00', end: '19:00' },
          friday: { start: '10:00', end: '19:00' },
          saturday: { start: '09:00', end: '18:00' },
          sunday: { closed: true }
        })
      }
    ];

    const barberInsertSql = `
      INSERT INTO barbers (user_id, specialties, bio, experience_years, rating, total_reviews, base_price, working_hours) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const barber of barbers) {
      await connection.execute(barberInsertSql, [
        barber.user_id, barber.specialties, barber.bio, barber.experience_years,
        barber.rating, barber.total_reviews, barber.base_price, barber.working_hours
      ]);
    }

    logger.info('Perfis de barbeiros criados');

    // Inserir serviços
    const services = [
      {
        name: 'Corte + Barba',
        description: 'Corte personalizado + acabamento de barba profissional',
        price: 45.00,
        duration: 60,
        category: 'completo'
      },
      {
        name: 'Corte Simples',
        description: 'Corte básico com máquina e tesoura',
        price: 25.00,
        duration: 30,
        category: 'corte'
      },
      {
        name: 'Barba Completa',
        description: 'Aparar, modelar e finalizar a barba',
        price: 20.00,
        duration: 30,
        category: 'barba'
      },
      {
        name: 'Degradê Premium',
        description: 'Degradê moderno com acabamento detalhado',
        price: 35.00,
        duration: 45,
        category: 'corte'
      },
      {
        name: 'Sobrancelha',
        description: 'Design e limpeza de sobrancelha masculina',
        price: 15.00,
        duration: 20,
        category: 'acabamento'
      },
      {
        name: 'Tratamento Capilar',
        description: 'Hidratação e tratamento para cabelo e couro cabeludo',
        price: 30.00,
        duration: 40,
        category: 'tratamento'
      }
    ];

    const serviceInsertSql = `
      INSERT INTO services (name, description, price, duration, category) 
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const service of services) {
      await connection.execute(serviceInsertSql, [
        service.name, service.description, service.price, service.duration, service.category
      ]);
    }

    logger.info('Serviços criados');

    logger.info('Seed concluído com sucesso!');
    logger.info('Usuários criados:');
    logger.info('- Admin: admin@elitebarber.com / 123456789');
    logger.info('- Barbeiros: carlos@elitebarber.com, roberto@elitebarber.com, andre@elitebarber.com / 123456789');
    logger.info('- Clientes: joao@cliente.com, maria@cliente.com / 123456789');

  } catch (error) {
    logger.error('Erro durante o seed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Executar seed se o script for chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
