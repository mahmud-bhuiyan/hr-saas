import { z } from 'zod';

export const checkoutSessionSchema = z.object({
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const portalSessionSchema = z.object({
  returnUrl: z.string().url().optional(),
});
