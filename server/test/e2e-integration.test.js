import assert from 'assert';

const API_BASE = 'http://localhost:5001/api';

console.log('🚀 Running Full End-to-End FIFO & Capital Gains Integration Test...\n');

async function runTests() {
  // Step 1: Reset database to ensure clean baseline
  console.log('1️⃣ Resetting database to baseline demo lots...');
  const resetRes = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  const resetJson = await resetRes.json();
  assert.strictEqual(resetJson.success, true);
  assert.strictEqual(resetJson.data.activeLots.length, 4, 'Should start with 4 active lots');
  console.log(`   ✅ Database reset. Active lots: ${resetJson.data.activeLots.length}, Total units: ${resetJson.data.metrics.totalUnitsHeld}`);

  // Step 2: Add a new buy transaction (lot-5)
  console.log('\n2️⃣ Recording a new buy transaction (60 units @ ₹65 on 2026-05-10)...');
  const buyRes = await fetch(`${API_BASE}/transactions/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: '2026-05-10',
      units: 60,
      pricePerUnit: 65.00
    })
  });
  const buyJson = await buyRes.json();
  assert.strictEqual(buyJson.success, true);
  assert.strictEqual(buyJson.data.newLot.initialUnits, 60);
  assert.strictEqual(buyJson.data.newLot.pricePerUnit, 65);
  assert.strictEqual(buyJson.data.newLot.investedAmount, 3900);
  assert.strictEqual(buyJson.data.portfolio.activeLots.length, 5, 'Should now have 5 active lots');
  assert.strictEqual(buyJson.data.portfolio.metrics.totalUnitsHeld, 410, '350 + 60 = 410 units held');
  console.log('   ✅ Buy lot recorded successfully and queued for FIFO.');

  // Step 3: Test live FIFO redemption preview (150 units @ ₹85 on 2026-08-01)
  console.log('\n3️⃣ Testing Live FIFO Preview Simulation (150 units @ ₹85 on 2026-08-01)...');
  const previewRes = await fetch(`${API_BASE}/transactions/preview-sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fundName: 'Parag Parikh Flexi Cap Fund',
      sellDate: '2026-08-01',
      unitsToSell: 150,
      sellPrice: 85.00
    })
  });
  const previewJson = await previewRes.json();
  assert.strictEqual(previewJson.success, true);
  const preview = previewJson.data;

  // Verify multi-lot spanning:
  // Lot 1 (2024-10-15): 100 units @ 52.40 => held 655 days (>365) => LTCG
  // Lot 2 (2025-03-20): 50 units (out of 80) @ 56.10 => held 499 days (>365) => LTCG
  assert.strictEqual(preview.consumedLots.length, 2, 'Sale must consume 2 lots via FIFO');
  
  const tranche1 = preview.consumedLots[0];
  assert.strictEqual(tranche1.lotId, 'lot-1');
  assert.strictEqual(tranche1.unitsRedeemed, 100);
  assert.strictEqual(tranche1.buyPrice, 52.40);
  assert.strictEqual(tranche1.taxType, 'LTCG');
  assert.strictEqual(tranche1.costBasis, 5240);
  assert.strictEqual(tranche1.proceeds, 8500); // 100 * 85
  assert.strictEqual(tranche1.realizedGainOrLoss, 3260); // 8500 - 5240

  const tranche2 = preview.consumedLots[1];
  assert.strictEqual(tranche2.lotId, 'lot-2');
  assert.strictEqual(tranche2.unitsRedeemed, 50);
  assert.strictEqual(tranche2.buyPrice, 56.10);
  assert.strictEqual(tranche2.taxType, 'LTCG');
  assert.strictEqual(tranche2.costBasis, 2805); // 50 * 56.10
  assert.strictEqual(tranche2.proceeds, 4250); // 50 * 85
  assert.strictEqual(tranche2.realizedGainOrLoss, 1445); // 4250 - 2805

  assert.strictEqual(preview.totalProceeds, 12750); // 150 * 85
  assert.strictEqual(preview.totalCostBasis, 8045); // 5240 + 2805
  assert.strictEqual(preview.netRealizedGain, 4705); // 3260 + 1445
  assert.strictEqual(preview.ltcgAmount, 4705);
  assert.strictEqual(preview.stcgAmount, 0);
  assert.strictEqual(preview.remainingFundUnits, 260); // 410 - 150 = 260
  console.log('   ✅ FIFO Live Preview verified with exact lot spanning, tax types, and gains!');

  // Step 4: Execute the Sell transaction
  console.log('\n4️⃣ Executing FIFO Redemption (150 units @ ₹85)...');
  const sellRes = await fetch(`${API_BASE}/transactions/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fundName: 'Parag Parikh Flexi Cap Fund',
      sellDate: '2026-08-01',
      unitsToSell: 150,
      sellPrice: 85.00
    })
  });
  const sellJson = await sellRes.json();
  assert.strictEqual(sellJson.success, true);
  const tx = sellJson.data.sellTransaction;
  assert.strictEqual(tx.unitsSold, 150);
  assert.strictEqual(tx.netRealizedGain, 4705);
  assert.strictEqual(tx.consumedLots.length, 2);

  // Check updated portfolio state
  const updatedPortfolio = sellJson.data.portfolio;
  assert.strictEqual(updatedPortfolio.metrics.totalUnitsHeld, 260);
  assert.strictEqual(updatedPortfolio.metrics.totalUnitsSold, 150);
  assert.strictEqual(updatedPortfolio.metrics.totalRealizedGains, 4705);
  assert.strictEqual(updatedPortfolio.sellHistory.length, 1);
  console.log('   ✅ Redemption executed. Total units held updated to 260, realized gain booked: ₹4,705');

  // Step 5: Execute another redemption that will trigger STCG (<= 365 days)
  // Let's redeem from lot-3 (bought 2025-11-10) or lot-4 (bought 2026-04-12)
  // Remaining in Lot 2: 30 units (bought 2025-03-20, LTCG)
  // Let's sell 50 units on 2026-08-01:
  // 30 units from Lot 2 (LTCG, bought 2025-03-20, ~500 days)
  // 20 units from Lot 3 (bought 2025-11-10 => held 264 days <= 365 days => STCG!)
  console.log('\n5️⃣ Testing mixed LTCG + STCG redemption (50 units @ ₹90 on 2026-08-01)...');
  const mixedSellRes = await fetch(`${API_BASE}/transactions/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fundName: 'Parag Parikh Flexi Cap Fund',
      sellDate: '2026-08-01',
      unitsToSell: 50,
      sellPrice: 90.00
    })
  });
  const mixedJson = await mixedSellRes.json();
  assert.strictEqual(mixedJson.success, true);
  const mixedTx = mixedJson.data.sellTransaction;
  assert.strictEqual(mixedTx.consumedLots.length, 2);

  // Tranche 1: 30 units from Lot 2 => LTCG
  assert.strictEqual(mixedTx.consumedLots[0].lotId, 'lot-2');
  assert.strictEqual(mixedTx.consumedLots[0].unitsRedeemed, 30);
  assert.strictEqual(mixedTx.consumedLots[0].taxType, 'LTCG');

  // Tranche 2: 20 units from Lot 3 => STCG (held 264 days <= 365)
  assert.strictEqual(mixedTx.consumedLots[1].lotId, 'lot-3');
  assert.strictEqual(mixedTx.consumedLots[1].unitsRedeemed, 20);
  assert.strictEqual(mixedTx.consumedLots[1].taxType, 'STCG');
  assert.strictEqual(mixedTx.consumedLots[1].holdingDays <= 365, true);

  console.log(`   ✅ Mixed redemption: ${mixedTx.consumedLots[0].unitsRedeemed} units LTCG + ${mixedTx.consumedLots[1].unitsRedeemed} units STCG.`);
  console.log(`   Tranche 1 (LTCG): Gain = ₹${mixedTx.consumedLots[0].realizedGainOrLoss}, Tranche 2 (STCG): Gain = ₹${mixedTx.consumedLots[1].realizedGainOrLoss}`);

  // Step 6: Test over-selling validation error
  console.log('\n6️⃣ Testing over-selling validation rejection...');
  const overRes = await fetch(`${API_BASE}/transactions/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fundName: 'Parag Parikh Flexi Cap Fund',
      sellDate: '2026-08-01',
      unitsToSell: 1000, // Exceeds remaining 210 units
      sellPrice: 90.00
    })
  });
  const overJson = await overRes.json();
  assert.strictEqual(overRes.status, 400);
  assert.strictEqual(overJson.success, false);
  assert.match(overJson.message, /Insufficient mutual fund units/);
  console.log(`   ✅ Over-selling rejected with clean message: "${overJson.message}"`);

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
