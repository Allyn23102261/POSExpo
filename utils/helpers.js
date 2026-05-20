export const formatCurrency = (amount) =>
  '₱' + Number(amount).toFixed(2);

export const generateOrderId = () => 'ORD-' + Date.now();

export const getTimestamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const hh   = String(now.getHours()).padStart(2, '0');
  const min  = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

export const calcSubtotal = (cart) =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);