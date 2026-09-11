import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, SafeAreaView, ScrollView, Switch,
  TextInput, Modal, Pressable, RefreshControl, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { CONFIG } from '../config';
const API_BASE = CONFIG.API_BASE;

// ── Interface aligned to wallet_family_links + digital_wallets schema ──
interface ChildLink {
  link_id: string;
  wallet_id: string;
  consumer_id: string;
  label: string | null;
  balance_cents: number;
  reserved_cents: number;
  daily_spend_limit_cents: number | null;
  weekly_spend_limit_cents: number | null;
  monthly_spend_limit_cents: number | null;
  status: 'ACTIVE' | 'SUSPENDED';
  kyc_level: string;
}

const ParentWalletScreen: React.FC = () => {
  const auth = React.useContext(AuthContext);
  const token = auth?.userToken || '';
  const guardianWalletId: string = (auth as any)?.walletId || '';

  const [children, setChildren] = useState<ChildLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Allowance modal
  const [isAllowanceModalVisible, setIsAllowanceModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildLink | null>(null);
  const [allowanceAmount, setAllowanceAmount] = useState('');

  // Limits modal
  const [isLimitsModalVisible, setIsLimitsModalVisible] = useState(false);
  const [editLimits, setEditLimits] = useState({ daily: '', weekly: '', monthly: '' });

  // Add child modal
  const [isAddChildModalVisible, setIsAddChildModalVisible] = useState(false);
  const [newChild, setNewChild] = useState({ walletId: '', label: '' });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // ── Fetch children from real API ──────────────────────────────────────────
  const fetchChildren = useCallback(async () => {
    if (!guardianWalletId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${guardianWalletId}/family/children`, { headers });
      if (res.ok) {
        const data: ChildLink[] = await res.json();
        setChildren(data);
      }
    } catch (e) {
      console.error('fetchChildren error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guardianWalletId, token]);

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchChildren(); }, [fetchChildren]);

  // ── Link a child wallet ────────────────────────────────────────────────────
  const handleAddChild = async () => {
    if (!newChild.walletId.trim()) {
      Alert.alert('Missing Info', 'Child wallet ID is required.');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${guardianWalletId}/family/link`, {
        method: 'POST', headers,
        body: JSON.stringify({
          dependentWalletId: newChild.walletId.trim(),
          label: newChild.label || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Success', 'Child wallet linked successfully.');
      setIsAddChildModalVisible(false);
      setNewChild({ walletId: '', label: '' });
      fetchChildren();
    } catch (e) {
      const err = e as Error;
      Alert.alert('Error', err.message || 'Failed to link sub-wallet.');
    } finally { setProcessing(false); }
  };

  // ── Toggle child active/suspended ─────────────────────────────────────────
  const handleToggle = async (child: ChildLink) => {
    const newActive = child.status !== 'ACTIVE';
    try {
      await fetch(`${API_BASE}/v1/wallets/${guardianWalletId}/family/${child.link_id}/toggle`, {
        method: 'POST', headers,
        body: JSON.stringify({ active: newActive }),
      });
      setChildren(prev => prev.map(c =>
        c.link_id === child.link_id ? { ...c, status: newActive ? 'ACTIVE' : 'SUSPENDED' } : c,
      ));
    } catch { Alert.alert('Error', 'Could not update child status.'); }
  };

  // ── Send allowance (double-entry disbursement) ─────────────────────────────
  const handleAllowance = async () => {
    if (!selectedChild) return;
    const amountCents = Math.round(parseFloat(allowanceAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      Alert.alert('Invalid Amount', 'Enter a positive dollar amount.');
      return;
    }
    // Check daily limit
    if (selectedChild.daily_spend_limit_cents && amountCents > selectedChild.daily_spend_limit_cents) {
      Alert.alert('Limit Exceeded', `Daily limit is $${(selectedChild.daily_spend_limit_cents / 100).toFixed(2)}`);
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${guardianWalletId}/disburse`, {
        method: 'POST', headers,
        body: JSON.stringify({
          employeeWalletId: selectedChild.wallet_id,
          amountCents,
          idempotencyKey: Date.now().toString(),
          description: `Allowance — ${selectedChild.label || selectedChild.consumer_id}`,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      Alert.alert('✅ Sent', `$${allowanceAmount} sent to ${selectedChild.label || 'child'}.`);
      setIsAllowanceModalVisible(false);
      setAllowanceAmount('');
      fetchChildren();
    } catch (e) {
      const err = e as Error;
      Alert.alert('Transfer Failed', err.message || 'Could not complete allowance transfer.');
    } finally { setProcessing(false); }
  };

  // ── Update spend limits ───────────────────────────────────────────────────
  const handleSaveLimits = async () => {
    if (!selectedChild) return;
    setProcessing(true);
    try {
      await fetch(`${API_BASE}/v1/wallets/${guardianWalletId}/family/link`, {
        method: 'POST', headers,
        body: JSON.stringify({
          dependentWalletId: selectedChild.wallet_id,
          dailyCents: editLimits.daily ? Math.round(parseFloat(editLimits.daily) * 100) : undefined,
          weeklyCents: editLimits.weekly ? Math.round(parseFloat(editLimits.weekly) * 100) : undefined,
          monthlyCents: editLimits.monthly ? Math.round(parseFloat(editLimits.monthly) * 100) : undefined,
          label: selectedChild.label ?? undefined,
        }),
      });
      Alert.alert('✅ Saved', 'Spend limits updated.');
      setIsLimitsModalVisible(false);
      fetchChildren();
    } catch { Alert.alert('Error', 'Could not save limits.'); }
    finally { setProcessing(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!guardianWalletId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color="#4B5563" />
          <Text style={styles.emptyTitle}>No Guardian Wallet</Text>
          <Text style={styles.emptyText}>A wallet must be initialised before managing family controls.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family Controls</Text>
          <Text style={styles.headerSub}>{children.length} linked{children.length === 1 ? '' : ' children'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddChildModalVisible(true)}>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Link Child</Text>
        </TouchableOpacity>
      </View>

      {/* Children list */}
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#8B5CF6" /></View>
      ) : children.length === 0 ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}>
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#4B5563" />
            <Text style={styles.emptyTitle}>No Children Linked</Text>
            <Text style={styles.emptyText}>Link a child wallet to set spend limits and send allowances.</Text>
            <TouchableOpacity style={[styles.addBtn, { marginTop: 20 }]} onPress={() => setIsAddChildModalVisible(true)}>
              <Text style={styles.addBtnText}>Link First Child</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
        >
          {children.map(child => (
            <View key={child.link_id} style={styles.childCard}>
              <View style={styles.childHeader}>
                <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
                  <Text style={styles.avatarText}>{(child.label || child.consumer_id || '?')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.childName}>{child.label || `Wallet ${child.wallet_id.slice(0, 8)}`}</Text>
                  <Text style={styles.childBalance}>${(child.balance_cents / 100).toFixed(2)} balance</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Switch
                    value={child.status === 'ACTIVE'}
                    onValueChange={() => handleToggle(child)}
                    trackColor={{ false: '#374151', true: '#8B5CF6' }}
                    thumbColor="#fff"
                  />
                  <Text style={styles.statusLabel}>{child.status === 'ACTIVE' ? 'Active' : 'Paused'}</Text>
                </View>
              </View>

              {/* Spend limits */}
              <View style={styles.limitsRow}>
                {[
                  { label: 'Daily', val: child.daily_spend_limit_cents },
                  { label: 'Weekly', val: child.weekly_spend_limit_cents },
                  { label: 'Monthly', val: child.monthly_spend_limit_cents },
                ].map(({ label, val }) => (
                  <View key={label} style={styles.limitBadge}>
                    <Text style={styles.limitLabel}>{label}</Text>
                    <Text style={styles.limitVal}>{val ? `$${(val / 100).toFixed(0)}` : '—'}</Text>
                  </View>
                ))}
              </View>

              {/* Action buttons */}
              <View style={styles.childActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedChild(child); setIsAllowanceModalVisible(true); }}>
                  <Ionicons name="send-outline" size={14} color="#8B5CF6" />
                  <Text style={styles.actionBtnText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => {
                  setSelectedChild(child);
                  setEditLimits({
                    daily: child.daily_spend_limit_cents ? (child.daily_spend_limit_cents / 100).toFixed(2) : '',
                    weekly: child.weekly_spend_limit_cents ? (child.weekly_spend_limit_cents / 100).toFixed(2) : '',
                    monthly: child.monthly_spend_limit_cents ? (child.monthly_spend_limit_cents / 100).toFixed(2) : '',
                  });
                  setIsLimitsModalVisible(true);
                }}>
                  <Ionicons name="settings-outline" size={14} color="#8B5CF6" />
                  <Text style={styles.actionBtnText}>Limits</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Allowance Modal ─────────────────────────────────────────────────── */}
      <Modal visible={isAllowanceModalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setIsAllowanceModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Send Allowance</Text>
          <Text style={styles.modalSub}>To: {selectedChild?.label || selectedChild?.wallet_id?.slice(0, 12) || '—'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount (e.g. 20.00)"
            placeholderTextColor="#6B7280"
            value={allowanceAmount}
            onChangeText={setAllowanceAmount}
            keyboardType="decimal-pad"
          />
          {selectedChild?.daily_spend_limit_cents && (
            <Text style={styles.limitHint}>Daily limit: ${(selectedChild.daily_spend_limit_cents / 100).toFixed(2)}</Text>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAllowance} disabled={processing}>
            {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send Now</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsAllowanceModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Limits Modal ────────────────────────────────────────────────────── */}
      <Modal visible={isLimitsModalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setIsLimitsModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Spend Limits</Text>
          <Text style={styles.modalSub}>{selectedChild?.label || 'Child'}</Text>
          {[
            { label: 'Daily Limit ($)', key: 'daily' as const },
            { label: 'Weekly Limit ($)', key: 'weekly' as const },
            { label: 'Monthly Limit ($)', key: 'monthly' as const },
          ].map(({ label, key }) => (
            <TextInput
              key={key}
              style={[styles.input, { marginBottom: 10 }]}
              placeholder={label}
              placeholderTextColor="#6B7280"
              value={editLimits[key]}
              onChangeText={v => setEditLimits(prev => ({ ...prev, [key]: v }))}
              keyboardType="decimal-pad"
            />
          ))}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveLimits} disabled={processing}>
            {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Limits</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLimitsModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Add Child Modal ─────────────────────────────────────────────────── */}
      <Modal visible={isAddChildModalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setIsAddChildModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Link Child Wallet</Text>
          <Text style={styles.modalSub}>Enter the child's wallet ID to link it for family controls</Text>
          <TextInput
            style={styles.input}
            placeholder="Child Wallet ID (UUID)"
            placeholderTextColor="#6B7280"
            value={newChild.walletId}
            onChangeText={v => setNewChild(prev => ({ ...prev, walletId: v }))}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Label (e.g. Zara)"
            placeholderTextColor="#6B7280"
            value={newChild.label}
            onChangeText={v => setNewChild(prev => ({ ...prev, label: v }))}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddChild} disabled={processing}>
            {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Link Child</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsAddChildModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F9FAFB' },
  headerSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, gap: 6 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  list: { flex: 1, paddingHorizontal: 20 },
  childCard: { backgroundColor: '#1E1B2E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  childName: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  childBalance: { fontSize: 13, color: '#10B981', marginTop: 2 },
  statusLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  limitsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  limitBadge: { flex: 1, backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 8, padding: 8, alignItems: 'center' },
  limitLabel: { fontSize: 10, color: '#9CA3AF' },
  limitVal: { fontSize: 14, fontWeight: '700', color: '#8B5CF6', marginTop: 2 },
  childActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: 8, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  actionBtnText: { color: '#8B5CF6', fontSize: 13, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: { backgroundColor: '#1E1B2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F9FAFB', marginBottom: 4 },
  modalSub: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
  input: { backgroundColor: '#0F0F1A', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', color: '#F9FAFB', padding: 14, fontSize: 15 },
  limitHint: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  primaryBtn: { backgroundColor: '#8B5CF6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#6B7280', fontSize: 15 },
});

export default ParentWalletScreen;
