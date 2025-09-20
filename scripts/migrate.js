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
      password: process.env.DB_PASSWORD || '2051',
      charset: 'utf8mb4'
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
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        duration INT NOT NULL COMMENT 'Duração em minutos',
        price DECIMAL(10,2) NOT NULL,
        category ENUM('corte', 'barba', 'combo', 'tratamento') DEFAULT 'corte',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_category (category),
        INDEX idx_is_active (is_active),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabela de agendamentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        barber_id INT NOT NULL,
        service_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        total_price DECIMAL(10,2),
        reminder_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        INDEX idx_appointment_date (appointment_date),
        INDEX idx_user_id (user_id),
        INDEX idx_barber_id (barber_id),
        INDEX idx_status (status),
        INDEX idx_reminder_sent (reminder_sent)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabela de avaliações
    await connection.execute(`
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
        INDEX idx_appointment_id (appointment_id),
        INDEX idx_client_id (client_id),
        INDEX idx_barber_id (barber_id),
        INDEX idx_rating (rating),
        UNIQUE KEY unique_review (appointment_id, client_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabela de tokens de reset de senha
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Inserir dados iniciais dos serviços
    await connection.execute(`
      INSERT IGNORE INTO services (id, name, description, duration, price, category) VALUES
      (1, 'Corte Clássico', 'Corte tradicional com acabamento profissional', 30, 35.00, 'corte'),
      (2, 'Barba Completa', 'Aparar e modelar barba com produtos premium', 20, 25.00, 'barba'),
      (3, 'Corte + Barba', 'Combo completo: corte e barba', 45, 45.00, 'combo'),
      (4, 'Bigode', 'Aparar e modelar bigode', 15, 15.00, 'barba'),
      (5, 'Tratamento Capilar', 'Hidratação e tratamento do couro cabeludo', 40, 60.00, 'tratamento')
    `);

    logger.info('✅ Dados iniciais dos serviços inseridos');

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
