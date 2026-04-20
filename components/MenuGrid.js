import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import MenuItem from './MenuItem';
import { MENU_ITEMS } from '../constants';

export default function MenuGrid({ onSelectItem }) {
  return (
    <FlatList
      data={MENU_ITEMS}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      renderItem={({ item }) => (
        <MenuItem item={item} onPress={onSelectItem} />
      )}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingBottom: 8,
  },
});