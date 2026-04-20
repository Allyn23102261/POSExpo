import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils/helpers';

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.row}>
      <View style={styles.nameCol}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.size}>{item.size}oz</Text>
      </View>
      <View style={styles.qtyRow}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => onDecrease(item.id)}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => onIncrease(item.id)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.price}>{formatCurrency(item.price * item.quantity)}</Text>
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(item.id)}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  nameCol: { flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  size: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 26, height: 26,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  qty: { fontSize: 14, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  priceCol: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  removeBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  removeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
});