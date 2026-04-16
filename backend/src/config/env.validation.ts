import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().required(),

  DATABASE_URL: Joi.string().required(),
  DATABASE_SSL: Joi.boolean().default(false),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  AES_ENCRYPTION_KEY: Joi.string().length(64).required(),

  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  LOCAL_STORAGE_PATH: Joi.string().default('./uploads'),
  S3_BUCKET: Joi.string().optional(),
  S3_REGION: Joi.string().optional(),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  S3_ENDPOINT: Joi.string().optional(),

  AI_REQUEST_TIMEOUT_MS: Joi.number().default(120000),
  PG_BOSS_SCHEMA: Joi.string().default('pgboss'),
});
