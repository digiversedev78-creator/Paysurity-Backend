'use strict';

import React, { useState, useEffect, useMemo, createContext, useCallback } from 'react';
import {
  Text, View, ActivityIndicator, StyleSheet, Platform, Alert,
  TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';


// ── Screen Imports ──────────────────────────────────────────
import WalletScreen from './src/screens/WalletScreen';
import EmployerWalletScreen from './src/screens/EmployerWalletScreen';
import ParentWalletScreen from './src/screens/ParentWalletScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';

// ── API Configuration ───────────────────────────────────────
import { CONFIG } from './src/config';
export const API_BASE = CONFIG.API_BASE;

// ── Push Token Registration — NOT-G1 fix ────────────────────
// Mobile must register Expo push token with backend after every login.
// Backend stores in user_push_tokens table for the NOT engine to dispatch
// wallet credit/debit alerts, payroll notifications, etc.
async function registerExpoTokenWithBackend(accessToken: string): Promise<void> {
  try {
    // Dynamically import to avoid crashing on web
    const Notifications = await import('expo-notifications').catch(() => null);
    if (!Notifications) return; // web/unsupported
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;

    await fetch(`${API_BASE}/notifications/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ expoPushToken }),
    });
  } catch (err) {
    // Non-fatal — push is optional; app still functions without it
    console.warn('[NOT] Push token registration skipped:', err);
  }
}

// ── Biometric Auth Hook — SEC-G5 fix ────────────────────────
// Used to unlock app (Face ID / Touch ID) before showing wallet balance.
// Called from DashboardScreen and WalletScreen on app foreground.
export async function tryBiometricAuth(): Promise<boolean> {
  try {
    const LocalAuth = await import('expo-local-authentication').catch(() => null);
    if (!LocalAuth) return true; // not available on web
    const hasHardware = await LocalAuth.hasHardwareAsync();
    if (!hasHardware) return true; // device doesn't support biometrics — allow through
    const isEnrolled = await LocalAuth.isEnrolledAsync();
    if (!isEnrolled) return true; // user hasn't set up biometrics — allow through
    const result = await LocalAuth.authenticateAsync({
      promptMessage: 'Unlock PaySurity Wallet',
      cancelLabel: 'Use PIN',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return true; // fail open — biometrics is UX enhancement, not sole gate
  }
}


// ── Auth Context ────────────────────────────────────────────
export interface AuthContextType {
  userToken: string | null;
  walletId?: string;
  tenantId: string;
  consumerPhone: string;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Navigation Types ────────────────────────────────────────
const Tab = createBottomTabNavigator();
const WalletStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// ── Wallet Stack (Wallet → Employer → Parent) ───────────────
function WalletStackNavigator() {
  return (
    <WalletStack.Navigator
      id="WalletStack"
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
      }}
    >
      <WalletStack.Screen
        name="WalletHome"
        component={WalletScreen}
        options={{ title: 'My Wallet' }}
      />
      <WalletStack.Screen
        name="EmployerWallet"
        component={EmployerWalletScreen}
        options={{ title: 'Employer Wallet' }}
      />
      <WalletStack.Screen
        name="ParentWallet"
        component={ParentWalletScreen}
        options={{ title: 'Family Wallet' }}
      />
      <WalletStack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ title: 'Scan to Pay' }}
      />
      <WalletStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: 'Transaction' }}
      />
    </WalletStack.Navigator>
  );
}

// ── Main Tab Navigator ──────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle-outline';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Wallet" component={WalletStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Login Screen ────────────────────────────────────────────
function LoginScreen({ navigation }: { navigation: any }) {
  const auth = React.useContext(AuthContext);
  const [phone, setPhone] = useState('+15551234567');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      // Call real backend auth endpoint
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          await auth.signIn(data.accessToken);
          return;
        }
      }
      // Fallback: backend unavailable in dev — use sandbox mode
      if (__DEV__) {
        console.warn('[DEV] Backend unreachable — using sandbox token');
        const sandboxToken = 'sandbox-dev-token';
        await auth.signIn(sandboxToken);
      } else {
        Alert.alert('Sign In Failed', 'Unable to connect. Please try again.');
      }
    } catch {
      if (__DEV__) {
        const sandboxToken = 'sandbox-dev-token';
        await auth.signIn(sandboxToken);
      } else {
        Alert.alert('Network Error', 'Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={loginStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={loginStyles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={loginStyles.logoContainer}>
          <View style={loginStyles.logoBadge}>
            <Text style={loginStyles.logoText}>P</Text>
          </View>
          <Text style={loginStyles.appName}>PaySurity</Text>
          <Text style={loginStyles.tagline}>Digital Wallet</Text>
        </View>

        {/* Phone Input */}
        <View style={loginStyles.inputGroup}>
          <Text style={loginStyles.label}>PHONE NUMBER</Text>
          <TextInput
            style={loginStyles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#475569"
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[loginStyles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={loginStyles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Text style={loginStyles.hint}>
          Sandbox Mode — press Sign In to continue
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoBadge: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  appName: {
    fontSize: 28, fontWeight: '700', color: '#F8FAFC',
    fontFamily: 'Inter_700Bold',
  },
  tagline: {
    fontSize: 14, color: '#64748B', marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  inputGroup: { width: '100%', marginBottom: 24 },
  label: {
    fontSize: 11, color: '#94A3B8', fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5, marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 16,
    fontSize: 17, color: '#F8FAFC', fontFamily: 'Inter_400Regular',
    borderWidth: 1, borderColor: '#334155',
  },
  button: {
    width: '100%', backgroundColor: '#3B82F6', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 16,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonText: {
    fontSize: 17, fontWeight: '700', color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  hint: {
    fontSize: 12, color: '#475569', textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});

// ── App Component ───────────────────────────────────────────
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });

  // On web, fonts may never resolve — set a timeout fallback
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => setFontTimedOut(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const fontsReady = fontsLoaded || fontTimedOut;

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          await SplashScreen.preventAutoHideAsync();
        }
      } catch {}
      setAppIsReady(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsReady && !isLoading) {
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync();
      }
    }
  }, [appIsReady, fontsReady, isLoading]);

  const authContextValue = useMemo<AuthContextType>(
    () => ({
      userToken,
      tenantId: 'houseofbiryanirestaurant',
      consumerPhone: '+15551234567',
      isLoading,
      signIn: async (token: string) => {
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
        // NOT-G1 fix: register push token whenever user authenticates
        // This ensures the backend can send wallet alerts to this device
        registerExpoTokenWithBackend(token);
      },
      signOut: async () => {
        const token = await AsyncStorage.getItem('userToken');
        // Deactivate push token on logout — prevents stale deliveries
        if (token) {
          try {
            const Notifications = await import('expo-notifications').catch(() => null);
            if (Notifications) {
              const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
              if (tokenData) {
                await fetch(`${API_BASE}/notifications/push-token/deactivate`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ expoPushToken: tokenData.data }),
                }).catch(() => {});
              }
            }
          } catch {}
        }
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
      },
    }),
    [userToken, isLoading],
  );


  if (!appIsReady || !fontsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: '#94A3B8', marginTop: 16, fontSize: 14 }}>Loading PaySurity…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authContextValue}>
        <NavigationContainer>
          {userToken ? <MainTabs /> : (
            <AuthStack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
              <AuthStack.Screen name="Login" component={LoginScreen} />
            </AuthStack.Navigator>
          )}
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}