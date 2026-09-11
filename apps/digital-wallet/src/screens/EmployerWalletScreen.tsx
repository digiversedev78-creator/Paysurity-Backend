import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, FlatList,
  StyleSheet, Alert, SafeAreaView, Platform, TextInput,
  Modal, Pressable, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { RoleEnum } from '@paysurity/types';
import { CONFIG } from '../config';
const API_BASE = CONFIG.API_BASE;

// ── Interface aligned to wallet_employer_links + digital_wallets schema ──
interface EmployeeLink {
  link_id: string;
  wallet_id: string;
  name: string;
  role: RoleEnum | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  balance_cents: number;
  kyc_level: string;
}

const EmployerWalletScreen: React.FC = () => {
  const auth = React.useContext(AuthContext);
  const token = auth?.userToken || '';
  const employerWalletId: string = (auth as any)?.walletId || '';

  const [employees, setEmployees] = useState<EmployeeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [employerBalance, setEmployerBalance] = useState<number>(0);

  // Deposit modal (single)
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLink | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Bulk deposit modal
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [bulkAmount, setBulkAmount] = useState('');

  // Add employee modal
  const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ walletId: '', name: '', role: RoleEnum.USER });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // ── Fetch employer wallet balance ─────────────────────────────────────────
  const fetchEmployerBalance = useCallback(async () => {
    if (!employerWalletId) return;
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${employerWalletId}`, { headers });
      if (res.ok) { const d = await res.json(); setEmployerBalance(d.balance_cents ?? 0); }
    } catch {}
  }, [employerWalletId, token]);

  // ── Fetch employees from real API ─────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    if (!employerWalletId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${employerWalletId}/employees`, { headers });
      if (res.ok) setEmployees(await res.json());
    } catch (e) { console.error('fetchEmployees error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [employerWalletId, token]);

  useEffect(() => { fetchEmployerBalance(); fetchEmployees(); }, [fetchEmployees, fetchEmployerBalance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployerBalance();
    fetchEmployees();
  }, [fetchEmployerBalance, fetchEmployees]);

  // ── Link an employee wallet ───────────────────────────────────────────────
  const handleAddEmployee = async () => {
    if (!newEmployee.walletId.trim() || !newEmployee.name.trim()) {
      Alert.alert('Missing Info', 'Wallet ID and name are required.');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${employerWalletId}/employees/link`, {
        method: 'POST', headers,
        body: JSON.stringify({ employeeWalletId: newEmployee.walletId, employeeName: newEmployee.name, employeeRole: newEmployee.role || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('✅ Linked', `${newEmployee.name} added as an employee.`);
      setIsAddEmployeeModalVisible(false);
      setNewEmployee({ walletId: '', name: '', role: RoleEnum.USER });
      fetchEmployees();
    } catch (e: unknown) {
      const err = e as Error;
      Alert.alert('Error', err.message || 'Failed to link employee.');
    } finally { setProcessing(false); }
  };

  // ── Single deposit (true double-entry via /disburse) ─────────────────────
  const handleSingleDeposit = async () => {
    if (!selectedEmployee) return;
    const amountCents = Math.round(parseFloat(depositAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      Alert.alert('Invalid Amount', 'Enter a positive dollar amount.');
      return;
    }
    if (amountCents > employerBalance) {
      Alert.alert('Insufficient Funds', `Employer wallet balance: $${(employerBalance / 100).toFixed(2)}`);
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/v1/wallets/${employerWalletId}/disburse`, {
        method: 'POST', headers,
        body: JSON.stringify({
          employeeWalletId: selectedEmployee.wallet_id,
          amountCents,
          idempotencyKey: Date.now().toString(),
          description: `Payroll deposit — ${selectedEmployee.name}`,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      Alert.alert('✅ Deposited', `$${depositAmount} sent to ${selectedEmployee.name}.`);
      setIsDepositModalVisible(false);
      setDepositAmount('');
      fetchEmployerBalance();
      fetchEmployees();
    } catch (e: unknown) {
      const err = e as Error;
      Alert.alert('Transfer Failed', err.message || 'Could not complete payroll deposit.');
    } finally { setProcessing(false); }
  };

  // ── Bulk deposit (all active employees) ─────────────────────────────────
  const handleBulkDeposit = async () => {
    const amountCents = Math.round(parseFloat(bulkAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      Alert.alert('Invalid Amount', 'Enter a positive dollar amount per employee.');
      return;
    }
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE');
    const totalRequired = amountCents * activeEmployees.length;
    if (totalRequired > employerBalance) {
      Alert.alert('Insufficient Funds', `Need $${(totalRequired / 100).toFixed(2)} — balance: $${(employerBalance / 100).toFixed(2)}`);
      return;
    }
    setProcessing(true);
    try {
      const results = await Promise.allSettled(
        activeEmployees.map(emp =>
          fetch(`${API_BASE}/v1/wallets/${employerWalletId}/disburse`, {
            method: 'POST', headers,
            body: JSON.stringify({
              employeeWalletId: emp.wallet_id,
              amountCents,
              idempotencyKey: Date.now().toString() + emp.wallet_id,
              description: `Bulk payroll — ${emp.name}`,
            }),
          }),
        ),
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - succeeded;
      Alert.alert('Bulk Deposit Complete', `${succeeded} succeeded${failed > 0 ? `, ${failed} failed` : ''}.`);
      setIsBulkModalVisible(false);
      setBulkAmount('');
      fetchEmployerBalance();
      fetchEmployees();
    } finally { setProcessing(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!employerWalletId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="briefcase-outline" size={64} color="#4B5563" />
          <Text style={styles.emptyTitle}>No Employer Wallet</Text>
          <Text style={styles.emptyText}>Initialise a PAYROLL_DISBURSEMENT wallet to manage employee payroll.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeCount = employees.filter(e => e.status === 'ACTIVE').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Payroll</Text>
          <Text style={styles.headerSub}>{activeCount} active employees</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.balanceLabel}>Available</Text>
          <Text style={styles.balanceValue}>${(employerBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => setIsBulkModalVisible(true)}>
          <Ionicons name="people-outline" size={22} color="#10B981" />
          <Text style={styles.actionLabel}>Bulk Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => setIsAddEmployeeModalVisible(true)}>
          <Ionicons name="person-add-outline" size={22} color="#3B82F6" />
          <Text style={styles.actionLabel}>Add Employee</Text>
        </TouchableOpacity>
      </View>

      {/* Employee list */}
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#10B981" /></View>
      ) : employees.length === 0 ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}>
          <View style={styles.centered}>
            <Ionicons name="people-outline" size={64} color="#4B5563" />
            <Text style={styles.emptyTitle}>No Employees Linked</Text>
            <Text style={styles.emptyText}>Link employee wallets to start sending payroll deposits.</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={item => item.link_id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.employeeCard}>
              <View style={styles.empHeader}>
                <View style={[styles.avatar, { backgroundColor: item.status === 'ACTIVE' ? '#10B98120' : '#374151' }]}>
                  <Ionicons name="person-circle-outline" size={28} color={item.status === 'ACTIVE' ? '#10B981' : '#6B7280'} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.empName}>{item.name}</Text>
                  <Text style={styles.empRole}>{item.role || 'Employee'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.empBalance}>${(item.balance_cents / 100).toFixed(2)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'ACTIVE' ? '#10B98120' : '#EF444420' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'ACTIVE' ? '#10B981' : '#EF4444' }]}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.depositBtn}
                onPress={() => { setSelectedEmployee(item); setIsDepositModalVisible(true); }}
                disabled={item.status !== 'ACTIVE'}
              >
                <Ionicons name="send-outline" size={14} color="#fff" />
                <Text style={styles.depositBtnText}>Send Payroll Deposit</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* ── Single Deposit Modal ──────────────────────────────────────────── */}
      <Modal visible={isDepositModalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setIsDepositModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Payroll Deposit</Text>
          <Text style={styles.modalSub}>To: {selectedEmployee?.name || '—'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount (e.g. 500.00)"
            placeholderTextColor="#6B7280"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="decimal-pad"
          />
          <Text style={styles.limitHint}>Available balance: ${(employerBalance / 100).toFixed(2)}</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10B981' }]} onPress={handleSingleDeposit} disabled={processing}>
            {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Confirm Deposit</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsDepositModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Bulk Deposit Modal ────────────────────────────────────────────── */}
      <Modal visible={isBulkModalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setIsBulkModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Bulk Payroll Deposit</Text>
          <Text style={styles.modalSub}>Sends the same amount to all {activeCount} active employees</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount per employee (e.g. 1500.00)"
            placeholderTextColor="#6B7280"
            value={bulkAmount}
            onChangeText={setBulkAmount}
            keyboardType="decimal-pad"
          />
          {bulkAmount && !isNaN(parseFloat(bulkAmount)) && (
            <Text style={styles.limitHint}>
              Total: ${(Math.round(parseFloat(bulkAmount) * 100) * activeCount / 100).toFixed(2)} for {activeCount} employees
            </Text>
          )}
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10B981' }]} onPress={handleBulkDeposit} disabled={processing}>
            {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Run Bulk Deposit</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsBulkModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Add Employee Modal ────────────────────────────────────────────── */}
      <Modal visible={isAddEmployeeModalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setIsAddEmployeeModalVisible(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Employee</Text>
          <Text style={styles.modalSub}>Link an employee's wallet to your payroll</Text>
          {[
            { placeholder: 'Employee Wallet ID (UUID)', key: 'walletId' as const, caps: false },
            { placeholder: 'Full Name', key: 'name' as const, caps: true },
            { placeholder: 'Role (e.g. USER)', key: 'role' as const, caps: true },
          ].map(({ placeholder, key, caps }, i) => (
            <TextInput
              key={key}
              style={[styles.input, i > 0 && { marginTop: 10 }]}
              placeholder={placeholder}
              placeholderTextColor="#6B7280"
              value={newEmployee[key]}
              onChangeText={v => setNewEmployee(prev => ({ ...prev, [key]: v }))}
              autoCapitalize={caps ? 'words' : 'none'}
            />
          ))}
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#3B82F6' }]} onPress={handleAddEmployee} disabled={processing}>
            {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Link Employee</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsAddEmployeeModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F9FAFB' },
  headerSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  balanceLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase' },
  balanceValue: { fontSize: 22, fontWeight: '800', color: '#10B981' },
  actionsRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 8 },
  actionCard: { flex: 1, backgroundColor: '#1E1B2E', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(63,63,70,0.3)' },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#F9FAFB', marginTop: 6 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  employeeCard: { backgroundColor: '#1E1B2E', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' },
  empHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  empName: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  empRole: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  empBalance: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  depositBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 10 },
  depositBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: { backgroundColor: '#1E1B2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F9FAFB', marginBottom: 4 },
  modalSub: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
  input: { backgroundColor: '#0F0F1A', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', color: '#F9FAFB', padding: 14, fontSize: 15 },
  limitHint: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  primaryBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#6B7280', fontSize: 15 },
});

export default EmployerWalletScreen;
