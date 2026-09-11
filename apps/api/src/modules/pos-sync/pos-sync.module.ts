import {
  Module,
  Controller,
  Injectable,
  Post,
  Get,
  Param,
  Body,
  Req,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

class MenuItemDto {
  name: string;
  category: string;
  price: number;
  description?: string;
  // Add other relevant menu item fields
}

class SyncRequestDto {
  tenantId: string;
  menuItems: MenuItemDto[];
}

class PosWebhookDto {
  tenantId: string;
  eventType: string; // e.g., 'MENU_UPDATED', 'ITEM_DELETED'
  payload: any; // Raw payload from POS
}

@Injectable()
export class PosSyncService {
  constructor(
    @Inject('DATABASE') private readonly db: any,
    private eventEmitter: EventEmitter2,
  ) {}

  async micrositeToPos(tenantId: string, menuItems: MenuItemDto[]): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for sync operations.');
    }
    if (!menuItems || !Array.isArray(menuItems)) {
      throw new BadRequestException('Menu items array is required.');
    }

    let successCount = 0;
    const errorCount = 0;
    const errors = [];

    // Simulate database transaction for atomic updates
    try {
      await (this.db as any).execute('BEGIN');

      for (const item of menuItems) {
        // Find existing item by name and category for the given tenant
        const existingItem = await (this.db as any).execute(
          'SELECT id FROM pos_menu_items WHERE tenant_id = $1 AND name = $2 AND category = $3',
          [tenantId, item.name, item.category]
        );

        if ((existingItem as any).rows.length > 0) {
          // Update existing item
          await (this.db as any).execute(
            'UPDATE pos_menu_items SET price = $1, description = $2, updated_at = NOW() WHERE id = $3',
            [item.price, item.description, (existingItem as any).rows[0].id]
          );
        } else {
          // Insert new item
          await (this.db as any).execute(
            'INSERT INTO pos_menu_items (tenant_id, name, category, price, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
            [tenantId, item.name, item.category, item.price, item.description]
          );
        }
        successCount++;
      }

      await (this.db as any).execute('COMMIT');

      // Record sync status
      await (this.db as any).execute(
        'INSERT INTO pos_sync_status (tenant_id, last_microsite_to_pos_sync, last_pos_to_microsite_sync, updated_at) VALUES ($1, NOW(), NULL, NOW()) ON CONFLICT (tenant_id) DO UPDATE SET last_microsite_to_pos_sync = NOW(), updated_at = NOW()',
        [tenantId]
      );

      this.eventEmitter.emit('pos-sync.microsite-to-pos.completed', { tenantId, successCount, errors });
      return { successCount, errorCount, errors };

    } catch (error) {
      await (this.db as any).execute('ROLLBACK');
      this.eventEmitter.emit('pos-sync.microsite-to-pos.failed', { tenantId, error: error.message });
      throw new BadRequestException(`Failed to sync microsite to POS: ${error.message}`);
    }
  }

  async posToMicrosite(tenantId: string, menuItems: MenuItemDto[]): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for sync operations.');
    }
    if (!menuItems || !Array.isArray(menuItems)) {
      throw new BadRequestException('Menu items array is required.');
    }

    let successCount = 0;
    const errorCount = 0;
    const errors = [];

    try {
      await (this.db as any).execute('BEGIN');

      for (const item of menuItems) {
        // Find existing item by name and category for the given tenant
        const existingItem = await (this.db as any).execute(
          'SELECT id FROM microsite_menu_items WHERE tenant_id = $1 AND name = $2 AND category = $3',
          [tenantId, item.name, item.category]
        );

        if ((existingItem as any).rows.length > 0) {
          // Update existing item
          await (this.db as any).execute(
            'UPDATE microsite_menu_items SET price = $1, description = $2, updated_at = NOW() WHERE id = $3',
            [item.price, item.description, (existingItem as any).rows[0].id]
          );
        } else {
          // Insert new item
          await (this.db as any).execute(
            'INSERT INTO microsite_menu_items (tenant_id, name, category, price, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
            [tenantId, item.name, item.category, item.price, item.description]
          );
        }
        successCount++;
      }

      await (this.db as any).execute('COMMIT');

      // Record sync status
      await (this.db as any).execute(
        'INSERT INTO pos_sync_status (tenant_id, last_microsite_to_pos_sync, last_pos_to_microsite_sync, updated_at) VALUES ($1, NULL, NOW(), NOW()) ON CONFLICT (tenant_id) DO UPDATE SET last_pos_to_microsite_sync = NOW(), updated_at = NOW()',
        [tenantId]
      );

      this.eventEmitter.emit('pos-sync.pos-to-microsite.completed', { tenantId, successCount, errors });
      return { successCount, errorCount, errors };

    } catch (error) {
      await (this.db as any).execute('ROLLBACK');
      this.eventEmitter.emit('pos-sync.pos-to-microsite.failed', { tenantId, error: error.message });
      throw new BadRequestException(`Failed to sync POS to microsite: ${error.message}`);
    }
  }

  async getSyncStatus(tenantId: string): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to get sync status.');
    }

    const result = await (this.db as any).execute(
      'SELECT last_microsite_to_pos_sync, last_pos_to_microsite_sync FROM pos_sync_status WHERE tenant_id = $1',
      [tenantId]
    );

    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Sync status not found for tenant ID: ${tenantId}`);
    }

    const status = (result as any).rows[0];

    // Simulate pending changes logic
    const pendingChangesCount = Math.floor(Math.random() * 10); // Placeholder for actual logic
    const pendingChangesDetails = pendingChangesCount > 0 ? [{ id: 'item123', type: 'update' }] : [];

    return {
      tenantId: tenantId,
      lastMicrositeToPosSync: status.last_microsite_to_pos_sync,
      lastPosToMicrositeSync: status.last_pos_to_microsite_sync,
      pendingChangesCount: pendingChangesCount,
      pendingChangesDetails: pendingChangesDetails,
    };
  }

  async handlePosWebhook(tenantId: string, eventType: string, payload: any): Promise<any> {
    if (!tenantId || !eventType || !payload) {
      throw new BadRequestException('Invalid webhook payload.');
    }

    // Record webhook event for auditing or asynchronous processing
    await (this.db as any).execute(
      'INSERT INTO pos_webhook_events (tenant_id, event_type, payload, received_at) VALUES ($1, $2, $3, NOW())',
      [tenantId, eventType, JSON.stringify(payload)]
    );

    // Emit event for real-time updates or further processing
    this.eventEmitter.emit('pos-sync.webhook.received', { tenantId, eventType, payload });

    // Based on eventType, trigger specific sync or update logic
    switch (eventType) {
      case 'MENU_UPDATED':
        // Example: If POS sends full menu, trigger posToMicrosite sync.
        // If it sends partial changes, apply them directly.
        // For simplicity, let's just log and acknowledge.
        console.log(`POS menu updated event received for tenant ${tenantId}. Payload:`, payload);
        break;
      case 'ORDER_RECEIVED':
        // Example: Handle order event (out of scope for menu sync, but shows webhook utility)
        console.log(`POS order received event for tenant ${tenantId}. Payload:`, payload);
        break;
      default:
        console.log(`Unhandled POS webhook event type: ${eventType} for tenant ${tenantId}`);
    }

    return { message: 'Webhook event processed successfully', eventType, tenantId };
  }
}

@Controller('api/pos-sync')
export class PosSyncController {
  constructor(private readonly posSyncService: PosSyncService) {}

  @Post('microsite-to-pos')
  async micrositeToPos(@Req() req: any, @Body() syncRequestDto: SyncRequestDto) {
    const tenantId = req?.user?.tenantId || (syncRequestDto as any).tenantId; // Prioritize from auth token, fallback to body
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request or token.');
    }
    const result = await (this.posSyncService as any).micrositeToPos(tenantId, (syncRequestDto as any).menuItems);
    return { success: true, data: result };
  }

  @Post('pos-to-microsite')
  async posToMicrosite(@Req() req: any, @Body() syncRequestDto: SyncRequestDto) {
    const tenantId = req?.user?.tenantId || (syncRequestDto as any).tenantId; // Prioritize from auth token, fallback to body
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request or token.');
    }
    const result = await (this.posSyncService as any).posToMicrosite(tenantId, (syncRequestDto as any).menuItems);
    return { success: true, data: result };
  }

  @Get('status/:tenantId')
  async getSyncStatus(@Req() req: any, @Param('tenantId') paramTenantId: string) {
    const tenantId = req?.user?.tenantId || paramTenantId; // Prioritize from auth token, fallback to param
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request, token, or parameters.');
    }
    if (req?.user?.tenantId && req.user.tenantId !== tenantId) {
      throw new BadRequestException('Unauthorized: You can only view status for your tenant ID.');
    }
    const status = await (this.posSyncService as any).getSyncStatus(tenantId);
    return { success: true, data: status };
  }

  @Post('webhook')
  async handlePosWebhook(@Req() req: any, @Body() posWebhookDto: PosWebhookDto) {
    // Webhooks might not have req.user, so trust the tenantId in the payload
    if (!(posWebhookDto as any).tenantId) {
      throw new BadRequestException('Tenant ID is missing in the webhook payload.');
    }
    const result = await (this.posSyncService as any).handlePosWebhook(
      (posWebhookDto as any).tenantId,
      (posWebhookDto as any).eventType,
      (posWebhookDto as any).payload
    );
    return { success: true, data: result };
  }
}

@Module({
  controllers: [PosSyncController],
  providers: [PosSyncService],
  exports: [PosSyncService],
})
export class PosSyncModule {}



