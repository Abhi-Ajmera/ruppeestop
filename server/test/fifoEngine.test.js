import assert from 'assert';
import { executeFifoSell, simulateFifoSell, computePortfolioSummary } from '../src/engine/fifoEngine.js';

console.log('🧪 Starting FIFO Engine Unit Tests...\n');

// Test Case 1: Single Lot Partial Redemption
{
  const mockLots = [
    {
      id: 'lot-1',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2025-01-01',
      initialUnits: 100,
      remainingUnits: 100,
      pricePerUnit: 50.00,
      investedAmount: 5000,
      status: 'ACTIVE'
    }
  ];

  const sellRequest = {
    fundName: 'Parag Parikh Flexi Cap Fund',
    sellDate: '2025-06-01', // 151 days held => STCG (<= 365)
    unitsToSell: 40,
    sellPrice: 60.00
  };

  const { updatedBuyLots, sellTransaction } = executeFifoSell(mockLots, sellRequest);

  assert.strictEqual(updatedBuyLots[0].remainingUnits, 60, 'Remaining units in lot 1 should be 60');
  assert.strictEqual(updatedBuyLots[0].status, 'PARTIALLY_SOLD', 'Lot 1 status should be PARTIALLY_SOLD');
  assert.strictEqual(sellTransaction.unitsSold, 40, 'Units sold should be 40');
  assert.strictEqual(sellTransaction.totalCostBasis, 2000, 'Cost basis: 40 * 50 = 2000');
  assert.strictEqual(sellTransaction.totalProceeds, 2400, 'Proceeds: 40 * 60 = 2400');
  assert.strictEqual(sellTransaction.netRealizedGain, 400, 'Realized Gain: 2400 - 2000 = 400');
  assert.strictEqual(sellTransaction.consumedLots.length, 1, 'Should consume exactly 1 lot');
  assert.strictEqual(sellTransaction.consumedLots[0].taxType, 'STCG', 'Held 151 days => STCG');
  assert.strictEqual(sellTransaction.stcgAmount, 400, 'STCG should be 400');
  assert.strictEqual(sellTransaction.ltcgAmount, 0, 'LTCG should be 0');

  console.log('✅ Test 1 Passed: Single Lot Partial Redemption & STCG classification');
}

// Test Case 2: Multi-Lot Spanning (FIFO Order) & LTCG vs STCG
{
  const mockLots = [
    {
      id: 'lot-old',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2024-01-01', // Held > 365 days by 2025-06-01 => LTCG
      initialUnits: 100,
      remainingUnits: 100,
      pricePerUnit: 50.00,
      investedAmount: 5000,
      status: 'ACTIVE'
    },
    {
      id: 'lot-new',
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2025-01-01', // Held 151 days by 2025-06-01 => STCG
      initialUnits: 100,
      remainingUnits: 100,
      pricePerUnit: 55.00,
      investedAmount: 5500,
      status: 'ACTIVE'
    }
  ];

  // Request to sell 150 units => 100 from lot-old, 50 from lot-new
  const sellRequest = {
    fundName: 'Parag Parikh Flexi Cap Fund',
    sellDate: '2025-06-01',
    unitsToSell: 150,
    sellPrice: 70.00
  };

  const { updatedBuyLots, sellTransaction } = executeFifoSell(mockLots, sellRequest);

  assert.strictEqual(updatedBuyLots[0].remainingUnits, 0, 'Oldest lot should be fully exhausted (0 units)');
  assert.strictEqual(updatedBuyLots[0].status, 'EXHAUSTED', 'Oldest lot should have EXHAUSTED status');
  assert.strictEqual(updatedBuyLots[1].remainingUnits, 50, 'New lot should have 50 units remaining');
  assert.strictEqual(updatedBuyLots[1].status, 'PARTIALLY_SOLD', 'New lot should be PARTIALLY_SOLD');

  assert.strictEqual(sellTransaction.consumedLots.length, 2, 'Sale should span 2 lots');

  // Lot 1 consumption: 100 units @ 50, sold @ 70 => Gain = 2000 (LTCG)
  const lot1Consumed = sellTransaction.consumedLots[0];
  assert.strictEqual(lot1Consumed.lotId, 'lot-old');
  assert.strictEqual(lot1Consumed.unitsRedeemed, 100);
  assert.strictEqual(lot1Consumed.taxType, 'LTCG');
  assert.strictEqual(lot1Consumed.realizedGainOrLoss, 2000);

  // Lot 2 consumption: 50 units @ 55, sold @ 70 => Gain = 50 * 15 = 750 (STCG)
  const lot2Consumed = sellTransaction.consumedLots[1];
  assert.strictEqual(lot2Consumed.lotId, 'lot-new');
  assert.strictEqual(lot2Consumed.unitsRedeemed, 50);
  assert.strictEqual(lot2Consumed.taxType, 'STCG');
  assert.strictEqual(lot2Consumed.realizedGainOrLoss, 750);

  assert.strictEqual(sellTransaction.ltcgAmount, 2000, 'Total LTCG should be 2000');
  assert.strictEqual(sellTransaction.stcgAmount, 750, 'Total STCG should be 750');
  assert.strictEqual(sellTransaction.netRealizedGain, 2750, 'Net Realized Gain should be 2750');

  console.log('✅ Test 2 Passed: Multi-Lot Spanning (FIFO) with mixed LTCG & STCG breakdown');
}

