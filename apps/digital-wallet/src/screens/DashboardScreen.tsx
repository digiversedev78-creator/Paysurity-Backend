import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  WalletHome: undefined;
  Profile: undefined;
  Orders: undefined;
};

interface Transaction {
  id: string; title: string; date: string; amount: number; type: 'debit' | 'credit';
}

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const auth = useContext(AuthContext);

  const [balance, setBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading native wallet data instead of legacy driver loads
    const loadWalletData = async () => {
      setLoading(true);
      setTimeout(() => {
        setBalance(145.20);
        setLoyaltyPoints(1250);
        setTransactions([
          { id: '1', title: 'House of Biryani', date: 'Today, 12:30 PM', amount: 24.50, type: 'debit' },
          { id: '2', title: 'BistroBeast Deposit', date: 'Yesterday', amount: 50.00, type: 'credit' },
          { id: '3', title: 'Coffee Stop', date: 'Oct 24', amount: 5.40, type: 'debit' },
        ]);
        setLoading(false);
      }, 800);
    };
    loadWalletData();
  }, [auth?.tenantId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Syncing Wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{auth?.consumerPhone || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
           <Ionicons name="person" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Main Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Scan', 'Ready to scan POS QR Code.')}>
            <Ionicons name="qr-code-outline" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Add Funds', 'Link Bank Account.')}>
            <Ionicons name="add-circle-outline" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('WalletHome' as any)}>
             <Ionicons name="card-outline" size={24} color="#FFF" />
             <Text style={styles.actionBtnText}>Cards</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loyalty & Rewards Summary */}
      <View style={styles.loyaltyCard}>
        <View style={styles.loyaltyLeft}>
           <Ionicons name="star" size={24} color="#F59E0B" />
           <View style={{ marginLeft: 12 }}>
             <Text style={styles.loyaltyTitle}>PaySurity Rewards</Text>
             <Text style={styles.loyaltyDetail}>{loyaltyPoints} Points Available</Text>
           </View>
        </View>
        <TouchableOpacity style={styles.redeemBtn}>
          <Text style={styles.redeemBtnText}>Redeem</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
           <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.txList}>
        {transactions.map(tx => (
          <View key={tx.id} style={styles.txItem}>
             <View style={styles.txIconBox}>
                <Ionicons name={tx.type === 'debit' ? 'restaurant-outline' : 'wallet-outline'} size={20} color="#94A3B8" />
             </View>
             <View style={styles.txInfo}>
               <Text style={styles.txTitle}>{tx.title}</Text>
               <Text style={styles.txDate}>{tx.date}</Text>
             </View>
             <Text style={[styles.txAmount, tx.type === 'credit' && styles.txCredit]}>
               {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
             </Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14, fontFamily: 'Inter_500Medium' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20, marginBottom: 24
  },
  greeting: { fontSize: 14, color: '#94A3B8', fontFamily: 'Inter_400Regular' },
  userName: { fontSize: 20, color: '#F8FAFC', fontFamily: 'Inter_700Bold', marginTop: 4 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155'
  },
  balanceCard: {
    backgroundColor: '#1E293B', borderRadius: 20, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  balanceLabel: { fontSize: 14, color: '#94A3B8', fontFamily: 'Inter_500Medium', marginBottom: 8 },
  balanceAmount: { fontSize: 40, color: '#F8FAFC', fontFamily: 'Inter_700Bold', marginBottom: 24 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionBtnText: { color: '#F8FAFC', fontSize: 13, marginTop: 8, fontFamily: 'Inter_500Medium' },
  loyaltyCard: {
    flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16,
    alignItems: 'center', justifyContent: 'space-between', marginBottom: 24
  },
  loyaltyLeft: { flexDirection: 'row', alignItems: 'center' },
  loyaltyTitle: { fontSize: 15, color: '#92400E', fontFamily: 'Inter_600SemiBold' },
  loyaltyDetail: { fontSize: 13, color: '#B45309', fontFamily: 'Inter_400Regular', marginTop: 2 },
  redeemBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  redeemBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, color: '#F8FAFC', fontFamily: 'Inter_600SemiBold' },
  seeAllText: { fontSize: 14, color: '#3B82F6', fontFamily: 'Inter_500Medium' },
  txList: { backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  txItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155'
  },
  txIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 15, color: '#F8FAFC', fontFamily: 'Inter_500Medium' },
  txDate: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_400Regular', marginTop: 4 },
  txAmount: { fontSize: 15, color: '#F8FAFC', fontFamily: 'Inter_600SemiBold' },
  txCredit: { color: '#10B981' }
});