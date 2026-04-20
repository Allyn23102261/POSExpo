export const formatCurrency = (amount) =>
  '₱' + Number(amount).toFixed(2);

export const generateOrderId = () => 'ORD-' + Date.now();

export const getTimestamp = () =>
  new Date().toLocaleString('en-PH', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const calcSubtotal = (cart) =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);