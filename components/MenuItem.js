import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils/helpers';

const IMAGE_MAP = {
  'lemongrass.png': require('../assets/lemongrass.png'),
  'peach.jpg': require('../assets/peach.jpg'),
  'frosty.jpg': require('../assets/frosty.jpg'),
};

export default function MenuItem({ item, onPress }) {
  const minPrice = Math.min(...item.sizes.map((s) => s.price));
  const maxPrice = Math.max(...item.sizes.map((s) => s.price));

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <Image source={IMAGE_MAP[item.image_name]} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>
          {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 0,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});