import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import POSScreen from './screens/POSScreen';

export default function App() {
  const [user, setUser] = useState(null);

  // Called when user logs out — clears user state and returns to login
  const handleLogout = () => setUser(null);

  const content = user
    ? <POSScreen user={user} onLogout={handleLogout} />
    : <LoginScreen onLogin={setUser} />;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.mobileFrame}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrame: {
    width: 390,
    height: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
});
