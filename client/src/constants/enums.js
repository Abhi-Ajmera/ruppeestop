export const TaxType = Object.freeze({
  LTCG: 'LTCG',
  STCG: 'STCG',
});

export const LotStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  PARTIALLY_SOLD: 'PARTIALLY_SOLD',
  EXHAUSTED: 'EXHAUSTED',
});

export const HoldingPeriod = Object.freeze({
  LTCG_THRESHOLD_DAYS: 365,
});

export const Precision = Object.freeze({
  UNITS_DECIMALS: 4,
  CURRENCY_DECIMALS: 2,
  EPSILON: 0.0001,
});
