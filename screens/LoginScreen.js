import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://10.16.156.19:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        Alert.alert('Login Failed', 'Invalid username or password.');
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server. Is it running?');
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Text style={styles.headerTitle}>☕ Thanin Co</Text>
          <Text style={styles.headerSubtitle}>Premium Tea & Beverages</Text>
        </LinearGradient>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
              <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  header: {
    paddingVertical: 20, paddingHorizontal: 24, borderRadius: 16,
    marginBottom: 24, alignItems: 'center', elevation: 6,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24, elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: COLORS.text, marginBottom: 16, backgroundColor: COLORS.background,
  },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});