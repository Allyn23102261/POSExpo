import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { fetchOrders, deleteOrder } from '../utils/api';
import { formatCurrency } from '../utils/helpers';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const PAGE_SIZE = 10;

export default function OrderHistory({ isAdmin }) {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [filter, setFilter]     = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async (p = 1, f = filter, s = search) => {
    setLoading(true);
    try {
      const data = await fetchOrders({ filter: f, search: s, page: p, limit: PAGE_SIZE });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch (err) {
      Alert.alert('Error', 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(1, filter, search); }, [filter]);

  const handleSearch = () => load(1, filter, search);

  const handleDelete = (orderId) => {
    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete order #${orderId}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteOrder(orderId);
              if (res.success) {
                load(page, filter, search);
              } else {
                Alert.alert('Error', 'Failed to delete order.');
              }
            } catch {
              Alert.alert('Error', 'Failed to delete order.');
            }
          },
        },
      ]
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const renderOrder = ({ item }) => {
    const isOpen = expanded === item.id;
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded(isOpen ? null : item.id)} style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.orderDate}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>{item.payment}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.cardBody}>
            {(item.items || []).map((i, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{i.item_name} ({i.size})</Text>
                <Text style={styles.itemQty}>x{i.quantity}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(i.price * i.quantity)}</Text>
              </View>
            ))}
            {isAdmin && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtnText}>🗑 Delete Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📋 Order History</Text>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => { setFilter(f.value); setSearch(''); }}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Line */}
      <Text style={styles.summaryText}>
        {total} order{total !== 1 ? 's' : ''} found
        {filter ? ` (${filter})` : ''}
      </Text>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 24 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            disabled={page === 1}
            onPress={() => load(page - 1)}
          >
            <Text style={styles.pageBtnText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>Page {page} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
            disabled={page === totalPages}
            onPress={() => load(page + 1)}
          >
            <Text style={styles.pageBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.background, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  filterTextActive: { color: COLORS.white },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  searchInput: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  searchBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 14, justifyContent: 'center',
  },
  searchBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  summaryText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },
  card: {
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', backgroundColor: COLORS.white,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12,
    backgroundColor: COLORS.background,
  },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  orderId: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  orderDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  orderTotal: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  paymentBadge: {
    backgroundColor: COLORS.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 4,
  },
  paymentText: { fontSize: 10, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase' },
  cardBody: { padding: 12, gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemName: { flex: 1, fontSize: 13, color: COLORS.text },
  itemQty: { fontSize: 12, color: COLORS.textMuted, width: 30, textAlign: 'center' },
  itemPrice: { fontSize: 13, fontWeight: '600', color: COLORS.text, width: 80, textAlign: 'right' },
  deleteBtn: {
    marginTop: 8, backgroundColor: '#fee2e2', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  deleteBtnText: { color: '#dc2626', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  pagination: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 16,
  },
  pageBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 10,
  },
  pageBtnDisabled: { backgroundColor: COLORS.border },
  pageBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  pageInfo: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
});
