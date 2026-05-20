import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView, Switch,
} from 'react-native';
import { COLORS } from '../constants';
import { fetchAdminMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../utils/api';

const CATEGORIES = ['Drinks', 'Food', 'Snacks', 'Desserts', 'Others'];
const EMPTY_FORM = {
  name: '', image_name: '', category: 'Drinks',
  stock: '100', status: 'active', sizes: [{ size: 'Medium', price: '' }],
};

export default function AdminPanel({ onMenuUpdated }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // item being edited
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminMenu();
      setItems(data);
    } catch {
      Alert.alert('Error', 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      image_name: item.image_name || '',
      category: item.category || 'Drinks',
      stock: String(item.stock ?? 0),
      status: item.status || 'active',
      sizes: item.sizes.length > 0
        ? item.sizes.map(s => ({ size: s.size, price: String(s.price) }))
        : [{ size: 'Medium', price: '' }],
    });
    setShowForm(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Item',
      `Delete "${item.name}"? This will also remove all its size/price data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteMenuItem(item.id);
              if (res.success) { load(); onMenuUpdated(); }
              else Alert.alert('Error', 'Failed to delete item.');
            } catch { Alert.alert('Error', 'Failed to delete item.'); }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Item name is required.');
      return;
    }
    const validSizes = form.sizes.filter(s => s.size.trim() && s.price !== '' && !isNaN(Number(s.price)));
    if (validSizes.length === 0) {
      Alert.alert('Validation', 'At least one valid size with a price is required.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      image_name: form.image_name.trim(),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      status: form.status,
      sizes: validSizes.map(s => ({ size: s.size.trim(), price: parseFloat(s.price) })),
    };
    setSaving(true);
    try {
      const res = editing
        ? await updateMenuItem(editing.id, payload)
        : await addMenuItem(payload);
      if (res.success) {
        setShowForm(false);
        load();
        onMenuUpdated();
        Alert.alert('✔ Saved', editing ? 'Item updated.' : 'Item added.');
      } else {
        Alert.alert('Error', res.message || 'Save failed.');
      }
    } catch {
      Alert.alert('Error', 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  // Size row management
  const addSizeRow = () =>
    setForm(f => ({ ...f, sizes: [...f.sizes, { size: '', price: '' }] }));

  const removeSizeRow = (idx) =>
    setForm(f => ({ ...f, sizes: f.sizes.filter((_, i) => i !== idx) }));

  const updateSizeRow = (idx, field, val) =>
    setForm(f => ({
      ...f,
      sizes: f.sizes.map((s, i) => i === idx ? { ...s, [field]: val } : s),
    }));

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <View style={styles.itemTop}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.itemMeta}>
          📂 {item.category}  •  📦 Stock: {item.stock}
        </Text>
        <Text style={styles.itemSizes}>
          {item.sizes.map(s => `${s.size}: ₱${Number(s.price).toFixed(2)}`).join('  |  ')}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.delBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showForm) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formHeader}>
          <Text style={styles.sectionTitle}>{editing ? '✏️ Edit Item' : '➕ Add Item'}</Text>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Text style={styles.cancelLink}>✕ Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
            placeholder="e.g. Matcha Latte"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image Name</Text>
          <TextInput
            style={styles.input}
            value={form.image_name}
            onChangeText={v => setForm(f => ({ ...f, image_name: v }))}
            placeholder="e.g. matcha (without extension)"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.hint}>
            Must match a key in the IMAGE_MAP in MenuItem.js
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, form.category === cat && styles.catBtnActive]}
                  onPress={() => setForm(f => ({ ...f, category: cat }))}
                >
                  <Text style={[styles.catText, form.category === cat && styles.catTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Initial Stock</Text>
          <TextInput
            style={styles.input}
            value={form.stock}
            onChangeText={v => setForm(f => ({ ...f, stock: v }))}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Status: {form.status === 'active' ? '✅ Active' : '🔴 Inactive'}</Text>
            <Switch
              value={form.status === 'active'}
              onValueChange={v => setForm(f => ({ ...f, status: v ? 'active' : 'inactive' }))}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.sizesHeader}>
            <Text style={styles.label}>Sizes & Prices *</Text>
            <TouchableOpacity onPress={addSizeRow} style={styles.addSizeBtn}>
              <Text style={styles.addSizeBtnText}>+ Add Size</Text>
            </TouchableOpacity>
          </View>
          {form.sizes.map((s, idx) => (
            <View key={idx} style={styles.sizeRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={s.size}
                onChangeText={v => updateSizeRow(idx, 'size', v)}
                placeholder="e.g. Small"
                placeholderTextColor={COLORS.textMuted}
              />
              <TextInput
                style={[styles.input, { width: 90 }]}
                value={s.price}
                onChangeText={v => updateSizeRow(idx, 'price', v)}
                placeholder="₱0.00"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textMuted}
              />
              {form.sizes.length > 1 && (
                <TouchableOpacity onPress={() => removeSizeRow(idx)} style={styles.removeSizeBtn}>
                  <Text style={styles.removeSizeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.saveBtnText}>{editing ? '💾 Update Item' : '✅ Add Item'}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>⚙️ Menu Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No menu items found.</Text>
            </View>
          }
        />
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
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  cancelLink: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  addBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
  },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  itemCard: {
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 12, backgroundColor: COLORS.background,
    flexDirection: 'row', alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusActive: { backgroundColor: '#dcfce7' },
  statusInactive: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  itemMeta: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  itemSizes: { fontSize: 11, color: COLORS.textLight },
  itemActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 8,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  delBtn: {
    backgroundColor: '#fee2e2', paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 8,
  },
  delBtnText: { fontSize: 14 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  hint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  catBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  catTextActive: { color: COLORS.white },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sizesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addSizeBtn: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8,
  },
  addSizeBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  sizeRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  removeSizeBtn: {
    backgroundColor: '#fee2e2', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  removeSizeText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 24,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
