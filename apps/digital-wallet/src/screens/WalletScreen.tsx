import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ActivityIndicator,
  StyleSheet, Alert, SafeAreaView, Platform, TextInput, Modal,
  Pressable, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../../App';

// Import shared context & config from App
import { CONFIG } from '../config';
const API_BASE = CONFIG.API_BASE;

// ── Interfaces matching wallet_ledger schema (035_digital_wallets.sql) ──
interface WalletTransaction {
  id: string;
  tenant_id: string;
  wallet_id: string;
  transaction_type: string;    // e.g. LOAD_CARD, TRANSFER_IN, TRANSFER_OUT
  direction: 'C' | 'D';       // C = Credit, D = Debit
  amount_cents: number;        // integer cents
  balance_after_cents: number;
  reference_id?: string;
  reference_type?: string;
  description?: string;
  idempotency_key: string;
  status: string;
  created_at: string;
}

interface WalletBalanceResponse {
  tenantId: string;
  consumerPhone: string;
  assetType: string;
  balance: string;
}

// ── Config ──
const ASSET_TYPE = 'CASH';

const WalletScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const CONSUMER_PHONE = auth?.consumerPhone || '+15551234567';
  const DEMO_TOKEN = auth?.userToken || '';

  const navigation = useNavigation<any>();
  const [balance, setBalance] = useState<string>('0.00');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal state
  const [isTopupModalVisible, setIsTopupModalVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const [isQrReceiveVisible, setIsQrReceiveVisible] = useState(false);
  const [qrPayload, setQrPayload] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEMO_TOKEN}`,
  };

  const [walletId, setWalletId] = useState<string>('');

  // ── Fetch balance (Initialize canonical wallet from V1 API) ──
  const fetchBalance = useCallback(async () => {
    try {
      // POST init is idempotent and safely returns balance_cents
      const res = await fetch(`${API_BASE}/v1/wallets/init`, { 
        method: 'POST',
        headers: authHeaders 
      });
      if (res.ok) {
        const data = await res.json();
        setWalletId(data.id);
        const cents = isNaN(Number(data.balance_cents)) ? 0 : Number(data.balance_cents);
        setBalance((cents / 100).toFixed(2));
      } else {
        setBalance('0.00');
      }
    } catch (err) {
      console.warn('Wallet init failed:', err);
      setBalance('0.00');
    }
  }, []);

  // ── Fetch statement ──
  const fetchStatement = useCallback(async () => {
    if (!walletId) return; // wallet must be initialised first
    try {
      const res = await fetch(
        `${API_BASE}/v1/wallets/${walletId}/transactions?limit=50`,
        { headers: authHeaders },
      );
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn('Statement fetch failed:', err);
      setTransactions([]);
    }
  }, [walletId]);

  // ── Combined refresh ──
  // fetchBalance must complete first so walletId is set before fetchStatement runs.
  const loadAll = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      await fetchBalance();       // sets walletId in state
      await fetchStatement();     // uses walletId — runs after balance resolves
    } catch (err: any) {
      setError('Could not connect to PaySurity backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchBalance, fetchStatement, refreshing]);

  useEffect(() => { loadAll(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  // ── Request QR Code → POST /api/wallet/qr ──
  const requestQrCode = async () => {
    setIsQrReceiveVisible(true);
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/qr?phone=${encodeURIComponent(CONSUMER_PHONE)}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ amount: '0.00', recipientName: 'My Wallet' }),
      });
      if (res.ok) {
        const data = await res.json();
        setQrPayload(data.universalLink || data.qrPayload);
      }
    } catch (e) {
      console.warn('QR fetching err', e);
    } finally {
      setProcessing(false);
    }
  };

  // ── Top-up → POST /v1/wallets/fiat/fund ──
  const handleTopup = async () => {
    const amountNum = parseFloat(topupAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Enter a positive amount.');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/fiat/fund`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          consumerPhone: CONSUMER_PHONE,
          amount: amountNum.toString(),
          cardToken: 'tok_visa_demo', // Demo fluidpay card token
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const result = await res.json();
      Alert.alert('Top-Up Successful', `New balance: $${(result.newBalance / 100).toFixed(2)}`);
      setTopupAmount('');
      setIsTopupModalVisible(false);
      loadAll();
    } catch (e: unknown) {
      const error = e as Error;
      Alert.alert('Withdrawal Error', error.message || 'Failed to transfer to bank');
    } finally {
      setProcessing(false);
    }
  };

  // ── Transfer → POST /v1/wallets/:id/transfer ──
  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Enter a positive amount.');
      return;
    }
    if (!walletId) {
       Alert.alert('Not Bound', 'Wallet ID not initialized yet.');
       return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${walletId}/transfer`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          amountCents: Math.round(amount * 100),
          targetWalletId: transferRecipient.trim(), // Use recipient string as wallet UUID for demo
          idempotencyKey: `p2p_${Date.now()}`
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      Alert.alert('Transfer Successful', `$${amount.toFixed(2)} sent!`);
      setTransferAmount('');
      setTransferRecipient('');
      setIsTransferModalVisible(false);
      loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Transfer Failed', error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Helpers ──
  const fmt = (val: string | number) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
  };

  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return ts; }
  };

  // ── Transaction Row ──
  const renderTransaction = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.direction === 'C';
    const amountDollars = (item.amount_cents / 100).toFixed(2);
    const label = item.description || item.transaction_type || item.id;
    return (
      <TouchableOpacity onPress={() => navigation.navigate('TransactionDetail', { tx: item })} style={s.txRow}>
        <View style={[s.txIcon, { backgroundColor: isCredit ? '#065F4615' : '#B9131315' }]}>
          <Ionicons
            name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
            size={18}
            color={isCredit ? '#065F46' : '#B91313'}
          />
        </View>
        <View style={s.txDetails}>
          <Text style={s.txDesc} numberOfLines={1}>{label}</Text>
          <Text style={s.txDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={[s.txAmount, isCredit ? s.txCredit : s.txDebit]}>
          {isCredit ? '+' : '-'}${amountDollars}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Loading State ──
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={s.loadingWrap}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={s.loadingText}>Loading wallet…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Balance Card ── */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Available Balance</Text>
          <Text style={s.balanceValue}>{fmt(balance)}</Text>
          <Text style={s.balanceSub}>CASH · USD</Text>
        </View>

        {/* ── Quick Actions ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.actionsRow, { paddingHorizontal: 16, gap: 16, width: undefined, justifyContent: 'flex-start' }]} style={{ marginHorizontal: 0 }}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('QRScanner')}>
            <View style={[s.actionIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="scan" size={22} color="#10B981" />
            </View>
            <Text style={s.actionLabel}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={requestQrCode}>
            <View style={[s.actionIcon, { backgroundColor: '#EC489920' }]}>
              <Ionicons name="qr-code" size={22} color="#EC4899" />
            </View>
            <Text style={s.actionLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={() => setIsTopupModalVisible(true)}>
            <View style={[s.actionIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="add" size={22} color="#3B82F6" />
            </View>
            <Text style={s.actionLabel}>Top Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={() => setIsTransferModalVisible(true)}>
            <View style={[s.actionIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="swap-horizontal" size={22} color="#8B5CF6" />
            </View>
            <Text style={s.actionLabel}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('EmployerWallet')}>
            <View style={[s.actionIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="briefcase" size={22} color="#F59E0B" />
            </View>
            <Text style={s.actionLabel}>Employer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('ParentWallet')}>
            <View style={[s.actionIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="people" size={22} color="#8B5CF6" />
            </View>
            <Text style={s.actionLabel}>Family</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Spending insight ── */}
        <View style={s.insightCard}>
          <View style={s.insightHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#3B82F6" />
            <Text style={s.insightTitle}>Spending Limits Active</Text>
          </View>
          <Text style={s.insightBody}>
            Your daily spending limit is managed by your employer or parent account. Tap Employer or Family to view details.
          </Text>
        </View>

        {/* ── Transactions ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <Text style={s.sectionCount}>{transactions.length} transactions</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#334155" />
            <Text style={s.emptyText}>No transactions yet</Text>
            <Text style={s.emptyHint}>Top up your wallet to get started</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id}>{renderTransaction({ item: tx })}</View>
          ))
        )}
      </ScrollView>

      {/* ── Top-Up Modal ── */}
      <Modal animationType="slide" transparent visible={isTopupModalVisible} onRequestClose={() => setIsTopupModalVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setIsTopupModalVisible(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Top Up Wallet</Text>
            <Text style={s.modalSubtitle}>Add funds to your CASH wallet</Text>

            <Text style={s.fieldLabel}>AMOUNT (USD)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              value={topupAmount}
              onChangeText={setTopupAmount}
              autoFocus
            />

            <View style={s.modalQuickAmounts}>
              {['10.00', '25.00', '50.00', '100.00'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={s.quickAmountBtn}
                  onPress={() => setTopupAmount(amt)}
                >
                  <Text style={s.quickAmountText}>${amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[s.modalConfirmBtn, processing && { opacity: 0.6 }]}
              onPress={handleTopup}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.modalConfirmText}>
                  Top Up {topupAmount ? fmt(topupAmount) : ''}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsTopupModalVisible(false)}>
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Transfer Modal ── */}
      <Modal animationType="slide" transparent visible={isTransferModalVisible} onRequestClose={() => setIsTransferModalVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setIsTransferModalVisible(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Send Money</Text>
            <Text style={s.modalSubtitle}>P2P transfer to another PaySurity user</Text>

            <Text style={s.fieldLabel}>RECIPIENT WALLET ID</Text>
            <TextInput
              style={s.modalInput}
              placeholder="UUID or Phone"
              placeholderTextColor="#475569"
              value={transferRecipient}
              onChangeText={setTransferRecipient}
            />

            <Text style={s.fieldLabel}>AMOUNT (USD)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              value={transferAmount}
              onChangeText={setTransferAmount}
            />

            <TouchableOpacity
              style={[s.modalConfirmBtn, { backgroundColor: '#8B5CF6' }, processing && { opacity: 0.6 }]}
              onPress={handleTransfer}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.modalConfirmText}>
                  Send {transferAmount ? fmt(transferAmount) : ''}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsTransferModalVisible(false)}>
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── QR Receive Modal ── */}
      <Modal animationType="fade" transparent visible={isQrReceiveVisible} onRequestClose={() => setIsQrReceiveVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setIsQrReceiveVisible(false)}>
          <View style={s.qrModalSheet}>
            <Text style={s.modalTitle}>Your PaySurity Code</Text>
            <Text style={s.modalSubtitle}>Scan to receive funds instantly</Text>
            
            <View style={s.qrBox}>
              {processing || !qrPayload ? (
                <ActivityIndicator size="large" color="#10B981" />
              ) : (
                <QRCode value={qrPayload} size={220} color="#0F172A" backgroundColor="#fff" />
              )}
            </View>

            <TouchableOpacity style={[s.modalConfirmBtn, { backgroundColor: '#10B981', marginTop: 24 }]} onPress={() => setIsQrReceiveVisible(false)}>
              <Text style={s.modalConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingWrap: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontFamily: 'Inter_400Regular' },

  // Balance
  balanceCard: {
    marginHorizontal: 16, marginTop: 16, padding: 28, borderRadius: 20,
    backgroundColor: '#1E293B', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  balanceLabel: { fontSize: 13, color: '#94A3B8', fontFamily: 'Inter_500Medium', letterSpacing: 0.5 },
  balanceValue: { fontSize: 42, fontWeight: '700', color: '#F8FAFC', marginVertical: 8, fontFamily: 'Inter_700Bold' },
  balanceSub: { fontSize: 11, color: '#64748B', fontFamily: 'Inter_500Medium', letterSpacing: 1.5 },

  // Actions
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: 16, marginTop: 24,
  },
  actionBtn: { alignItems: 'center', width: 72 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: { fontSize: 11, color: '#94A3B8', fontFamily: 'Inter_500Medium' },

  // Insight
  insightCard: {
    marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 14,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  insightTitle: { fontSize: 14, color: '#F8FAFC', fontWeight: '600', marginLeft: 8, fontFamily: 'Inter_600SemiBold' },
  insightBody: { fontSize: 13, color: '#94A3B8', lineHeight: 20, fontFamily: 'Inter_400Regular' },

  // Transactions
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginTop: 28, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', fontFamily: 'Inter_700Bold' },
  sectionCount: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_400Regular' },

  txRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  txIcon: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '500', color: '#F8FAFC', fontFamily: 'Inter_500Medium' },
  txDate: { fontSize: 11, color: '#64748B', marginTop: 2, fontFamily: 'Inter_400Regular' },
  txAmount: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  txCredit: { color: '#10B981' },
  txDebit: { color: '#EF4444' },

  // Empty
  emptyState: {
    alignItems: 'center', paddingVertical: 48, marginHorizontal: 16,
    backgroundColor: '#1E293B', borderRadius: 14,
  },
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 12, fontFamily: 'Inter_600SemiBold' },
  emptyHint: { fontSize: 13, color: '#475569', marginTop: 4, fontFamily: 'Inter_400Regular' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#475569', borderRadius: 2,
    marginBottom: 20,
  },
  qrModalSheet: {
    backgroundColor: '#1E293B', width: '85%', borderRadius: 24, alignSelf: 'center', padding: 24, alignItems: 'center'
  },
  qrBox: {
    padding: 16, backgroundColor: '#fff', borderRadius: 16, width: 252, height: 252, alignItems: 'center', justifyContent: 'center'
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', fontFamily: 'Inter_700Bold' },
  modalSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4, marginBottom: 24, fontFamily: 'Inter_400Regular' },
  fieldLabel: {
    alignSelf: 'flex-start', fontSize: 11, color: '#94A3B8',
    fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 8,
  },
  modalInput: {
    width: '100%', backgroundColor: '#0F172A', borderRadius: 12, padding: 16,
    fontSize: 18, color: '#F8FAFC', fontFamily: 'Inter_400Regular',
    borderWidth: 1, borderColor: '#334155', marginBottom: 16, textAlign: 'center',
  },
  modalQuickAmounts: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20,
  },
  quickAmountBtn: {
    flex: 1, marginHorizontal: 4, backgroundColor: '#0F172A', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155',
  },
  quickAmountText: { color: '#94A3B8', fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  modalConfirmBtn: {
    width: '100%', backgroundColor: '#3B82F6', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  modalConfirmText: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },
  modalCancelText: { fontSize: 15, color: '#64748B', fontFamily: 'Inter_500Medium', paddingVertical: 8 },
});

export default WalletScreen;