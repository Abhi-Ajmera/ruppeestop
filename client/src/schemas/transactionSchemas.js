import { z } from 'zod';

export const BuyFormSchema = z.object({
  fundName: z.string().trim().min(2, { message: 'Fund name must be at least 2 characters' }),
  buyDate: z.string().min(10, { message: 'Please select a valid purchase date' }),
  units: z.coerce
    .number({ invalid_type_error: 'Units must be a valid number' })
    .positive({ message: 'Units must be greater than 0' }),
  pricePerUnit: z.coerce
    .number({ invalid_type_error: 'Price per unit must be a valid number' })
    .positive({ message: 'Price per unit (NAV) must be greater than 0' }),
});

export const SellFormSchema = z.object({
  fundName: z.string().trim().min(2, { message: 'Fund name must be at least 2 characters' }),
  sellDate: z.string().min(10, { message: 'Please select a valid redemption date' }),
  unitsToSell: z.coerce
    .number({ invalid_type_error: 'Units to sell must be a valid number' })
    .positive({ message: 'Units to sell must be greater than 0' }),
  sellPrice: z.coerce
    .number({ invalid_type_error: 'Redemption price must be a valid number' })
    .positive({ message: 'Sell price per unit must be greater than 0' }),
});
