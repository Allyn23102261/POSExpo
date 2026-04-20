import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { COLORS, PAYMENT_METHODS } from '../constants';
import { formatCurrency, calcSubtotal } from '../utils/helpers';
import CartItem from './CartItem';

export default function CartSummary({
  cart, selectedPayment, onSelectPayment,
  onIncrease, onDecrease, onRemove, onClear, onCheckout,
}) {
  const total = calcSubtotal(cart);

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from the cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onClear },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛒 Order Items</Text>
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {cart.length === 0 ? (
          <Text style={styles.emptyText}>No items in cart</Text>
        ) : (
          cart.map((item) => (
            <CartItem key={item.id} item={item}
              onIncrease={onIncrease} onDecrease={onDecrease} onRemove={onRemove} />
          ))
        )}
      </ScrollView>
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>
      <Text style={styles.paymentLabel}>Payment Method</Text>
      <View style={styles.paymentGrid}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity key={method.id}
            style={[styles.paymentBtn, selectedPayment === method.id && styles.paymentBtnActive]}
            onPress={() => onSelectPayment(method.id)}
          >
            <Text style={[styles.paymentBtnText, selectedPayment === method.id && styles.paymentBtnTextActive]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
        <Text style={styles.clearBtnText}>🗑️ Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.checkoutBtn, cart.length === 0 && styles.disabledBtn]}
        onPress={onCheckout} disabled={cart.length === 0}
      >
        <Text style={styles.checkoutBtnText}>✓ Complete Sale</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
  },
  heading: {
    fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12,
    borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 8,
  },
  itemsList: { maxHeight: 220, marginBottom: 10 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20, fontSize: 14 },
  summary: { borderTopWidth: 2, borderTopColor: COLORS.primary, paddingTop: 12, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.textLight },
  summaryValue: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  totalRow: { marginTop: 6 },
  totalLabel: { fontSize: 17, fontWeight: 'bold', color: COLORS.primaryDark },
  totalValue: { fontSize: 17, fontWeight: 'bold', color: COLORS.primaryDark },
  paymentLabel: {
    fontSize: 12, color: COLORS.textLight, fontWeight: '700',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  paymentBtn: {
    width: '47%', paddingVertical: 10, borderWidth: 2,
    borderColor: COLORS.border, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.white,
  },
  paymentBtnActive: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  paymentBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  paymentBtnTextActive: { color: COLORS.primary },
  clearBtn: {
    backgroundColor: COLORS.danger, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginBottom: 8,
  },
  clearBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  checkoutBtn: { backgroundColor: COLORS.success, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  checkoutBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  disabledBtn: { backgroundColor: '#ccc' },
});