const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'barbershop_auth',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    logger.error('Database query error:', error.message);
    throw error;
  }
};

// Get database connection
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    logger.error('Failed to get database connection:', error.message);
    throw error;
  }
};

// Initialize database
const initDatabase = async () => {
  try {
    // Test connection first
    await testConnection();
    
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();
    
    logger.info(`📊 Database '${dbConfig.database}' initialized`);
    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  executeQuery,
  getConnection,
  testConnection,
  initDatabase
};
