import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Pressable, Alert
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils/helpers';

export default function PaymentModal({ visible, total, payment, onConfirm, onClose }) {
  const [amountReceived, setAmountReceived] = useState('');
  const change = parseFloat(amountReceived || 0) - total;

  useEffect(() => {
    if (visible) setAmountReceived('');
  }, [visible]);

  const handleConfirm = () => {
    if (payment !== 'cash') {
      onConfirm(parseFloat(amountReceived || total));
      return;
    }
    if (!amountReceived || parseFloat(amountReceived) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter the amount received.');
      return;
    }
    if (parseFloat(amountReceived) < total) {
      Alert.alert('Insufficient Amount', `Amount received is less than the total of ${formatCurrency(total)}.`);
      return;
    }
    onConfirm(parseFloat(amountReceived));
  };

  const isCash = payment === 'cash';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>

          {/* Title */}
          <Text style={styles.title}>💳 Payment</Text>
          <Text style={styles.paymentMethod}>Method: {payment.toUpperCase()}</Text>

          {/* Total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Amount Due</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>

          {/* Amount Received — only for cash */}
          {isCash && (
            <>
              <Text style={styles.inputLabel}>Amount Received</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#aaa"
                value={amountReceived}
                onChangeText={setAmountReceived}
              />

              {/* Change */}
              <View style={[
                styles.changeBox,
                change >= 0 ? styles.changeBoxPositive : styles.changeBoxNegative
              ]}>
                <Text style={styles.changeLabel}>Change</Text>
                <Text style={[
                  styles.changeValue,
                  change >= 0 ? styles.changePositive : styles.changeNegative
                ]}>
                  {amountReceived === '' ? '—' : change >= 0 ? formatCurrency(change) : `Short by ${formatCurrency(Math.abs(change))}`}
                </Text>
              </View>
            </>
          )}

          {/* Non-cash message */}
          {!isCash && (
            <View style={styles.nonCashBox}>
              <Text style={styles.nonCashText}>
                💡 No change calculation needed for {payment.toUpperCase()} payments.
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>✓ Confirm</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 400, backgroundColor: COLORS.white,
    borderRadius: 20, padding: 24, elevation: 12,
  },
  title: {
    fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 13, color: COLORS.textLight, marginBottom: 20,
  },
  totalBox: {
    backgroundColor: '#f0f4ff', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14, fontWeight: '600', color: COLORS.textLight,
  },
  totalValue: {
    fontSize: 22, fontWeight: 'bold', color: COLORS.primary,
  },
  inputLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.textLight,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  input: {
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12,
    padding: 14, fontSize: 20, fontWeight: 'bold', color: COLORS.text,
    marginBottom: 16, textAlign: 'center',
  },
  changeBox: {
    borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  changeBoxPositive: { backgroundColor: '#d9f0e3' },
  changeBoxNegative: { backgroundColor: '#ffe5e5' },
  changeLabel: {
    fontSize: 14, fontWeight: '600', color: COLORS.text,
  },
  changeValue: {
    fontSize: 20, fontWeight: 'bold',
  },
  changePositive: { color: '#1D6B3A' },
  changeNegative: { color: COLORS.danger },
  nonCashBox: {
    backgroundColor: '#f0f4ff', borderRadius: 12,
    padding: 16, marginBottom: 20,
  },
  nonCashText: {
    fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20,
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: COLORS.danger, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  cancelText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 1, backgroundColor: COLORS.success, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  confirmText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});