import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import MenuGrid from '../components/MenuGrid';
import SizeModal from '../components/SizeModal';
import CartSummary from '../components/CartSummary';
import ReceiptModal from '../components/ReceiptModal';
import PaymentModal from '../components/PaymentModal';
import OrderHistoryItem from '../components/OrderHistoryItem';
import { COLORS } from '../constants';
import { generateOrderId, getTimestamp, calcSubtotal } from '../utils/helpers';
import { fetchMenu, saveOrder, fetchOrders } from '../utils/api';

export default function POSScreen() {
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [activeTab, setActiveTab] = useState('cart');
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptTimestamp, setReceiptTimestamp] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [amountReceived, setAmountReceived] = useState(0);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    loadMenu();
    loadOrders();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await fetchMenu();
      setMenuItems(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load menu. Is the server running?');
    }
  };

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrderHistory(data);
    } catch (err) {
      console.log('Failed to load orders:', err);
    }
  };

  const handleSelectMenuItem = (item) => {
    setSelectedMenuItem(item);
    setSizeModalVisible(true);
  };

  const handleSelectSize = (item, sizeOption) => {
    setSizeModalVisible(false);
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name && c.size === sizeOption.size);
      if (existing) {
        return prev.map((c) =>
          c.name === item.name && c.size === sizeOption.size
            ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { id: Date.now(), name: item.name, size: sizeOption.size, price: sizeOption.price, quantity: 1 }];
    });
  };

  const handleIncrease = (id) =>
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: c.quantity + 1 } : c));

  const handleDecrease = (id) =>
    setCart((prev) => {
      const item = prev.find((c) => c.id === id);
      if (item && item.quantity <= 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });

  const handleRemove = (id) => setCart((prev) => prev.filter((c) => c.id !== id));
  const handleClear = () => setCart([]);

  const handleCheckout = () => {
    if (cart.length === 0) { Alert.alert('Empty Cart', 'Please add items before checking out.'); return; }
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = (received) => {
    setAmountReceived(received);
    setPaymentModalVisible(false);
    setReceiptTimestamp(getTimestamp());
    setReceiptVisible(true);
  };

  const handleConfirmSale = async () => {
    const order = {
      id: generateOrderId(),
      items: [...cart],
      total: calcSubtotal(cart),
      payment: selectedPayment,
      amountReceived: amountReceived,
      change: amountReceived - calcSubtotal(cart),
      timestamp: receiptTimestamp,
    };
    try {
      await saveOrder(order);
      setOrderHistory((prev) => [order, ...prev].slice(0, 20));
      setCart([]);
      setReceiptVisible(false);
      Alert.alert('✔ Sale Completed', 'Thank you!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save order.');
    }
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Header />
          <MenuGrid menuItems={menuItems} onSelectItem={handleSelectMenuItem} />
          <View style={styles.tabsContainer}>
            <View style={styles.tabBar}>
              {['cart', 'history'].map((tab) => (
                <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab === 'cart' ? '🛒 Cart' : '📋 History'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {activeTab === 'cart' && (
              <CartSummary cart={cart} selectedPayment={selectedPayment} onSelectPayment={setSelectedPayment}
                onIncrease={handleIncrease} onDecrease={handleDecrease} onRemove={handleRemove}
                onClear={handleClear} onCheckout={handleCheckout} />
            )}
            {activeTab === 'history' && (
              <View style={styles.historyContainer}>
                {orderHistory.length === 0
                  ? <Text style={styles.emptyHistory}>No orders yet</Text>
                  : orderHistory.map((order) => <OrderHistoryItem key={order.id} order={order} />)
                }
              </View>
            )}
          </View>
        </ScrollView>

        <SizeModal visible={sizeModalVisible} item={selectedMenuItem} onSelect={handleSelectSize} onClose={() => setSizeModalVisible(false)} />

        <PaymentModal
          visible={paymentModalVisible}
          total={calcSubtotal(cart)}
          payment={selectedPayment}
          onConfirm={handlePaymentConfirm}
          onClose={() => setPaymentModalVisible(false)}
        />

        <ReceiptModal
          visible={receiptVisible}
          cart={cart}
          payment={selectedPayment}
          timestamp={receiptTimestamp}
          amountReceived={amountReceived}
          onConfirm={handleConfirmSale}
          onClose={() => setReceiptVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  tabsContainer: { marginTop: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, padding: 4, marginBottom: 12, elevation: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.white },
  historyContainer: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, minHeight: 100, elevation: 4 },
  emptyHistory: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});