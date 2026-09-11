import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(1).required(),
  SENDGRID_API_KEY: Joi.string().min(1).required(),
  TWILIO_ACCOUNT_SID: Joi.string().min(1).required(),
  TWILIO_AUTH_TOKEN: Joi.string().min(1).required(),
  TWILIO_PHONE_NUMBER: Joi.string().min(1).required(),
  FLUIDPAY_API_KEY: Joi.string().min(1).required(),
  FLUIDPAY_SECRET: Joi.string().min(1).required(),
  PAYSURITY_WEBHOOK_SECRET: Joi.string().min(1).required(),
});
