import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { COLORS } from '../constants';
import { fetchInventory, restockItem } from '../utils/api';

const STOCK_COLORS = {
  ok:       { bg: '#dcfce7', text: '#16a34a', label: '✅ OK' },
  low:      { bg: '#fef9c3', text: '#ca8a04', label: '⚠️ Low' },
  critical: { bg: '#fee2e2', text: '#dc2626', label: '🔴 Critical' },
};

export default function InventoryPanel() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [restockAmt, setRestockAmt] = useState('');
  const [restocking, setRestocking] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchInventory();
      setItems(data);
    } catch {
      Alert.alert('Error', 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const openRestock = (item) => {
    setRestockId(item);
    setRestockAmt('');
  };

  const confirmRestock = async () => {
    if (!restockAmt || isNaN(restockAmt) || parseInt(restockAmt) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid positive number.');
      return;
    }
    setRestocking(true);
    try {
      const res = await restockItem(restockId.id, parseInt(restockAmt));
      if (res.success) {
        setRestockId(null);
        load();
        Alert.alert('✔ Restocked', `${restockId.name} now has ${res.new_stock} units.`);
      } else {
        Alert.alert('Error', res.message || 'Restock failed.');
      }
    } catch {
      Alert.alert('Error', 'Failed to restock item.');
    } finally {
      setRestocking(false);
    }
  };

  const lowCount = items.filter(i => i.stock_level === 'low' || i.stock_level === 'critical').length;
  const criticalCount = items.filter(i => i.stock_level === 'critical').length;

  const filtered = filterLevel === 'all'
    ? items
    : items.filter(i => i.stock_level === filterLevel);

  const renderItem = ({ item }) => {
    const level = STOCK_COLORS[item.stock_level] || STOCK_COLORS.ok;
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>📂 {item.category}</Text>
        </View>
        <View style={styles.itemRight}>
          <View style={[styles.stockBadge, { backgroundColor: level.bg }]}>
            <Text style={[styles.stockLabel, { color: level.text }]}>{level.label}</Text>
          </View>
          <Text style={[styles.stockQty, { color: level.text }]}>{item.stock} units</Text>
          <TouchableOpacity style={styles.restockBtn} onPress={() => openRestock(item)}>
            <Text style={styles.restockBtnText}>+ Restock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📦 Inventory</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Alert banners */}
      {criticalCount > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            🔴 {criticalCount} item{criticalCount !== 1 ? 's' : ''} critically low (≤5 units)!
          </Text>
        </View>
      )}
      {lowCount > criticalCount && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            ⚠️ {lowCount - criticalCount} item{(lowCount - criticalCount) !== 1 ? 's' : ''} running low (≤15 units).
          </Text>
        </View>
      )}

      {/* Filter */}
      <View style={styles.filterRow}>
        {['all', 'critical', 'low', 'ok'].map(level => (
          <TouchableOpacity
            key={level}
            style={[styles.filterBtn, filterLevel === level && styles.filterBtnActive]}
            onPress={() => setFilterLevel(level)}
          >
            <Text style={[styles.filterText, filterLevel === level && styles.filterTextActive]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No items found.</Text>
            </View>
          }
        />
      )}

      {/* Restock Modal */}
      <Modal
        visible={!!restockId}
        transparent
        animationType="fade"
        onRequestClose={() => setRestockId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📦 Restock Item</Text>
            <Text style={styles.modalSubtitle}>
              {restockId?.name} — Current stock: {restockId?.stock}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount to add"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={restockAmt}
              onChangeText={setRestockAmt}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRestockId(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, restocking && { opacity: 0.6 }]}
                onPress={confirmRestock}
                disabled={restocking}
              >
                {restocking
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.modalConfirmText}>+ Add Stock</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.background, borderRadius: 8 },
  refreshText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  alertBanner: {
    backgroundColor: '#fee2e2', borderRadius: 10, padding: 10,
    marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#dc2626',
  },
  alertText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  warnBanner: {
    backgroundColor: '#fef9c3', borderRadius: 10, padding: 10,
    marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#ca8a04',
  },
  warnText: { color: '#ca8a04', fontSize: 13, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  filterBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 8,
    backgroundColor: COLORS.background, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 11, fontWeight: '600', color: COLORS.textLight },
  filterTextActive: { color: COLORS.white },
  itemCard: {
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 12, backgroundColor: COLORS.background,
    flexDirection: 'row', alignItems: 'center',
  },
  itemLeft: { flex: 1 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  itemMeta: { fontSize: 11, color: COLORS.textMuted },
  stockBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  stockLabel: { fontSize: 11, fontWeight: '700' },
  stockQty: { fontSize: 14, fontWeight: '800' },
  restockBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  restockBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 24, width: '85%', shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  modalInput: {
    backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: COLORS.background, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: COLORS.textLight },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
