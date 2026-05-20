export const COLORS = {
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#ede9fe',
  success: '#10b981',
  successDark: '#059669',
  danger: '#ff6b6b',
  dangerDark: '#ff5252',
  gradientStart: '#6becdb',
  gradientEnd: '#5cec8c',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  border: '#e0e0e0',
  cardShadow: 'rgba(0,0,0,0.1)',
};

export const PAYMENT_METHODS = [
  { id: 'cash',  label: '💵 Cash' },
  { id: 'card',  label: '💳 Card' },
  { id: 'gcash', label: '📱 GCash' },
  { id: 'check', label: '📄 Check' },
];

export const MENU_ITEMS = [
  {
    id: 1,
    name: 'Lemongrass Tea',
    image: require('../assets/lemongrass.png'),
    sizes: [
      { size: 16, price: 89 },
      { size: 22, price: 115 },
    ],
  },
  {
    id: 2,
    name: 'Peach Tea',
    image: require('../assets/peach.jpg'),
    sizes: [
      { size: 16, price: 89 },
      { size: 22, price: 115 },
    ],
  },
  {
    id: 3,
    name: 'Frosty Tea',
    image: require('../assets/frosty.jpg'),
    sizes: [
      { size: 16, price: 89 },
      { size: 22, price: 115 },
    ],
  },
];