const API_BASE_URL = 'http://localhost:5001/api';
const LOCAL_STORAGE_CACHE_KEY = 'rupeestop_portfolio_cache';

export async function getPortfolio() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    if (json.success) {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(json.data));
      return json.data;
    }
    throw new Error(json.message || 'Failed to fetch portfolio');
  } catch (err) {
    console.warn('Backend unavailable, reading from localStorage cache:', err);
    const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw err;
  }
}

export async function recordBuyTransaction(data) {
  const res = await fetch(`${API_BASE_URL}/transactions/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const errMsg = json.errors 
      ? Object.values(json.errors).flat().join(', ')
      : json.message || 'Failed to record buy order';
    throw new Error(errMsg);
  }

  if (json.data?.portfolio) {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(json.data.portfolio));
  }
  return json.data;
}

export async function previewSellTransaction(data) {
  const res = await fetch(`${API_BASE_URL}/transactions/preview-sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const errMsg = json.errors 
      ? Object.values(json.errors).flat().join(', ')
      : json.message || 'Simulation failed';
    throw new Error(errMsg);
  }

  return json.data;
}

export async function executeSellTransaction(data) {
  const res = await fetch(`${API_BASE_URL}/transactions/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const errMsg = json.errors 
      ? Object.values(json.errors).flat().join(', ')
      : json.message || 'Failed to execute redemption';
    throw new Error(errMsg);
  }

  if (json.data?.portfolio) {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(json.data.portfolio));
  }
  return json.data;
}

export async function resetDemoPortfolio() {
  const res = await fetch(`${API_BASE_URL}/reset`, {
    method: 'POST'
  });
  const json = await res.json();
  if (json.success && json.data) {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(json.data));
    return json.data;
  }
  throw new Error(json.message || 'Failed to reset portfolio');
}

export async function clearPortfolio() {
  const res = await fetch(`${API_BASE_URL}/clear`, {
    method: 'POST'
  });
  const json = await res.json();
  if (json.success && json.data) {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(json.data));
    return json.data;
  }
  throw new Error(json.message || 'Failed to clear portfolio');
}
