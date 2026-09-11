import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, API_BASE } from '../../App';

export default function TransactionDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { tx } = route.params;
  const auth = useContext(AuthContext);
  const CONSUMER_PHONE = auth?.consumerPhone || '+15551234567';

  const [isDisputeVisible, setIsDisputeVisible] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Fraud / Unauthorized');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isDisputed, setIsDisputed] = useState(false);

  const handleDispute = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/dispute?phone=${encodeURIComponent(CONSUMER_PHONE)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.userToken}`
        },
        body: JSON.stringify({
          transactionId: tx.id,
          reason: disputeReason,
          description: disputeDesc,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit dispute');

      Alert.alert('Dispute Submitted', 'Our team will review this shortly.');
      setIsDisputeVisible(false);
      setIsDisputed(true);
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Refund Failed', error.message || 'Could not process refund.');
    } finally {
      setProcessing(false);
    }
  };

  const isCredit = tx.type === 'CREDIT';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.title}>{tx.description || tx.sub_type || tx.type}</Text>
          <Text style={[s.amount, isCredit ? s.txCredit : s.txDebit]}>
            {isCredit ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
          </Text>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Date</Text>
          <Text style={s.value}>{new Date(tx.created_at).toLocaleString()}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Transaction ID</Text>
          <Text style={s.value}>{tx.id}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Status</Text>
          <Text style={s.value}>{tx.status}</Text>
        </View>

        {isDisputed ? (
          <View style={s.disputedBadge}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
            <Text style={s.disputedText}>Dispute Pending</Text>
          </View>
        ) : null}
      </View>

      {!isDisputed && (
        <TouchableOpacity style={s.disputeBtn} onPress={() => setIsDisputeVisible(true)}>
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <Text style={s.disputeBtnText}>Report an Issue / Dispute</Text>
        </TouchableOpacity>
      )}

      {/* BottomSheet Modal for Dispute */}
      <Modal visible={isDisputeVisible} transparent animationType="slide" onRequestClose={() => setIsDisputeVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setIsDisputeVisible(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>File Dispute</Text>
            
            <Text style={s.fieldLabel}>REASON</Text>
            <View style={s.reasonRow}>
              {['Fraud / Unauthorized', 'Incorrect Amount', 'Not Recognized'].map(r => (
                <TouchableOpacity key={r} style={[s.reasonChip, disputeReason === r && s.reasonChipActive]} onPress={() => setDisputeReason(r)}>
                  <Text style={[s.reasonChipText, disputeReason === r && s.reasonChipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={s.input}
              placeholder="Provide more details..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              value={disputeDesc}
              onChangeText={setDisputeDesc}
            />

            <TouchableOpacity style={[s.confirmBtn, processing && { opacity: 0.6 }]} onPress={handleDispute} disabled={processing}>
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>Submit Dispute</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsDisputeVisible(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 20, marginTop: 16 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  title: { fontSize: 18, color: '#F8FAFC', fontWeight: '600', marginBottom: 8 },
  amount: { fontSize: 36, fontWeight: '700' },
  txCredit: { color: '#10B981' },
  txDebit: { color: '#EF4444' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  label: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  value: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  disputeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF444415', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#EF444430', gap: 8, marginHorizontal: 20 },
  disputeBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
  disputedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B20', padding: 14, borderRadius: 8, marginTop: 24, justifyContent: 'center', gap: 8 },
  disputedText: { color: '#F59E0B', fontWeight: '600', fontSize: 15 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#475569', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginBottom: 24, textAlign: 'center' },
  fieldLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', letterSpacing: 1.5, marginBottom: 12 },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  reasonChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  reasonChipActive: { backgroundColor: '#EF444420', borderColor: '#EF4444' },
  reasonChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  reasonChipTextActive: { color: '#EF4444', fontWeight: '600' },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', minHeight: 100, textAlignVertical: 'top', marginBottom: 24 },
  confirmBtn: { backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  confirmText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancelText: { color: '#64748B', fontSize: 15, textAlign: 'center', padding: 8 },
});
