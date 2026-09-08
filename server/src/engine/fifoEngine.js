import { differenceInDays, parseISO } from 'date-fns';
import { TaxType, HoldingPeriod, LotStatus, Precision } from '../constants/enums.js';

export function executeFifoSell(existingLots, sellRequest) {
  const { fundName, sellDate, unitsToSell, sellPrice } = sellRequest;
  const numUnitsToSell = Number(unitsToSell);
  const numSellPrice = Number(sellPrice);

  // Step 1: Check inputs first so we don't do weird math with invalid data
  if (isNaN(numUnitsToSell) || numUnitsToSell <= 0) {
    throw new Error('Units to sell must be a positive number.');
  }

  if (isNaN(numSellPrice) || numSellPrice <= 0) {
    throw new Error('Sell price per unit must be a positive number.');
  }

  // Make a deep copy so we don't mutate the original lots by accident
  const clonedLots = JSON.parse(JSON.stringify(existingLots));

  // Find only the lots for this specific fund that still have units left to sell
  const candidateLots = clonedLots.filter(
    (lot) => lot.fundName.trim().toLowerCase() === fundName.trim().toLowerCase() && lot.remainingUnits > 0
  );

  // Count total available units. If user wants to sell more than they own, throw an error!
  const totalAvailableUnits = candidateLots.reduce((acc, lot) => acc + lot.remainingUnits, 0);
  const roundedAvailable = Number(totalAvailableUnits.toFixed(Precision.UNITS_DECIMALS));

  if (numUnitsToSell > roundedAvailable + Precision.EPSILON) {
    throw new Error(
      `Insufficient mutual fund units. You requested to sell ${numUnitsToSell} units, but only ${roundedAvailable} units are available for ${fundName}.`
    );
  }

  // Step 2: The FIFO part! Sort lots by buyDate from oldest to newest. First in, first out!
  // If dates are identical, use lot id as tie-breaker so it stays predictable
  candidateLots.sort((a, b) => {
    const cmp = a.buyDate.localeCompare(b.buyDate);
    if (cmp !== 0) return cmp;
    return (a.id || '').localeCompare(b.id || '');
  });

  let unitsRemainingToSell = numUnitsToSell;
  const consumedLots = [];
  let totalCostBasis = 0;
  let totalProceeds = 0;
  let totalRealizedGain = 0;
  let stcgAmount = 0;
  let ltcgAmount = 0;

  const parsedSellDate = parseISO(sellDate);

  // Step 3: Loop through sorted lots and start taking units until sell order is filled
  for (const lot of candidateLots) {
    if (unitsRemainingToSell <= 0.00001) break;

    const parsedBuyDate = parseISO(lot.buyDate);
    // Calculate how many days we held this lot using date-fns
    const holdingDays = Math.max(0, differenceInDays(parsedSellDate, parsedBuyDate));

    // Take as many units as this lot has, or whatever we still need if this lot has enough
    const unitsFromLot = Math.min(unitsRemainingToSell, lot.remainingUnits);
    const unitsRedeemed = Number(unitsFromLot.toFixed(Precision.UNITS_DECIMALS));

    // Calculate the money: cost basis (what we paid), proceeds (what we got), and profit or loss
    const costBasis = Number((unitsRedeemed * lot.pricePerUnit).toFixed(Precision.CURRENCY_DECIMALS));
    const proceeds = Number((unitsRedeemed * numSellPrice).toFixed(Precision.CURRENCY_DECIMALS));
    const realizedGainOrLoss = Number((proceeds - costBasis).toFixed(Precision.CURRENCY_DECIMALS));

    // Indian tax rule: held > 365 days is LTCG (long-term), <= 365 days is STCG (short-term)
    const taxType = holdingDays > HoldingPeriod.LTCG_THRESHOLD_DAYS ? TaxType.LTCG : TaxType.STCG;

    if (taxType === TaxType.LTCG) {
      ltcgAmount = Number((ltcgAmount + realizedGainOrLoss).toFixed(Precision.CURRENCY_DECIMALS));
    } else {
      stcgAmount = Number((stcgAmount + realizedGainOrLoss).toFixed(Precision.CURRENCY_DECIMALS));
    }

    totalCostBasis = Number((totalCostBasis + costBasis).toFixed(Precision.CURRENCY_DECIMALS));
    totalProceeds = Number((totalProceeds + proceeds).toFixed(Precision.CURRENCY_DECIMALS));
    totalRealizedGain = Number((totalRealizedGain + realizedGainOrLoss).toFixed(Precision.CURRENCY_DECIMALS));

    // Save this consumed tranche with full audit info so user knows where units came from
    consumedLots.push({
      lotId: lot.id,
      fundName: lot.fundName,
      buyDate: lot.buyDate,
      buyPrice: lot.pricePerUnit,
      unitsRedeemed,
      sellPrice: numSellPrice,
      sellDate,
      holdingDays,
      taxType,
      costBasis,
      proceeds,
      realizedGainOrLoss
    });

    // Subtract units from this lot. If it reaches 0, mark as EXHAUSTED, otherwise PARTIALLY_SOLD
    lot.remainingUnits = Number((lot.remainingUnits - unitsRedeemed).toFixed(Precision.UNITS_DECIMALS));
    if (lot.remainingUnits <= Precision.EPSILON) {
      lot.remainingUnits = 0;
      lot.status = LotStatus.EXHAUSTED;
    } else {
      lot.status = LotStatus.PARTIALLY_SOLD;
    }

    // Subtract from units we still need to sell. If we reached 0, we're all done!
    unitsRemainingToSell = Number((unitsRemainingToSell - unitsRedeemed).toFixed(Precision.UNITS_DECIMALS));
  }

  // Create the complete sell receipt object
  const sellTransaction = {
    id: `sell-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fundName,
    sellDate,
    unitsSold: numUnitsToSell,
    sellPrice: numSellPrice,
    totalProceeds,
    totalCostBasis,
    netRealizedGain: totalRealizedGain,
    stcgAmount,
    ltcgAmount,
    consumedLots,
    createdAt: new Date().toISOString()
  };

  return {
    updatedBuyLots: clonedLots,
    sellTransaction
  };
}

export function simulateFifoSell(existingLots, sellRequest) {
  try {
    const { sellTransaction, updatedBuyLots } = executeFifoSell(existingLots, sellRequest);
    const candidateLots = updatedBuyLots.filter(
      (l) => l.fundName.trim().toLowerCase() === sellRequest.fundName.trim().toLowerCase()
    );
    const remainingFundUnits = candidateLots.reduce((acc, l) => acc + l.remainingUnits, 0);

    return {
      success: true,
      isValid: true,
      preview: {
        unitsSold: sellTransaction.unitsSold,
        sellPrice: sellTransaction.sellPrice,
        sellDate: sellTransaction.sellDate,
        totalProceeds: sellTransaction.totalProceeds,
        totalCostBasis: sellTransaction.totalCostBasis,
        netRealizedGain: sellTransaction.netRealizedGain,
        stcgAmount: sellTransaction.stcgAmount,
        ltcgAmount: sellTransaction.ltcgAmount,
        consumedLots: sellTransaction.consumedLots,
        remainingFundUnits: Number(remainingFundUnits.toFixed(Precision.UNITS_DECIMALS))
      }
    };
  } catch (err) {
    return {
      success: false,
      isValid: false,
      message: err.message
    };
  }
}

export function computePortfolioSummary(buyLots = [], sellTransactions = []) {
  const activeLots = buyLots.filter((lot) => lot.remainingUnits > 0);

  const totalUnitsHeld = Number(
    activeLots.reduce((sum, lot) => sum + lot.remainingUnits, 0).toFixed(Precision.UNITS_DECIMALS)
  );

  const totalInvestedActiveBasis = Number(
    activeLots.reduce((sum, lot) => sum + (lot.remainingUnits * lot.pricePerUnit), 0).toFixed(Precision.CURRENCY_DECIMALS)
  );

  const totalOriginalInvested = Number(
    buyLots.reduce((sum, lot) => sum + lot.investedAmount, 0).toFixed(Precision.CURRENCY_DECIMALS)
  );

  const totalUnitsSold = Number(
    sellTransactions.reduce((sum, tx) => sum + tx.unitsSold, 0).toFixed(Precision.UNITS_DECIMALS)
  );

  const totalRealizedGains = Number(
    sellTransactions.reduce((sum, tx) => sum + tx.netRealizedGain, 0).toFixed(Precision.CURRENCY_DECIMALS)
  );

  const totalSTCG = Number(
    sellTransactions.reduce((sum, tx) => sum + (tx.stcgAmount || 0), 0).toFixed(Precision.CURRENCY_DECIMALS)
  );

  const totalLTCG = Number(
    sellTransactions.reduce((sum, tx) => sum + (tx.ltcgAmount || 0), 0).toFixed(Precision.CURRENCY_DECIMALS)
  );

  const latestLot = [...buyLots].sort((a, b) => b.buyDate.localeCompare(a.buyDate))[0];
  const estimatedLatestNav = latestLot ? latestLot.pricePerUnit : 0;
  const currentPortfolioValue = Number((totalUnitsHeld * estimatedLatestNav).toFixed(Precision.CURRENCY_DECIMALS));
  const unrealizedGain = Number((currentPortfolioValue - totalInvestedActiveBasis).toFixed(Precision.CURRENCY_DECIMALS));

  return {
    metrics: {
      totalUnitsHeld,
      totalUnitsSold,
      totalInvestedActiveBasis,
      totalOriginalInvested,
      currentPortfolioValue,
      unrealizedGain,
      totalRealizedGains,
      totalSTCG,
      totalLTCG,
      activeLotsCount: activeLots.length,
      totalLotsCount: buyLots.length,
      totalSellOrdersCount: sellTransactions.length
    },
    activeLots,
    allLots: buyLots,
    sellHistory: sellTransactions
  };
}
