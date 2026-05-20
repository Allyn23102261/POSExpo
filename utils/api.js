// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// Change BASE_URL to match your server IP address.
// Example: if your PC's local IP is 192.168.1.5, use 'http://192.168.1.5:3000'
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = 'http://10.16.156.19:3000';

// ─── MENU ────────────────────────────────────────────────────────────────────

/** Fetch active menu items (for cashier POS screen) */
export const fetchMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json();
};

/** Fetch ALL menu items including inactive (for admin panel) */
export const fetchAdminMenu = async () => {
  const res = await fetch(`${BASE_URL}/admin/menu`);
  if (!res.ok) throw new Error('Failed to fetch admin menu');
  return res.json();
};

/** Add a new menu item */
export const addMenuItem = async (item) => {
  const res = await fetch(`${BASE_URL}/admin/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
};

/** Update an existing menu item */
export const updateMenuItem = async (id, item) => {
  const res = await fetch(`${BASE_URL}/admin/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
};

/** Delete a menu item */
export const deleteMenuItem = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/menu/${id}`, { method: 'DELETE' });
  return res.json();
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/**
 * Save a completed order.
 * Backend also deducts stock automatically.
 */
export const saveOrder = async (order) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return res.json();
};

/**
 * Fetch orders with optional filtering, search, and pagination.
 * @param {object} params - { filter: 'today'|'week'|'month'|'', search: string, page: number, limit: number }
 */
export const fetchOrders = async (params = {}) => {
  const { filter = '', search = '', page = 1, limit = 20 } = params;
  const qs = new URLSearchParams();
  if (filter) qs.set('filter', filter);
  if (search) qs.set('search', search);
  qs.set('page', page);
  qs.set('limit', limit);
  const res = await fetch(`${BASE_URL}/orders?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json(); // { orders, total, page, limit }
};

/** Delete a single order by ID */
export const deleteOrder = async (id) => {
  const res = await fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
  return res.json();
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────

/**
 * Fetch sales report summary.
 * @param {string} period - 'today' | 'week' | 'month'
 */
export const fetchReportSummary = async (period = 'today') => {
  const res = await fetch(`${BASE_URL}/reports/summary?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
};

// ─── INVENTORY ───────────────────────────────────────────────────────────────

/** Fetch full inventory list */
export const fetchInventory = async () => {
  const res = await fetch(`${BASE_URL}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
};

/** Fetch only low-stock items */
export const fetchLowStock = async () => {
  const res = await fetch(`${BASE_URL}/inventory/low-stock`);
  if (!res.ok) throw new Error('Failed to fetch low stock');
  return res.json();
};

/** Restock an item by adding to its current stock */
export const restockItem = async (id, amount) => {
  const res = await fetch(`${BASE_URL}/inventory/${id}/restock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  return res.json();
};
