import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  ConnectedSocket,
  MessageBody,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

/**
 * REQ-POSR-KDS-01: Real-Time Kitchen Routing Gateway
 *
 * PHASE 3 REMEDIATION — WS Security Hardening
 *
 * Security posture:
 *  1. CORS: Driven by ALLOWED_ORIGINS env var — zero wildcard.
 *  2. Authentication: Every WS connection MUST present a valid Bearer JWT
 *     in the handshake `auth.token` field (set by the KDS hardware client on connect).
 *     Connections that fail JWT verification are rejected immediately.
 *  3. Tenant binding: tenantId is extracted exclusively from the verified JWT payload —
 *     never from a plaintext query parameter.
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (...args: unknown[]) => unknown) => {
      const allowed = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      // Allow server-side integrations with no origin header
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`WS CORS: origin '${origin}' is not permitted.`), false);
      }
    },
    credentials: true,
  },
  namespace: '/kds',
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(KdsGateway.name);

  @WebSocketServer()
  server: Server;

  // Verified socket → { tenantId, stationId } — populated ONLY after JWT verification
  private activeStations: Map<string, { tenantId: string; stationId: string }> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Connection lifecycle — cryptographic JWT gate.
   *
   * KDS hardware clients MUST connect via:
   *   socket.connect('/kds', { auth: { token: '<Bearer JWT>' } })
   *
   * The token is verified against JWT_SECRET. On failure, the socket is
   * disconnected immediately before any room assignment occurs.
   */
  async handleConnection(@ConnectedSocket() client: Socket) {
    const raw: string | undefined =
      client.handshake.auth?.token ??
      (client.handshake.headers.authorization as string | undefined);

    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token) {
      this.logger.warn(`[KDS] Rejected: no token presented. Socket=${client.id}`);
      client.emit('error', { code: 'AUTH_REQUIRED', message: 'JWT token is required.' });
      client.disconnect(true);
      return;
    }

    let payload: { tenantId: string; sub?: string } | null = null;
    try {
      payload = await this.jwtService.verifyAsync<{ tenantId: string; sub?: string }>(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      this.logger.warn(`[KDS] Rejected: invalid JWT. Socket=${client.id}. Reason=${err.message}`);
      client.emit('error', { code: 'AUTH_INVALID', message: 'Token verification failed.' });
      client.disconnect(true);
      return;
    }

    if (!payload?.tenantId) {
      this.logger.warn(`[KDS] Rejected: JWT missing tenantId claim. Socket=${client.id}`);
      client.emit('error', { code: 'AUTH_INVALID', message: 'Token payload is malformed.' });
      client.disconnect(true);
      return;
    }

    // stationId is safe to accept from query only AFTER tenant is verified from JWT
    const stationId = client.handshake.query.stationId as string;
    if (!stationId) {
      this.logger.warn(`[KDS] Rejected: missing stationId. Tenant=${payload.tenantId} Socket=${client.id}`);
      client.emit('error', { code: 'STATION_REQUIRED', message: 'stationId query param is required.' });
      client.disconnect(true);
      return;
    }

    // Bind verified identity to socket instance
    (client.data as any).tenantId = payload.tenantId;
    (client.data as any).stationId = stationId;

    this.activeStations.set(client.id, { tenantId: payload.tenantId, stationId });
    client.join(`tenant_${payload.tenantId}_station_${stationId}`);

    this.logger.log(
      `[KDS] Authenticated. Tenant=${payload.tenantId} | Station=${stationId} | Socket=${client.id}`,
    );
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.activeStations.delete(client.id);
    this.logger.log(`[KDS] Disconnected: Socket=${client.id}`);
  }

  /**
   * Internal event bridge: OrdersService emits 'order.kds.fired' when a waiter
   * fires tickets to the kitchen. Route exclusively to the correct station room.
   */
  @OnEvent('order.kds.fired')
  handleOrderFiredEvent(payload: { tenantId: string; targetStationId: string; orderDump: any }) {
    this.logger.log(`[KDS] Routing ticket to station=${payload.targetStationId}`);
    this.server
      .to(`tenant_${payload.tenantId}_station_${payload.targetStationId}`)
      .emit('incoming_ticket', payload.orderDump);
  }

  /**
   * Chef bumps ticket (taps DONE on KDS screen).
   * Only processes if socket has a verified station binding.
   */
  @SubscribeMessage('ticket_bumped')
  handleTicketBump(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; itemId: string },
  ) {
    const connectionState = this.activeStations.get(client.id);
    if (!connectionState) {
      // Should never reach here due to handleConnection gate, but belt-and-suspenders
      throw new WsException('Unauthenticated: socket has no verified station binding.');
    }

    this.logger.log(
      `[KDS] Chef at station=${connectionState.stationId} bumped item=${data.itemId} on order=${data.orderId}`,
    );

    this.server
      .to(`tenant_${connectionState.tenantId}_station_EXPO`)
      .emit('item_ready_for_runner', data);
  }
}
