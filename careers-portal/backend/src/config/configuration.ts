export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),

  mongodbUri: process.env.MONGODB_URI as string,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  cookieSecret: process.env.COOKIE_SECRET as string,

  storage: {
    driver: process.env.STORAGE_DRIVER ?? 's3',
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'ap-south-1',
    bucket: process.env.S3_BUCKET as string,
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    cdnBaseUrl: process.env.RESUME_CDN_BASE_URL,
  },

  smtp: {
    host: process.env.SMTP_HOST as string,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER as string,
    password: process.env.SMTP_PASSWORD as string,
    from: process.env.SMTP_FROM ?? 'careers@rudraas.com',
  },

  notifications: {
    hrEmails: (process.env.HR_NOTIFICATION_EMAILS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    adminEmails: (process.env.ADMIN_NOTIFICATION_EMAILS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  webOrigins: {
    public: process.env.PUBLIC_WEB_ORIGIN ?? 'https://rudraas.com',
    admin: process.env.ADMIN_WEB_ORIGIN ?? 'https://career.rudraas.com',
  },

  virusScan: {
    enabled: process.env.VIRUS_SCAN_ENABLED === 'true',
    clamavHost: process.env.CLAMAV_HOST ?? 'clamav',
    clamavPort: parseInt(process.env.CLAMAV_PORT ?? '3310', 10),
  },

  throttle: {
    ttlSeconds: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    applyLimit: parseInt(process.env.THROTTLE_APPLY_LIMIT ?? '5', 10),
    authLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT ?? '10', 10),
  },
});
