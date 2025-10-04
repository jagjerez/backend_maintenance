export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/backend_app_maintenance',
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'minio',
    minio: {
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucketName: process.env.MINIO_BUCKET_NAME || 'app-maintenance',
      useSSL: process.env.MINIO_USE_SSL === 'true',
    },
    vercel: {
      accessToken: process.env.VERCEL_ACCESS_TOKEN || '',
      projectId: process.env.VERCEL_PROJECT_ID || '',
    },
  },
  cron: {
    expression: process.env.CRON_EXPRESSION || '*/30 * * * * *',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  oauth2: {
    serverUrl:
      process.env.OAUTH2_SERVER_URL || 'https://oauth2-application.vercel.app',
  },
  app: {
    name: process.env.APP_NAME || 'Backend App Maintenance',
    version: process.env.APP_VERSION || '1.0.0',
  },
});
