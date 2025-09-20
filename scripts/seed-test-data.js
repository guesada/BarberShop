require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const logger = require('../utils/logger');

async function seedTestData() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    logger.info('🌱 Iniciando seed de dados de teste...');

    // Criar usuários de teste
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Cliente de teste
    await connection.execute(`
      INSERT IGNORE INTO users (id, name, email, password, user_type, phone) 
      VALUES (1, 'João Silva', 'joao@email.com', ?, 'cliente', '(11) 99999-1111')
    `, [hashedPassword]);
    
    // Barbeiro de teste
    await connection.execute(`
      INSERT IGNORE INTO users (id, name, email, password, user_type, phone) 
      VALUES (2, 'Carlos Mendes', 'carlos@elitebarber.com', ?, 'barbeiro', '(11) 99999-2222')
    `, [hashedPassword]);
    
    // Admin de teste
    await connection.execute(`
      INSERT IGNORE INTO users (id, name, email, password, user_type, phone) 
      VALUES (3, 'Admin Sistema', 'admin@elitebarber.com', ?, 'admin', '(11) 99999-3333')
    `, [hashedPassword]);

    // Inserir barbeiro na tabela barbers
    await connection.execute(`
      INSERT IGNORE INTO barbers (user_id, specialties, bio, experience_years, rating, total_reviews, base_price, working_hours) 
      VALUES (2, '["Corte Clássico", "Barba", "Bigode"]', 'Barbeiro experiente com 10 anos de carreira', 10, 4.9, 150, 35.00, '{"seg": "08:00-18:00", "ter": "08:00-18:00", "qua": "08:00-18:00", "qui": "08:00-18:00", "sex": "08:00-18:00", "sab": "08:00-16:00"}')
    `);

    // Criar agendamentos de teste para amanhã (para testar lembretes)
    const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
    const dayAfterTomorrow = moment().add(2, 'days').format('YYYY-MM-DD');
    
    // Agendamento para amanhã (deve receber lembrete)
    await connection.execute(`
      INSERT IGNORE INTO appointments (id, user_id, barber_id, service_id, appointment_date, appointment_time, status, total_price, reminder_sent) 
      VALUES (1, 1, 2, 1, ?, '14:00:00', 'confirmed', 45.00, FALSE)
    `, [tomorrow]);
    
    // Agendamento para depois de amanhã
    await connection.execute(`
      INSERT IGNORE INTO appointments (id, user_id, barber_id, service_id, appointment_date, appointment_time, status, total_price, reminder_sent) 
      VALUES (2, 1, 2, 2, ?, '16:30:00', 'confirmed', 25.00, FALSE)
    `, [dayAfterTomorrow]);
    
    // Agendamento passado (concluído)
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    await connection.execute(`
      INSERT IGNORE INTO appointments (id, user_id, barber_id, service_id, appointment_date, appointment_time, status, total_price, reminder_sent) 
      VALUES (3, 1, 2, 1, ?, '10:00:00', 'completed', 45.00, TRUE)
    `, [yesterday]);

    logger.info('✅ Dados de teste inseridos com sucesso!');
    logger.info('📋 Usuários criados:');
    logger.info('   👤 Cliente: joao@email.com (senha: 123456)');
    logger.info('   ✂️ Barbeiro: carlos@elitebarber.com (senha: 123456)');
    logger.info('   👑 Admin: admin@elitebarber.com (senha: 123456)');
    logger.info('📅 Agendamentos:');
    logger.info(`   🔔 Agendamento #1: ${tomorrow} 14:00 (deve receber lembrete)`);
    logger.info(`   📅 Agendamento #2: ${dayAfterTomorrow} 16:30`);
    logger.info(`   ✅ Agendamento #3: ${yesterday} 10:00 (concluído)`);

  } catch (error) {
    logger.error('❌ Erro ao inserir dados de teste:', error);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedTestData();
}

module.exports = seedTestData;
