import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

export default function Header({ user, onLogout }) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.leftSection}>
        <Text style={styles.title}>☕ Thanin Co</Text>
        <Text style={styles.subtitle}>Premium Tea & Beverages</Text>
      </View>
      <View style={styles.rightSection}>
        {user && (
          <>
            <Text style={styles.userInfo}>
              👤 {user.username}
            </Text>
            <Text style={styles.roleLabel}>
              {user.role === 'admin' ? '🛡️ Admin' : '💼 Cashier'}
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  userInfo: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  roleLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
  },
  logoutBtn: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
