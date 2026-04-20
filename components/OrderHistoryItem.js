import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils/helpers';

export default function OrderHistoryItem({ order }) {
  const itemsText = order.items.map((i) => `${i.name} (${i.size}oz) ×${i.quantity}`).join(', ');
  return (
    <View style={styles.card}>
      <Text style={styles.timestamp}>{order.timestamp}</Text>
      <Text style={styles.orderId}>{order.id}</Text>
      <Text style={styles.items} numberOfLines={2}>{itemsText}</Text>
      <View style={styles.footer}>
        <Text style={styles.amount}>{formatCurrency(order.total)}</Text>
        <Text style={styles.payment}>{order.payment.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 12,
    marginBottom: 10, borderLeftWidth: 4, borderLeftColor: COLORS.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  timestamp: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  orderId: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  items: { fontSize: 12, color: COLORS.textLight, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 15, fontWeight: 'bold', color: COLORS.primaryDark },
  payment: { fontSize: 11, fontWeight: '700', color: COLORS.primary, backgroundColor: '#f0f4ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});