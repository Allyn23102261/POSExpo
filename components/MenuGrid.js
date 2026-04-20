import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import MenuItem from './MenuItem';

export default function MenuGrid({ menuItems, onSelectItem }) {
  return (
    <FlatList
      data={menuItems}
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
  grid: { paddingBottom: 8 },
});