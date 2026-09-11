import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- Screen Imports (Placeholder paths, adjust as per your project structure) ---
// Auth Screens
// @ts-expect-error - TODO: [Missing routing module]
import LoginScreen from '../screens/auth/LoginScreen';
// @ts-expect-error - TODO: [Missing routing module]
import RegisterScreen from '../screens/auth/RegisterScreen';

// App Tabs Root Screens
// @ts-expect-error - TODO: [Missing routing module]
import DashboardScreen from '../screens/app/DashboardScreen';
// @ts-expect-error - TODO: [Missing routing module]
import WalletScreen from '../screens/app/WalletScreen';
// @ts-expect-error - TODO: [Missing routing module]
import PayFactorScreen from '../screens/app/PayFactorScreen';
// @ts-expect-error - TODO: [Missing routing module]
import LoadsScreen from '../screens/app/LoadsScreen';
// @ts-expect-error - TODO: [Missing routing module]
import ProfileScreen from '../screens/app/ProfileScreen';

// Drilldown Screens (Examples)
// @ts-expect-error - TODO: [Missing routing module]
import DashboardDetailScreen from '../screens/app/DashboardDetailScreen';
// @ts-expect-error - TODO: [Missing routing module]
import WalletDetailScreen from '../screens/app/WalletDetailScreen';
// @ts-expect-error - TODO: [Missing routing module]
import PayFactorDetailScreen from '../screens/app/PayFactorDetailScreen';
// @ts-expect-error - TODO: [Missing routing module]
import LoadsDetailScreen from '../screens/app/LoadsDetailScreen';
// @ts-expect-error - TODO: [Missing routing module]
import ProfileDetailScreen from '../screens/app/ProfileDetailScreen';

// --- Navigator Instances ---
const AuthStack = createNativeStackNavigator();
const AppTabs = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();
const PayFactorStack = createNativeStackNavigator();
const LoadsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator(); // This will host AuthStack or AppTabs

// --- Auth Context (Simplified Placeholder for demonstration) ---
// In a production app, you would typically use a global AuthContext
// managed by React Context API, Redux, or a similar state management solution.
const AuthContext = React.createContext<{ signIn: (token: string) => Promise<void>; signOut: () => void; userToken: string | null } | null>(null);

// --- Individual Tab Stack Navigators for Drilldown ---

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: true }}>
      <DashboardStack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <DashboardStack.Screen
        name="DashboardDetail"
        component={DashboardDetailScreen}
        options={{ title: 'Detail' }}
      />
    </DashboardStack.Navigator>
  );
}

function WalletStackScreen() {
  return (
    <WalletStack.Navigator screenOptions={{ headerShown: true }}>
      <WalletStack.Screen
        name="WalletHome"
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <WalletStack.Screen
        name="WalletDetail"
        component={WalletDetailScreen}
        options={{ title: 'Transaction Details' }}
      />
    </WalletStack.Navigator>
  );
}

function PayFactorStackScreen() {
  return (
    <PayFactorStack.Navigator screenOptions={{ headerShown: true }}>
      <PayFactorStack.Screen
        name="PayFactorHome"
        component={PayFactorScreen}
        options={{ title: 'PayFactor' }}
      />
      <PayFactorStack.Screen
        name="PayFactorDetail"
        component={PayFactorDetailScreen}
        options={{ title: 'Calculation Details' }}
      />
    </PayFactorStack.Navigator>
  );
}

function LoadsStackScreen() {
  return (
    <LoadsStack.Navigator screenOptions={{ headerShown: true }}>
      <LoadsStack.Screen
        name="LoadsHome"
        component={LoadsScreen}
        options={{ title: 'Loads' }}
      />
      <LoadsStack.Screen
        name="LoadsDetail"
        component={LoadsDetailScreen}
        options={{ title: 'Load Details' }}
      />
    </LoadsStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: true }}>
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Edit Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

// --- Main App Tabs Navigator ---
function AppTabsNavigator() {
  return (
    <AppTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'PayFactor':
              iconName = focused ? 'calculator' : 'calculator-outline'; // Using calculator for financial factor
              break;
            case 'Loads':
              iconName = focused ? 'cube' : 'cube-outline'; // Using cube for loads/inventory/items
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'alert-circle-outline'; // Fallback icon
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF', // Example PaySurity brand color
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Hide the main tab navigator header as individual stacks will have their own
      })}
    >
      <AppTabs.Screen name="Dashboard" component={DashboardStackScreen} />
      <AppTabs.Screen name="Wallet" component={WalletStackScreen} />
      <AppTabs.Screen name="PayFactor" component={PayFactorStackScreen} />
      <AppTabs.Screen name="Loads" component={LoadsStackScreen} />
      <AppTabs.Screen name="Profile" component={ProfileStackScreen} />
    </AppTabs.Navigator>
  );
}

// --- Auth Stack Navigator ---
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// --- Root App Navigator with Auth Gate ---
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null); // State to hold authentication token

  // Simulate checking for a user token on app start (e.g., from AsyncStorage)
  useEffect(() => {
    const bootstrapAsync = async () => {
      let retrievedUserToken: string | null = null;
      // In a real application, you would retrieve the token from secure storage here
      // Example:
      // try {
      //   retrievedUserToken = await AsyncStorage.getItem('userToken');
      // } catch (e) {
      //   // Handle error retrieving token
      //   console.error("Failed to retrieve auth token", e);
      // }
      
      // Simulate an asynchronous operation (e.g., API call or storage lookup)
      setTimeout(() => {
        // For testing, uncomment the line below to simulate a logged-in user:
        // retrievedUserToken = 'some-dummy-auth-token'; 
        setUserToken(retrievedUserToken);
        setIsLoading(false);
      }, 1000); // Simulate 1 second loading time
    };

    bootstrapAsync();
  }, []);

  // Auth context value for signIn and signOut operations
  const authContext = React.useMemo(
    () => ({
      signIn: async (token: string) => {
        // In a real app, you would save the token to secure storage after successful login
        setUserToken(token);
        // Example: await AsyncStorage.setItem('userToken', token);
      },
      signOut: () => {
        // In a real app, you would remove the token from secure storage
        setUserToken(null);
        // Example: await AsyncStorage.removeItem('userToken');
      },
      userToken,
    }),
    [userToken]
  );

  if (isLoading) {
    // We haven't finished checking for the token yet,
    // so we can render a loading screen or splash screen.
    return null; // Or <SplashScreen /> component
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            // No token found, user is not signed in, show Auth stack
            <RootStack.Screen
              name="Auth"
              component={AuthStackNavigator}
              options={{ animationTypeForReplace: 'pop' }} // Smooth transition when going from app to auth
            />
          ) : (
            // User is signed in, show Main App Tabs
            <RootStack.Screen
              name="App"
              component={AppTabsNavigator}
              options={{ animationTypeForReplace: 'push' }} // Smooth transition when going from auth to app
            />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}