// Test Case 3: Boundary Test for 365 days vs 366 days
{
  const mockLots = [
    {
      id: 'lot-365',
      fundName: 'Axis Bluechip',
      buyDate: '2024-01-01',
      initialUnits: 10,
      remainingUnits: 10,
      pricePerUnit: 100,
      investedAmount: 1000,
      status: 'ACTIVE'
    },
    {
      id: 'lot-366',
      fundName: 'Axis Bluechip',
      buyDate: '2024-01-01',
      initialUnits: 10,
      remainingUnits: 10,
      pricePerUnit: 100,
      investedAmount: 1000,
      status: 'ACTIVE'
    }
  ];

  // Exactly 365 days: 2024-01-01 to 2024-12-31 (2024 is leap year: Jan 31 + Feb 29 + Mar 31 + Apr 30 + May 31 + Jun 30 + Jul 31 + Aug 31 + Sep 30 + Oct 31 + Nov 30 + Dec 30 = 365)
  // Let's test non-leap year or exact date:
  // 2025-01-01 to 2026-01-01 is 365 days => STCG (rule: > 365 is LTCG)
  // 2025-01-01 to 2026-01-02 is 366 days => LTCG
  const lots2025 = [
    {
      id: 'lot-a',
      fundName: 'Fund X',
      buyDate: '2025-01-01',
      initialUnits: 10,
      remainingUnits: 10,
      pricePerUnit: 100,
      investedAmount: 1000,
      status: 'ACTIVE'
    }
  ];

  // Sale on exactly 365th day
  const res365 = executeFifoSell(lots2025, {
    fundName: 'Fund X',
    sellDate: '2026-01-01',
    unitsToSell: 5,
    sellPrice: 120
  });
  assert.strictEqual(res365.sellTransaction.consumedLots[0].holdingDays, 365);
  assert.strictEqual(res365.sellTransaction.consumedLots[0].taxType, 'STCG', 'Exactly 365 days held must be STCG');

  // Sale on 366th day (> 365 days)
  const res366 = executeFifoSell(lots2025, {
    fundName: 'Fund X',
    sellDate: '2026-01-02',
    unitsToSell: 5,
    sellPrice: 120
  });
  assert.strictEqual(res366.sellTransaction.consumedLots[0].holdingDays, 366);
  assert.strictEqual(res366.sellTransaction.consumedLots[0].taxType, 'LTCG', '366 days held (> 365) must be LTCG');

  console.log('✅ Test 3 Passed: Holding period boundary verification (365 days = STCG vs 366 days = LTCG)');
}

// Test Case 4: Over-selling validation error
{
  const mockLots = [
    {
      id: 'lot-small',
      fundName: 'Small Fund',
      buyDate: '2025-01-01',
      initialUnits: 25,
      remainingUnits: 25,
      pricePerUnit: 40,
      investedAmount: 1000,
      status: 'ACTIVE'
    }
  ];

  let threwError = false;
  try {
    executeFifoSell(mockLots, {
      fundName: 'Small Fund',
      sellDate: '2025-02-01',
      unitsToSell: 50, // Requesting 50 when only 25 available
      sellPrice: 45
    });
  } catch (err) {
    threwError = true;
    assert.match(err.message, /Insufficient mutual fund units/);
  }

  assert.strictEqual(threwError, true, 'Should throw error when unitsToSell > available units');
  console.log('✅ Test 4 Passed: Insufficient units rejection');
}

// Test Case 5: Simulation Preview without mutating original array
{
  const mockLots = [
    {
      id: 'lot-preview',
      fundName: 'Preview Fund',
      buyDate: '2025-01-01',
      initialUnits: 100,
      remainingUnits: 100,
      pricePerUnit: 50,
      investedAmount: 5000,
      status: 'ACTIVE'
    }
  ];

  const preview = simulateFifoSell(mockLots, {
    fundName: 'Preview Fund',
    sellDate: '2025-06-01',
    unitsToSell: 30,
    sellPrice: 65
  });

  assert.strictEqual(preview.success, true);
  assert.strictEqual(preview.preview.consumedLots[0].unitsRedeemed, 30);
  assert.strictEqual(mockLots[0].remainingUnits, 100, 'Original lot array should NOT be mutated by simulation');

  console.log('✅ Test 5 Passed: Live FIFO Preview simulation without data mutation');
}

console.log('\n🎉 ALL FIFO ENGINE TESTS PASSED SUCCESSFULLY!\n');
