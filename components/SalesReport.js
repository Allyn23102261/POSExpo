import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { COLORS } from '../constants';
import { fetchReportSummary } from '../utils/api';
import { formatCurrency } from '../utils/helpers';

const PERIODS = [
  { label: "Today",     value: "today" },
  { label: "This Week", value: "week"  },
  { label: "This Month",value: "month" },
];

export default function SalesReport() {
  const [period, setPeriod]   = useState('today');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(period); }, [period]);

  const load = async (p) => {
    setLoading(true);
    try {
      const res = await fetchReportSummary(p);
      setData(res);
    } catch {
      Alert.alert('Error', 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  // Simple bar chart drawn with View widths
  const BarChart = ({ items }) => {
    if (!items || items.length === 0)
      return <Text style={styles.noData}>No data yet.</Text>;
    const maxVal = Math.max(...items.map(i => parseFloat(i.revenue)));
    return (
      <View style={styles.chart}>
        {items.map((item, idx) => {
          const pct = maxVal > 0 ? (parseFloat(item.revenue) / maxVal) * 100 : 0;
          return (
            <View key={idx} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{item.date || item.item_name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.max(pct, 2)}%` }]} />
              </View>
              <Text style={styles.barValue}>{formatCurrency(item.revenue)}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Sales Report</Text>

      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodBtn, period === p.value && styles.periodBtnActive]}
            onPress={() => setPeriod(p.value)}
          >
            <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 24 }} />
      ) : !data ? null : (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Summary Cards */}
          <View style={styles.cardsRow}>
            <View style={[styles.card, styles.cardPrimary]}>
              <Text style={styles.cardLabel}>Total Revenue</Text>
              <Text style={styles.cardValue}>{formatCurrency(data.totals.revenue)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Orders</Text>
              <Text style={styles.cardValueDark}>{data.totals.order_count}</Text>
            </View>
          </View>

          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={styles.cardLabel}>Avg. Transaction</Text>
            <Text style={styles.cardValueDark}>{formatCurrency(data.totals.avg_transaction)}</Text>
          </View>

          {/* Payment Breakdown */}
          <Text style={styles.subTitle}>💳 Payment Breakdown</Text>
          {data.payment_breakdown.length === 0
            ? <Text style={styles.noData}>No data yet.</Text>
            : data.payment_breakdown.map((p, i) => (
              <View key={i} style={styles.rowItem}>
                <Text style={styles.rowItemLabel}>{p.payment}</Text>
                <View style={styles.rowItemRight}>
                  <Text style={styles.rowItemCount}>{p.count} orders</Text>
                  <Text style={styles.rowItemValue}>{formatCurrency(p.revenue)}</Text>
                </View>
              </View>
            ))
          }

          {/* Best Sellers */}
          <Text style={[styles.subTitle, { marginTop: 16 }]}>🏆 Best Sellers</Text>
          {data.best_sellers.length === 0
            ? <Text style={styles.noData}>No data yet.</Text>
            : data.best_sellers.map((b, i) => (
              <View key={i} style={styles.rowItem}>
                <Text style={styles.rankNum}>#{i + 1}</Text>
                <Text style={[styles.rowItemLabel, { flex: 1 }]}>{b.item_name}</Text>
                <View style={styles.rowItemRight}>
                  <Text style={styles.rowItemCount}>{b.units_sold} sold</Text>
                  <Text style={styles.rowItemValue}>{formatCurrency(b.revenue)}</Text>
                </View>
              </View>
            ))
          }

          {/* Daily Revenue Chart */}
          {data.daily_breakdown && data.daily_breakdown.length > 0 && (
            <>
              <Text style={[styles.subTitle, { marginTop: 16 }]}>📈 Daily Revenue</Text>
              <BarChart items={data.daily_breakdown} />
            </>
          )}
        </ScrollView>
      )}
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.background, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  periodBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  periodTextActive: { color: COLORS.white },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cardLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4, fontWeight: '600' },
  cardValue: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  cardValueDark: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  subTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  rowItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: 8,
  },
  rowItemLabel: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  rowItemRight: { alignItems: 'flex-end' },
  rowItemCount: { fontSize: 11, color: COLORS.textMuted },
  rowItemValue: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  rankNum: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, width: 24 },
  noData: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 8 },
  chart: { gap: 8, marginBottom: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 10, color: COLORS.textMuted, width: 60 },
  barTrack: {
    flex: 1, height: 14, backgroundColor: COLORS.background,
    borderRadius: 7, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 7 },
  barValue: { fontSize: 10, color: COLORS.text, fontWeight: '600', width: 72, textAlign: 'right' },
});
