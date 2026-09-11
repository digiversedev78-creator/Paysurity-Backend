import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfaCode: z.string().optional(),
  tenantId: z.string().optional() // Zero Tech Debt: Must exist per user rule if available
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tenantId: z.string().optional()
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type RegisterRequestDto = RegisterDto;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
