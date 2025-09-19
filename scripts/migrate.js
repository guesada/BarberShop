require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const createTables = async () => {
  let connection;
  
  try {
    // Conectar ao MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    logger.info('Conectado ao MySQL para migração');

    // Criar banco de dados se não existir
    const dbName = process.env.DB_NAME || 'barbershop_auth';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.execute(`USE \`${dbName}\``);

    logger.info(`Banco de dados '${dbName}' criado/selecionado`);

    // Tabela de usuários
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        user_type ENUM('cliente', 'barbeiro', 'admin') DEFAULT 'cliente',
        phone VARCHAR(20),
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_user_type (user_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Tabela de barbeiros (perfil estendido)
    const createBarbersTable = `
      CREATE TABLE IF NOT EXISTS barbers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        specialties JSON,
        bio TEXT,
        experience_years INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INT DEFAULT 0,
        base_price DECIMAL(10,2) DEFAULT 0.00,
        is_available BOOLEAN DEFAULT TRUE,
        working_hours JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_rating (rating),
        INDEX idx_is_available (is_available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Tabela de serviços
    const createServicesTable = `
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL COMMENT 'Duração em minutos',
        category VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_category (category),
        INDEX idx_is_active (is_active),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Tabela de agendamentos
    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        barber_id INT NOT NULL,
        service_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'agendado',
        total_price DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        
        INDEX idx_client_id (client_id),
        INDEX idx_barber_id (barber_id),
        INDEX idx_appointment_date (appointment_date),
        INDEX idx_status (status),
        INDEX idx_appointment_datetime (appointment_date, appointment_time),
        
        UNIQUE KEY unique_appointment (barber_id, appointment_date, appointment_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Tabela de avaliações
    const createReviewsTable = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        client_id INT NOT NULL,
        barber_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_barber_id (barber_id),
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at),
        
        UNIQUE KEY unique_review (appointment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Tabela de tokens de reset de senha
    const createPasswordResetTokensTable = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Executar as migrações
    const tables = [
      { name: 'users', sql: createUsersTable },
      { name: 'barbers', sql: createBarbersTable },
      { name: 'services', sql: createServicesTable },
      { name: 'appointments', sql: createAppointmentsTable },
      { name: 'reviews', sql: createReviewsTable },
      { name: 'password_reset_tokens', sql: createPasswordResetTokensTable }
    ];

    for (const table of tables) {
      await connection.execute(table.sql);
      logger.info(`Tabela '${table.name}' criada/atualizada com sucesso`);
    }

    logger.info('Migração concluída com sucesso!');

  } catch (error) {
    logger.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Executar migração se o script for chamado diretamente
if (require.main === module) {
  createTables();
}

module.exports = createTables;
