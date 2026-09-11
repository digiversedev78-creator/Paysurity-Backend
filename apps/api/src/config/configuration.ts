import * as Joi from '@hapi/joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  SENDGRID_API_KEY: Joi.string().required(),

  // Twilio
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  TWILIO_FROM_NUMBER: Joi.string().required(),

  // Fluidpay
  FLUIDPAY_API_KEY: Joi.string().required(),
  FLUIDPAY_SECRET_KEY: Joi.string().required(),
  FLUIDPAY_WEBHOOK_SECRET: Joi.string().required(),

  PAYSURITY_WEBHOOK_SECRET: Joi.string().required(),
});
