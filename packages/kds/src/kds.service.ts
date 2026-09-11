import { Injectable } from '@nestjs/common';
import { db } from '../../db/drizzle';
import { crdt_sync_mesh } from '../../db/schema';
import { MLDSA } from '../../common/crypto/pqc';
import { HSMIntentSpooler } from '../../common/hardware/hsm-intent-spooler';

// Station Enumeration
type StationType = 'Grill' | 'Curry/Wok' | 'Fryer' | 'Assembly/Cold';

@Injectable()
export class KDSService {
  constructor(private hsmSpooler: HSMIntentSpooler) {}

  /**
   * Splits an incoming order logically into Kitchen Stations based on item metadata.
   */
  async processKitchenMeshOrder(orderPayload: any, tenantId: string) {
    if (!tenantId) throw new Error("SOVEREIGN_AUTH_EXCEPTION: Strict RLS Isolation Failure. Tenant Context Missing.");

    const kdsTickets = [];

    // Order Station Split Mapping
    for (const item of orderPayload.items) {
      let station: StationType = 'Assembly/Cold';
      const name = item.name.toLowerCase();

      if (name.includes('biryani') || name.includes('rice') || name.includes('haleem')) {
          station = 'Assembly/Cold'; // Pulled from large dum pots
      } else if (name.includes('tikka') || name.includes('kabob') || name.includes('grill') || name.includes('chops')) {
          station = 'Grill';
      } else if (name.includes('karahi') || name.includes('curry') || name.includes('tadka') || name.includes('masala')) {
          station = 'Curry/Wok';
      } else if (name.includes('65') || name.includes('manchurian') || name.includes('fry') || name.includes('chilli')) {
          station = 'Fryer';
      }

      kdsTickets.push({ station, item: item.name, quantity: item.quantity });
    }

    // 1. Drizzle ORM Event Capture (Vector Mesh via Gate 2)
    const orderId = `KDS-${Date.now()}`;
    await db.withTenant(tenantId).transaction(async (tx) => {
        await tx.insert(crdt_sync_mesh).values({
            hash: orderId,
            vectorClock: MLDSA.sign('KDS_MESH_CLOCK'), 
            status: 'KITCHEN_ACTIVE',
            signature: MLDSA.sign(`KDS::${orderId}::${tenantId}`)
        });
    });

    // OP-RETAIL-02: Hardware Dead-Lock Spooler (Thermal Fallback)
    const cloudLatencyMs = Math.random() * 600; // Simulated latency telemetry
    if (cloudLatencyMs > 500) {
        // Latency Critical: Execute Local-IP Direct Print bypass via ESC/POS bytecode
        console.warn(`[DEAD-LOCK SPOOLER] Cloud latency (${cloudLatencyMs}ms) exceeded 500ms threshold. Reverting to Thermal Fallback.`);
        await this.hsmSpooler.queueIntentSpool({
            data: `<kitchen.001><ThermalEmergency><TxId>${orderId}</TxId><ByteCode>ESC/POS-BYPASS</ByteCode></ThermalEmergency></kitchen.001>`,
            status: 'LOCAL_THERMAL_PRINT',
            priority: 0 // Highest system priority
        });
        return { success: true, orderId, tickets: kdsTickets, fallback: 'THERMAL_PRINT' };
    }

    // 2. Physical HSM 'Intent to Cook' integration (Mandate Gate 5)
    const locationId = orderPayload.locationId || 'default-kitchen';
    await this.hsmSpooler.queueIntentSpool({
        data: `<kitchen.${locationId}><CookInf><TxId>${orderId}</TxId><Stations>${JSON.stringify(kdsTickets)}</Stations></CookInf></kitchen.${locationId}>`,
        status: 'INTENT_TO_COOK',
        priority: 1
    });

    return { success: true, orderId, tickets: kdsTickets };
  }
}
