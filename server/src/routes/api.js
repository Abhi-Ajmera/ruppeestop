import express from 'express';
import { BuyTransactionSchema, SellTransactionSchema, PreviewSellSchema } from '../schemas/transactionSchemas.js';
import { executeFifoSell, simulateFifoSell, computePortfolioSummary } from '../engine/fifoEngine.js';
import { readDb, writeDb, resetDb, clearDb } from '../storage/localStore.js';
import { LotStatus } from '../constants/enums.js';

const router = express.Router();

router.get('/portfolio', (req, res) => {
  try {
    const db = readDb();
    const portfolio = computePortfolioSummary(db.buyLots, db.sellTransactions);
    res.json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data: ' + err.message
    });
  }
});

router.post('/transactions/buy', (req, res) => {
  try {
    const validation = BuyTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase data',
        errors: validation.error.flatten().fieldErrors
      });
    }

    const { fundName, buyDate, units, pricePerUnit } = validation.data;
    const numUnits = Number(Number(units).toFixed(4));
    const numPrice = Number(Number(pricePerUnit).toFixed(2));
    const investedAmount = Number((numUnits * numPrice).toFixed(2));

    const newLot = {
      id: `lot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fundName: fundName.trim(),
      buyDate,
      initialUnits: numUnits,
      remainingUnits: numUnits,
      pricePerUnit: numPrice,
      investedAmount,
      status: LotStatus.ACTIVE,
      createdAt: new Date().toISOString()
    };

    const db = readDb();
    db.buyLots.push(newLot);
    writeDb(db);

    const portfolio = computePortfolioSummary(db.buyLots, db.sellTransactions);

    res.status(201).json({
      success: true,
      message: `Successfully recorded purchase of ${numUnits} units in ${fundName}`,
      data: {
        newLot,
        portfolio
      }
    });
  } catch (err) {
    console.error('Error recording buy transaction:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record buy transaction: ' + err.message
    });
  }
});

router.post('/transactions/preview-sell', (req, res) => {
  try {
    const validation = PreviewSellSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid redemption parameters',
        errors: validation.error.flatten().fieldErrors
      });
    }

    const db = readDb();
    const result = simulateFifoSell(db.buyLots, validation.data);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result.preview
    });
  } catch (err) {
    console.error('Error simulating sell transaction:', err);
    res.status(500).json({
      success: false,
      message: 'Simulation failed: ' + err.message
    });
  }
});

router.post('/transactions/sell', (req, res) => {
  try {
    const validation = SellTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid redemption data',
        errors: validation.error.flatten().fieldErrors
      });
    }

    const db = readDb();
    const { updatedBuyLots, sellTransaction } = executeFifoSell(db.buyLots, validation.data);

    db.buyLots = updatedBuyLots;
    db.sellTransactions.unshift(sellTransaction);
    writeDb(db);

    const portfolio = computePortfolioSummary(db.buyLots, db.sellTransactions);

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ${sellTransaction.unitsSold} units. Net Realized Gain: ₹${sellTransaction.netRealizedGain.toLocaleString('en-IN')}`,
      data: {
        sellTransaction,
        portfolio
      }
    });
  } catch (err) {
    console.error('Error executing sell transaction:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to process redemption'
    });
  }
});

router.post('/reset', (req, res) => {
  try {
    const data = resetDb();
    const portfolio = computePortfolioSummary(data.buyLots, data.sellTransactions);
    res.json({
      success: true,
      message: 'Portfolio database reset to demo mutual fund lots',
      data: portfolio
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/clear', (req, res) => {
  try {
    const data = clearDb();
    const portfolio = computePortfolioSummary(data.buyLots, data.sellTransactions);
    res.json({
      success: true,
      message: 'Database cleared to blank portfolio',
      data: portfolio
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
