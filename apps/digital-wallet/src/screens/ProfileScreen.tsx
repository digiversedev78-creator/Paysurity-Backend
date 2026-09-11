import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define the StackParamList specific to this file's context.
// In a real application, this would typically be imported from a central navigation configuration.
type StackParamList = {
  Profile: undefined;
  Wallet: undefined;
  Loyalty: undefined;
  ChangePassword: undefined;
  Login: undefined; // Assuming there's a Login screen for logout redirection
  // Add other routes as needed by the application
};

type UserInfo = {
  name: string;
  email: string;
  phone?: string;
  biometricEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<StackParamList, 'Profile'>>();

  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [editingUserInfo, setEditingUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // For initial data fetch and profile update
  const [error, setError] = useState<string | null>(null);

  // States for specific actions to show individual loading indicators
  const [isUpdatingBiometric, setIsUpdatingBiometric] = useState(false);
  const [isUpdatingPushNotifications, setIsUpdatingPushNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real application, this fetch would typically include authentication headers.
      const response = await fetch('/api/profile');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile data.');
      }
      const data: UserInfo = await response.json();
      setUserInfo(data);
      setEditingUserInfo(data); // Initialize editing form with fetched data
      setBiometricEnabled(data.biometricEnabled ?? false); // Default to false if not provided
      setPushNotificationsEnabled(data.pushNotificationsEnabled ?? true); // Default to true if not provided
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      Alert.alert('Error', err.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if necessary
        },
        body: JSON.stringify({
          name: editingUserInfo.name,
          email: editingUserInfo.email,
          phone: editingUserInfo.phone, // Include phone if it exists
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const updatedData: UserInfo = await response.json(); // Assuming API returns updated user info
      setUserInfo(updatedData);
      setEditingUserInfo(updatedData); // Sync editing form with successfully updated data
      setIsEditing(false); // Exit editing mode
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleToggleBiometrics = async (newValue: boolean) => {
    setBiometricEnabled(newValue); // Optimistic update
    setIsUpdatingBiometric(true);
    try {
      const response = await fetch('/api/profile/biometrics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header
        },
        body: JSON.stringify({ enabled: newValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update biometric settings.');
      }
      // If server returns updated state, use that, otherwise trust optimistic update.
      // For simplicity, we'll trust the optimistic update here.
      Alert.alert('Success', `Biometric login ${newValue ? 'enabled' : 'disabled'}.`);
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Error', error.message || 'Failed to update biometric settings.');
      setBiometricEnabled(!newValue); // Revert on error
      setError(error.message);
    } finally {
      setIsUpdatingBiometric(false);
    }
  };

  const handleTogglePushNotifications = async (newValue: boolean) => {
    setPushNotificationsEnabled(newValue); // Optimistic update
    setIsUpdatingPushNotifications(true);
    try {
      const response = await fetch('/api/profile/push-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header
        },
        body: JSON.stringify({ enabled: newValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update push notification settings.');
      }
      Alert.alert('Success', `Push notifications ${newValue ? 'enabled' : 'disabled'}.`);
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Error', error.message || 'Failed to update push notification settings.');
      setPushNotificationsEnabled(!newValue); // Revert on error
      setError(error.message);
    } finally {
      setIsUpdatingPushNotifications(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Invalidate session on backend
              const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Add authorization header
              });

              if (!response.ok) {
                // Log the warning but proceed with client-side logout as server might be unreachable
                console.warn('Server logout failed, but proceeding with client-side logout.');
              }

              // Clear local authentication state (e.g., remove token from AsyncStorage or global state)
              // This is a placeholder, actual implementation would depend on the authentication method.
              // For example: await AsyncStorage.removeItem('userToken');

              // Navigate to Login screen and reset navigation stack to prevent back navigation to profile
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err: unknown) {
              const error = err as Error;
              Alert.alert('Error', 'Failed to log out. Please try again.');
              setError(error.message);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const navigateToWallet = () => {
    navigation.navigate('Wallet');
  };

  const navigateToLoyalty = () => {
    navigation.navigate('Loyalty');
  };

  if (isLoading && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>My Profile</Text>

      {error && !isLoading && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}

      {/* User Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Account Information</Text>
        <View style={styles.userInfoRow}>
          <Text style={styles.label}>Name:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editingUserInfo.name}
              onChangeText={(text) => setEditingUserInfo({ ...editingUserInfo, name: text })}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.value}>{userInfo.name}</Text>
          )}
        </View>

        <View style={styles.userInfoRow}>
          <Text style={styles.label}>Email:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editingUserInfo.email}
              onChangeText={(text) => setEditingUserInfo({ ...editingUserInfo, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />
          ) : (
            <Text style={styles.value}>{userInfo.email}</Text>
          )}
        </View>

        <View style={styles.userInfoRow}>
          <Text style={styles.label}>Phone:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editingUserInfo.phone || ''}
              onChangeText={(text) => setEditingUserInfo({ ...editingUserInfo, phone: text })}
              keyboardType="phone-pad"
              placeholder="Enter your phone number (optional)"
            />
          ) : (
            <Text style={styles.value}>{userInfo.phone || 'N/A'}</Text>
          )}
        </View>

        {isEditing ? (
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => {
            setEditingUserInfo(userInfo); // Ensure editing form is initialized with current user info
            setIsEditing(true);
          }}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Security</Text>

        <TouchableOpacity style={styles.optionRow} onPress={handleChangePassword}>
          <Text style={styles.optionText}>Change Password</Text>
          <Text style={styles.arrowIcon}>&gt;</Text>
        </TouchableOpacity>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Biometric Login</Text>
          {isUpdatingBiometric ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={biometricEnabled ? '#007bff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleBiometrics}
              value={biometricEnabled}
              disabled={isUpdatingBiometric}
            />
          )}
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Preferences</Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Push Notifications</Text>
          {isUpdatingPushNotifications ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={pushNotificationsEnabled ? '#007bff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleTogglePushNotifications}
              value={pushNotificationsEnabled}
              disabled={isUpdatingPushNotifications}
            />
          )}
        </View>
      </View>

      {/* Quick Access Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Quick Access</Text>
        <TouchableOpacity style={styles.optionRow} onPress={navigateToWallet}>
          <Text style={styles.optionText}>My Wallet</Text>
          <Text style={styles.arrowIcon}>&gt;</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={navigateToLoyalty}>
          <Text style={styles.optionText}>My Loyalty</Text>
          <Text style={styles.arrowIcon}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.button, styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Logout</Text>
        )}
      </TouchableOpacity>
      <View style={{ height: 50 }} /> {/* Spacer for bottom content */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    width: 80, // Fixed width for labels
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    fontSize: 16,
    color: '#333',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Allow text to take up space
  },
  arrowIcon: {
    fontSize: 18,
    color: '#999',
    marginLeft: 10,
  },
});

export default ProfileScreen;