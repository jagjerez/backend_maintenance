import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  MONGODB_URI: Joi.string().required(),

  // File Storage
  STORAGE_TYPE: Joi.string().valid('minio', 'vercel').default('minio'),

  // MinIO Configuration
  MINIO_ENDPOINT: Joi.string().when('STORAGE_TYPE', {
    is: 'minio',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MINIO_PORT: Joi.number().when('STORAGE_TYPE', {
    is: 'minio',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MINIO_ACCESS_KEY: Joi.string().when('STORAGE_TYPE', {
    is: 'minio',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MINIO_SECRET_KEY: Joi.string().when('STORAGE_TYPE', {
    is: 'minio',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MINIO_BUCKET_NAME: Joi.string().when('STORAGE_TYPE', {
    is: 'minio',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MINIO_USE_SSL: Joi.boolean().default(false),

  // Vercel Configuration
  VERCEL_ACCESS_TOKEN: Joi.string().when('STORAGE_TYPE', {
    is: 'vercel',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  VERCEL_PROJECT_ID: Joi.string().when('STORAGE_TYPE', {
    is: 'vercel',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // Cron Configuration
  CRON_EXPRESSION: Joi.string().default('*/30 * * * * *'), // 30 seconds for local, once per day for production

  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // OAuth2 Configuration
  OAUTH2_SERVER_URL: Joi.string().default(
    'https://oauth2-application.vercel.app',
  ),

  // App Configuration
  APP_NAME: Joi.string().default('Backend App Maintenance'),
  APP_VERSION: Joi.string().default('1.0.0'),
});
