import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, Alert, SafeAreaView,
  StatusBar, TouchableOpacity, Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import MenuGrid from '../components/MenuGrid';
import SizeModal from '../components/SizeModal';
import CartSummary from '../components/CartSummary';
import ReceiptModal from '../components/ReceiptModal';
import PaymentModal from '../components/PaymentModal';
import OrderHistory from '../components/OrderHistory';
import AdminPanel from '../components/AdminPanel';
import SalesReport from '../components/SalesReport';
import InventoryPanel from '../components/InventoryPanel';
import { COLORS } from '../constants';
import { generateOrderId, getTimestamp, calcSubtotal } from '../utils/helpers';
import { fetchMenu, saveOrder } from '../utils/api';

export default function POSScreen({ user, onLogout }) {
  const [cart, setCart] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [activeTab, setActiveTab] = useState('cart');
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptTimestamp, setReceiptTimestamp] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [amountReceived, setAmountReceived] = useState(0);
  const [menuItems, setMenuItems] = useState([]);

  const isAdmin = user?.role === 'admin';

  // Tabs available per role
  const cashierTabs = ['cart', 'history'];
  const adminTabs   = ['cart', 'history', 'admin', 'reports', 'inventory'];
  const tabs        = isAdmin ? adminTabs : cashierTabs;

  const TAB_LABELS = {
    cart:      '🛒 Cart',
    history:   '📋 History',
    admin:     '⚙️ Admin',
    reports:   '📊 Reports',
    inventory: '📦 Stock',
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await fetchMenu();
      setMenuItems(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load menu. Is the server running?');
    }
  };

  const handleSelectMenuItem = (item) => {
    // Check stock before allowing selection
    if (item.stock !== null && item.stock !== undefined && item.stock <= 0) {
      Alert.alert('Out of Stock', `"${item.name}" is currently out of stock.`);
      return;
    }
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
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          id: Date.now(),
          name: item.name,
          size: sizeOption.size,
          price: sizeOption.price,
          quantity: 1,
          image_name: item.image_name,
        },
      ];
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
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before checking out.');
      return;
    }
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = (received) => {
    setAmountReceived(received);
    setPaymentModalVisible(false);
    setReceiptTimestamp(getTimestamp());
    setReceiptVisible(true);
  };

  const handleConfirmSale = async () => {
    const subtotal = calcSubtotal(cart);
    const order = {
      id: generateOrderId(),
      items: [...cart],
      total: subtotal,
      payment: selectedPayment,
      amountReceived: amountReceived,
      change: amountReceived - subtotal,
      timestamp: receiptTimestamp,
    };
    try {
      const result = await saveOrder(order);
      if (!result.success) {
        Alert.alert('Error', result.message || 'Failed to save order.');
        return;
      }
      setCart([]);
      setReceiptVisible(false);
      // Refresh menu to get updated stock counts
      loadMenu();
      Alert.alert('✔ Sale Completed', 'Thank you!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save order. Please try again.');
    }
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with user info and logout */}
          <Header user={user} onLogout={onLogout} />

          {/* Menu grid (only shown on cart tab) */}
          {activeTab === 'cart' && (
            <MenuGrid menuItems={menuItems} onSelectItem={handleSelectMenuItem} />
          )}

          {/* Tab Bar */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabBarScroll}
              contentContainerStyle={styles.tabBar}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {TAB_LABELS[tab]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tab Content */}
            {activeTab === 'cart' && (
              <CartSummary
                cart={cart}
                selectedPayment={selectedPayment}
                onSelectPayment={setSelectedPayment}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                onClear={handleClear}
                onCheckout={handleCheckout}
              />
            )}

            {activeTab === 'history' && (
              <OrderHistory isAdmin={isAdmin} />
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminPanel onMenuUpdated={loadMenu} />
            )}

            {activeTab === 'reports' && isAdmin && (
              <SalesReport />
            )}

            {activeTab === 'inventory' && isAdmin && (
              <InventoryPanel />
            )}

            {/* Blocked tab — non-admin trying to access admin tab */}
            {(activeTab === 'admin' || activeTab === 'reports' || activeTab === 'inventory') && !isAdmin && (
              <View style={styles.blockedContainer}>
                <Text style={styles.blockedIcon}>🔒</Text>
                <Text style={styles.blockedText}>Admin access only.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <SizeModal
          visible={sizeModalVisible}
          item={selectedMenuItem}
          onSelect={handleSelectSize}
          onClose={() => setSizeModalVisible(false)}
        />

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
  tabBarScroll: { marginBottom: 12 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    elevation: 3,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.white },
  blockedContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 4,
  },
  blockedIcon: { fontSize: 40, marginBottom: 12 },
  blockedText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
