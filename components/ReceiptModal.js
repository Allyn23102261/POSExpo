import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Print from 'expo-print';
import { COLORS } from '../constants';
import { formatCurrency, calcSubtotal } from '../utils/helpers';

export default function ReceiptModal({ visible, cart, payment, timestamp, amountReceived, onConfirm, onClose }) {
  const total = calcSubtotal(cart);
  const change = amountReceived - total;

  const buildPrintHtml = () => {
    const itemRows = cart.map((i) =>
      `<tr><td>${i.name} ${i.size}oz x${i.quantity}</td>
       <td style="text-align:right">${formatCurrency(i.price * i.quantity)}</td></tr>`
    ).join('');
    return `<html><body style="font-family:monospace;font-size:14px;padding:20px;">
      <h2 style="text-align:center;">☕ THANIN CO</h2>
      <p style="text-align:center;color:#666;">${timestamp}</p><hr/>
      <table width="100%">${itemRows}</table><hr/>
      <table width="100%">
        <tr><td><b>TOTAL</b></td><td style="text-align:right"><b>${formatCurrency(total)}</b></td></tr>
        ${payment === 'cash' ? `
        <tr><td>Amount Received</td><td style="text-align:right">${formatCurrency(amountReceived)}</td></tr>
        <tr><td><b>Change</b></td><td style="text-align:right"><b>${formatCurrency(change)}</b></td></tr>
        ` : ''}
      </table>
      <p style="text-align:center;margin-top:20px;">Payment: ${payment.toUpperCase()}</p>
      <p style="text-align:center;">Thank you! ★★★★★</p>
    </body></html>`;
  };

  const handlePrint = async () => {
    try { await Print.printAsync({ html: buildPrintHtml() }); }
    catch (err) { console.warn('Print error:', err); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.heading}>🧾 Receipt</Text>
          <ScrollView style={styles.receiptScroll}>
            <View style={styles.receiptHeader}>
              <Text style={styles.shopName}>☕ THANIN CO</Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <View style={styles.divider} />
            {cart.map((item) => (
              <View key={item.id} style={styles.receiptRow}>
                <Text style={styles.receiptItem}>
                  {item.name} {item.size}oz ×{item.quantity}
                </Text>
                <Text style={styles.receiptItemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptTotal}>TOTAL</Text>
              <Text style={styles.receiptTotal}>{formatCurrency(total)}</Text>
            </View>
            {payment === 'cash' && (
              <>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptItem}>Amount Received</Text>
                  <Text style={styles.receiptItemPrice}>
                    {formatCurrency(amountReceived)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptChange}>Change</Text>
                  <Text style={styles.receiptChange}>{formatCurrency(change)}</Text>
                </View>
              </>
            )}
            <Text style={styles.paymentLine}>
              Payment: {payment.toUpperCase()}
            </Text>
            <Text style={styles.thankYou}>
              Thank you for your purchase!{'\n'}★★★★★
            </Text>
          </ScrollView>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Text style={styles.btnText}>🖨️ Print</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.btnText}>✓ Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    elevation: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  receiptScroll: {
    maxHeight: 320,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  shopName: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
  },
  timestamp: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  receiptItem: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
  },
  receiptItemPrice: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'right',
  },
  receiptTotal: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.primaryDark,
  },
  receiptChange: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1D6B3A',
  },
  paymentLine: {
    fontFamily: 'monospace',
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 10,
  },
  thankYou: {
    fontFamily: 'monospace',
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  printBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});