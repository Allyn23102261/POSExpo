const BASE_URL = 'http://10.16.156.19:3000';

export const fetchMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  return res.json();
};

export const saveOrder = async (order) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return res.json();
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};