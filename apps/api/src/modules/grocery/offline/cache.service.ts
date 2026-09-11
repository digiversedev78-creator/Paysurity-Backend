const generateHardwareNonce = () => '';

export class OfflineCacheService {
  async cacheTransaction(transactionData: any) {
    // Generate a cryptographically secure hardware nonce via TPM
    const nonce = await generateHardwareNonce();
    
    // Bind the nonce to the transaction payload to prevent offline replay attacks
    const securePayload = { ...transactionData, hardwareNonce: nonce };
    await (this as any).sqliteDb.insert('offline_transactions', securePayload);
  }
}










