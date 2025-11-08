const Joi = require('joi');
const logger = require('../utils/logger');

// Define schema for required environment variables
const envSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').required(),
    DB_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).required(),
    EMAIL_HOST: Joi.string().hostname().required(),
    EMAIL_USER: Joi.string().email().required(),
    EMAIL_PASSWORD: Joi.string().allow('').required(),
    NOTIFICATION_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
    SCHEDULER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  })
  .unknown();

module.exports = () => {
  const { error, value } = envSchema.validate(process.env, { abortEarly: false });
  if (error) {
    logger.error('❌ Invalid environment variables:', error.message);
    process.exit(1);
  }
  // Assign the validated values back to process.env (with defaults)
  Object.assign(process.env, value);
  logger.info('✅ Environment variables validated');
};
