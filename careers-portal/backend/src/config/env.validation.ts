import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsIn, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsNumberString()
  PORT: string;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  CORS_ORIGINS: string;

  @IsString()
  STORAGE_DRIVER: string; // 's3' | 'minio'

  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsString()
  S3_REGION: string;

  @IsString()
  S3_BUCKET: string;

  @IsString()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  S3_SECRET_ACCESS_KEY: string;

  @IsOptional()
  @IsBooleanString()
  S3_FORCE_PATH_STYLE?: string;

  @IsOptional()
  @IsString()
  RESUME_CDN_BASE_URL?: string;

  @IsString()
  SMTP_HOST: string;

  @IsNumberString()
  SMTP_PORT: string;

  @IsBooleanString()
  SMTP_SECURE: string;

  @IsString()
  SMTP_USER: string;

  @IsString()
  SMTP_PASSWORD: string;

  @IsString()
  SMTP_FROM: string;

  @IsString()
  HR_NOTIFICATION_EMAILS: string;

  @IsString()
  ADMIN_NOTIFICATION_EMAILS: string;

  @IsString()
  PUBLIC_WEB_ORIGIN: string;

  @IsString()
  ADMIN_WEB_ORIGIN: string;

  @IsOptional()
  @IsString()
  CLAMAV_HOST?: string;

  @IsOptional()
  @IsNumberString()
  CLAMAV_PORT?: string;

  @IsOptional()
  @IsBooleanString()
  VIRUS_SCAN_ENABLED?: string;

  @IsString()
  COOKIE_SECRET: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }
  return validatedConfig;
}
