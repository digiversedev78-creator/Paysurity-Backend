import { 
    WebSocketGateway, 
    WebSocketServer, 
    SubscribeMessage, 
    MessageBody,
    ConnectedSocket
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger, Injectable, BadRequestException } from '@nestjs/common';
  import { NodePgDatabase } from 'drizzle-orm/node-postgres';
  import { Inject } from '@nestjs/common';
  
  export interface RemoteCommandDto {
    adminUserId: string;
    targetTenantId: string;
    targetTerminalId: string;
    command: 'PING' | 'FORCE_REBOOT' | 'CLEAR_CACHE' | 'REQUEST_REMOTE_SCREEN' | 'PRINT_DIAGNOSTIC_RECEIPT';
    payload?: any;
  }
  
  /**
   * REQ-ADM-MDM-01: Pos Hardware Remote Management
   * Represents an MDM (Mobile Device Management) tunnel directly into the Merchant's physical POS machines.
   * Utilizes an omnipresent secure WebSocket to force hardware commands.
   */
  @Injectable()
  @WebSocketGateway({ 
    cors: { origin: '*' },
    namespace: '/mdm-remote' 
  })
  export class DeviceManagementGateway {
    private readonly logger = new Logger(DeviceManagementGateway.name);
    
    @WebSocketServer()
    server: Server;
  
    constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}
  
    /**
     * Physical Hardware Terminals stay permanently connected to this room.
     */
    handleConnection(@ConnectedSocket() client: Socket) {
      const terminalId = client.handshake.query.terminalId as string;
      const tenantId = client.handshake.query.tenantId as string;
      
      if (terminalId && tenantId) {
        client.join(`mdm_terminal_${terminalId}`);
        this.logger.log(`POS Terminal [${terminalId}] bound to MDM persistent tunnel.`);
      }
    }
  
    /**
     * Hit by the Super Admin Dashboard API directly (via service execution) to push an arbitrary command
     * across the tunnel to the target physical device.
     */
    async dispatchRemoteCommand(dto: RemoteCommandDto) {
      this.logger.log(`SuperAdmin ${dto.adminUserId} pushing ${dto.command} to Terminal ${dto.targetTerminalId}`);
  
      // 1. Check if the terminal is physically online in Postgres heartbeats
      const activeRes = await (this.db as any).execute(
        `SELECT id, status, last_heartbeat FROM pos_terminals WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [dto.targetTerminalId, dto.targetTenantId]
      );
  
      if (!activeRes?.rows?.length) {
        throw new BadRequestException('Terminal does not exist or is fully unregistered.');
      }
  
      // 2. Audit Trail the intrusion
      await (this.db as any).execute(
        `INSERT INTO admin_remote_access_logs (tenant_id, admin_user_id, terminal_id, command, issued_at)
         VALUES ($1, $2, $3, $4, NOW())`,
         [dto.targetTenantId, dto.adminUserId, dto.targetTerminalId, dto.command]
      );
  
      // 3. Emit physical payload to the socket room 
      // The React Native POS local-device listener will catch this and execute the OS-level script
      this.server.to(`mdm_terminal_${dto.targetTerminalId}`).emit('execute_hardware_override', {
          command: dto.command,
          payload: dto.payload,
          timestamp: new Date().getTime()
      });
  
      return { success: true, message: `Command ${dto.command} dispatched to hardware buffer.` };
    }
  
    /**
     * In-bound response from the physical hardware confirming the Reboot/ClearCache occurred.
     */
    @SubscribeMessage('hardware_override_ack')
    handleTerminalAck(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
      this.logger.log(`Hardware Override Acknowledged by Terminal: Status [${data.status}]`);
      // Broadcast success back to Super Admin Dashboard via SSE or secondary room
    }
  }

