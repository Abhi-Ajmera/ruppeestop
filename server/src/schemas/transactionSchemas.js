import { z } from 'zod';

export const BuyTransactionSchema = z.object({
  fundName: z.string().trim().min(2, { message: 'Fund name must be at least 2 characters long' }),
  buyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Buy date must be in YYYY-MM-DD format' }),
  units: z.coerce.number().positive({ message: 'Units purchased must be greater than 0' }),
  pricePerUnit: z.coerce.number().positive({ message: 'NAV / Purchase price per unit must be greater than 0' }),
});

export const SellTransactionSchema = z.object({
  fundName: z.string().trim().min(2, { message: 'Fund name must be at least 2 characters long' }),
  sellDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Sell date must be in YYYY-MM-DD format' }),
  unitsToSell: z.coerce.number().positive({ message: 'Units to sell must be greater than 0' }),
  sellPrice: z.coerce.number().positive({ message: 'Redemption price per unit must be greater than 0' }),
});

export const PreviewSellSchema = z.object({
  fundName: z.string().trim().min(2, { message: 'Fund name must be at least 2 characters long' }),
  sellDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Sell date must be in YYYY-MM-DD format' }),
  unitsToSell: z.coerce.number().positive({ message: 'Units to sell must be greater than 0' }),
  sellPrice: z.coerce.number().positive({ message: 'Redemption price per unit must be greater than 0' }),
});
