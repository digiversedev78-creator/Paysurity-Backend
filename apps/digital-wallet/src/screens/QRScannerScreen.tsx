import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_BASE, AuthContext } from '../../App';

export default function QRScannerScreen({ navigation }: { navigation: any }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    let targetPhone = '';
    let amountStr = '0.00';

    try {
      if (data.includes('paysurity:qr:pay')) {
        const parts = data.split(':');
        targetPhone = parts[3];
        amountStr = (parseInt(parts[4], 10) / 100).toFixed(2);
      } else if (data.includes('paysurity.com/pay')) {
        const parts = data.split('?amount=');
        const urlStr = parts[0];
        targetPhone = urlStr.split('/').pop() || '';
        if (parts[1]) amountStr = (parseInt(parts[1], 10) / 100).toFixed(2);
      }

      if (targetPhone) {
        Alert.alert('Scan Successful', `Proceeding to pay ${targetPhone} $${amountStr}`, [
          { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' },
          { text: 'Pay', onPress: () => processPayment(targetPhone, amountStr) }
        ]);
      } else {
        Alert.alert('Invalid QR', 'This does not appear to be a valid PaySurity QR code.', [{ text: 'OK', onPress: () => setScanned(false) }]);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to read QR code.', [{ text: 'OK', onPress: () => setScanned(false) }]);
    }
  };

  const processPayment = async (phone: string, amount: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.userToken}`
        },
        body: JSON.stringify({
          senderPhone: auth?.consumerPhone,
          receiverPhone: phone,
          assetType: 'CASH',
          amount: amount,
          currency: 'USD',
          description: 'Payment via QR',
        }),
      });

      if (!res.ok) throw new Error('Transfer failed');
      Alert.alert('Payment Successful', `Sent $${amount} to ${phone}`);
      navigation.goBack();
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Payment Failed', error.message || 'Could not complete transaction.');
    }
  };

  if (!permission?.granted) {
    return (
      <View style={s.container}>
        <Text style={s.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={s.btn} onPress={requestPermission}><Text style={s.btnText}>Grant Permission</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={s.overlay}>
        <View style={s.scanFrame} />
        <Text style={s.overlayText}>Scan a PaySurity QR code or deep link to send funds</Text>
      </View>
      {scanned && (
        <TouchableOpacity style={s.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={s.rescanText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  scanFrame: { width: 260, height: 260, borderWidth: 3, borderColor: '#10B981', backgroundColor: 'transparent', borderRadius: 24, shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  overlayText: { color: '#fff', marginTop: 30, fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  text: { color: '#fff', alignSelf: 'center', textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, marginHorizontal: 40 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  rescanBtn: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: '#1E293B', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, borderWidth: 1, borderColor: '#334155' },
  rescanText: { color: '#10B981', fontWeight: '600', fontSize: 15 },
});
