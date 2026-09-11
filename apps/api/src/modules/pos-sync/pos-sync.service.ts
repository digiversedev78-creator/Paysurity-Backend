import { Controller, Post, Get, Body, Param, Req, Inject, Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// DTOs for request bodies
class MenuItemDto {
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  posId?: string;       // ID from POS system
  micrositeId?: string; // ID from Microsite system
  isActive?: boolean;
}

class MicrositeToPosSyncDto {
  tenantId: string;
  menuItems: MenuItemDto[];
}

class PosToMicrositeSyncDto {
  tenantId: string;
  menuItems: MenuItemDto[];
}

class PosWebhookDto {
  tenantId: string;
  eventType: 'ITEM_CREATED' | 'ITEM_UPDATED' | 'ITEM_DELETED' | 'CATEGORY_UPDATED' | string;
  payload: any; // Generic payload from POS, can contain MenuItemDto, category info, etc.
  timestamp: string;
}

// Service
@Injectable()
export class PosSyncService {
  constructor(
    @Inject('DATABASE') private readonly db: any,
    private eventEmitter: EventEmitter2
  ) {}

  private async executeQuery(query: string, params: any[]): Promise<any[]> {
    try {
      // Assuming db.execute returns an array of results for SELECT or status for DML
      const result = await (this.db as any).execute(query, params);
      return Array.isArray(result) ? result : []; // Ensure it's an array for consistency
    } catch (error) {
      console.error(`Database query failed: ${query} with params ${params}`, error);
      throw new BadRequestException('Database operation failed.');
    }
  }

  async micrositeToPosSync(tenantId: string, menuItems: MenuItemDto[]): Promise<{ updatedCount: number, newCount: number }> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    let updatedCount = 0;
    let newCount = 0;

    // Fetch existing POS menu items for this tenant
    const existingPosItems = await this.executeQuery(
      'SELECT id, name, category, price, description, microsite_item_id, pos_item_id, is_active FROM pos_menu_items WHERE tenant_id = $1',
      [tenantId]
    );

    const posItemMap = new Map<string, MenuItemDto>(); // Key: name_category
    existingPosItems.forEach(item => posItemMap.set(`${item.name}_${item.category}`, item));

    for (const item of menuItems) {
      const key = `${item.name}_${item.category}`;
      const existingPosItem = posItemMap.get(key);

      if (existingPosItem) {
        // Compare relevant fields and update if different
        const isDifferent = existingPosItem.price !== item.price ||
                            existingPosItem.description !== item.description ||
                            existingPosItem.imageUrl !== item.imageUrl ||
                            (item.isActive !== undefined && (existingPosItem as any).is_active !== item.isActive);

        if (isDifferent) {
          await this.executeQuery(
            `UPDATE pos_menu_items SET 
               price = $1, description = $2, image_url = $3, is_active = $4, updated_at = NOW() 
             WHERE id = $5 AND tenant_id = $6`,
            [item.price, item.description, item.imageUrl, item.isActive ?? true, (existingPosItem as any).id, tenantId]
          );
          updatedCount++;
        }
      } else {
        // Insert new item into POS
        await this.executeQuery(
          `INSERT INTO pos_menu_items (
             tenant_id, name, category, price, description, image_url, microsite_item_id, is_active, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
           )`,
          [tenantId, item.name, item.category, item.price, item.description, item.imageUrl, item.micrositeId, item.isActive ?? true]
        );
        newCount++;
      }
    }

    // Optional: Handle items in POS that are no longer in microsite (e.g., mark as inactive)
    // This requires more complex logic to determine what items are "removed" from the microsite.
    // For now, we only focus on upserting microsite changes into POS.

    this.eventEmitter.emit('pos.sync.micrositeToPos', { tenantId, updatedCount, newCount, timestamp: new Date() });
    
    // Update last sync timestamp
    await this.executeQuery(
      `INSERT INTO pos_sync_status (tenant_id, last_microsite_to_pos_sync, updated_at, created_at)
       VALUES ($1, NOW(), NOW(), NOW())
       ON CONFLICT (tenant_id) DO UPDATE SET last_microsite_to_pos_sync = NOW(), updated_at = NOW()`,
      [tenantId]
    );

    return { updatedCount, newCount };
  }

  async posToMicrositeSync(tenantId: string, menuItems: MenuItemDto[]): Promise<{ updatedCount: number, newCount: number }> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    let updatedCount = 0;
    let newCount = 0;

    // Fetch existing Microsite menu items for this tenant
    const existingMicrositeItems = await this.executeQuery(
      'SELECT id, name, category, price, description, microsite_item_id, pos_item_id, is_active FROM microsite_menu_items WHERE tenant_id = $1',
      [tenantId]
    );

    const micrositeItemMap = new Map<string, MenuItemDto>(); // Key: name_category
    existingMicrositeItems.forEach(item => micrositeItemMap.set(`${item.name}_${item.category}`, item));

    for (const item of menuItems) {
      const key = `${item.name}_${item.category}`;
      const existingMicrositeItem = micrositeItemMap.get(key);

      if (existingMicrositeItem) {
        // Compare relevant fields and update if different
        const isDifferent = existingMicrositeItem.price !== item.price ||
                            existingMicrositeItem.description !== item.description ||
                            existingMicrositeItem.imageUrl !== item.imageUrl ||
                            (item.isActive !== undefined && (existingMicrositeItem as any).is_active !== item.isActive);

        if (isDifferent) {
          await this.executeQuery(
            `UPDATE microsite_menu_items SET 
               price = $1, description = $2, image_url = $3, is_active = $4, updated_at = NOW() 
             WHERE id = $5 AND tenant_id = $6`,
            [item.price, item.description, item.imageUrl, item.isActive ?? true, (existingMicrositeItem as any).id, tenantId]
          );
          updatedCount++;
        }
      } else {
        // Insert new item into Microsite
        await this.executeQuery(
          `INSERT INTO microsite_menu_items (
             tenant_id, name, category, price, description, image_url, pos_item_id, is_active, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
           )`,
          [tenantId, item.name, item.category, item.price, item.description, item.imageUrl, item.posId, item.isActive ?? true]
        );
        newCount++;
      }
    }
    
    // Optional: Handle items in Microsite that are no longer in POS (e.g., mark as inactive)

    this.eventEmitter.emit('pos.sync.posToMicrosite', { tenantId, updatedCount, newCount, timestamp: new Date() });

    // Update last sync timestamp
    await this.executeQuery(
      `INSERT INTO pos_sync_status (tenant_id, last_pos_to_microsite_sync, updated_at, created_at)
       VALUES ($1, NOW(), NOW(), NOW())
       ON CONFLICT (tenant_id) DO UPDATE SET last_pos_to_microsite_sync = NOW(), updated_at = NOW()`,
      [tenantId]
    );

    return { updatedCount, newCount };
  }

  async getSyncStatus(tenantId: string): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const statusRecords = await this.executeQuery(
      `SELECT 
         last_microsite_to_pos_sync AS lastMicrositeToPosSync,
         last_pos_to_microsite_sync AS lastPosToMicrositeSync,
         pending_microsite_changes AS pendingMicrositeChanges,
         pending_pos_changes AS pendingPosChanges,
         updated_at AS lastStatusUpdate
       FROM pos_sync_status WHERE tenant_id = $1`,
      [tenantId]
    );

    if (statusRecords.length === 0) {
      throw new NotFoundException(`Sync status for tenant ${tenantId} not found.`);
    }

    // For pending changes, this would typically involve querying change logs or comparing
    // current state. For this example, we'll return a placeholder or zero.
    const status = statusRecords[0];
    status.pendingMicrositeChanges = status.pendingMicrositeChanges || 0; // Default to 0
    status.pendingPosChanges = status.pendingPosChanges || 0; // Default to 0

    return status;
  }

  async handlePosWebhook(webhookEvent: PosWebhookDto): Promise<{ status: string, details: string }> {
    const { tenantId, eventType, payload, timestamp } = webhookEvent;

    if (!tenantId || !eventType || !payload) {
      throw new BadRequestException('Invalid webhook payload: missing tenantId, eventType, or payload.');
    }

    // Log the incoming webhook event
    await this.executeQuery(
      `INSERT INTO pos_webhook_logs (tenant_id, event_type, payload, timestamp, received_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [tenantId, eventType, JSON.stringify(payload), timestamp]
    );

    let details = 'Webhook event processed.';

    switch (eventType) {
      case 'ITEM_CREATED':
      case 'ITEM_UPDATED': {
        const item: MenuItemDto = payload.menuItem;
        if (!item || !item.name || !item.category || item.price === undefined) {
          throw new BadRequestException('Invalid ITEM_CREATED/UPDATED payload: missing menu item details.');
        }
        
        // Upsert this specific item into the microsite's menu
        const existingMicrositeItem = await this.executeQuery(
          'SELECT id, name, category, price FROM microsite_menu_items WHERE tenant_id = $1 AND name = $2 AND category = $3',
          [tenantId, item.name, item.category]
        );

        if (existingMicrositeItem.length > 0) {
          await this.executeQuery(
            `UPDATE microsite_menu_items SET 
               price = $1, description = $2, image_url = $3, pos_item_id = $4, is_active = $5, updated_at = NOW() 
             WHERE id = $6`,
            [item.price, item.description, item.imageUrl, item.posId, item.isActive ?? true, existingMicrositeItem[0].id]
          );
          details = `Menu item ${item.name} updated in microsite.`;
        } else {
          await this.executeQuery(
            `INSERT INTO microsite_menu_items (
               tenant_id, name, category, price, description, image_url, pos_item_id, is_active, created_at, updated_at
             ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
             )`,
            [tenantId, item.name, item.category, item.price, item.description, item.imageUrl, item.posId, item.isActive ?? true]
          );
          details = `New menu item ${item.name} added to microsite.`;
        }
        break;
      }
      case 'ITEM_DELETED': {
        const itemIdentifier: { name: string, category: string, posId?: string } = payload.itemIdentifier;
        if (!itemIdentifier || !itemIdentifier.name || !itemIdentifier.category) {
          throw new BadRequestException('Invalid ITEM_DELETED payload: missing item identifier.');
        }

        // Mark as inactive or delete from microsite's menu
        await this.executeQuery(
          `UPDATE microsite_menu_items SET is_active = FALSE, updated_at = NOW() 
           WHERE tenant_id = $1 AND name = $2 AND category = $3`,
          [tenantId, itemIdentifier.name, itemIdentifier.category]
        );
        details = `Menu item ${itemIdentifier.name} marked as inactive in microsite.`;
        break;
      }
      case 'CATEGORY_UPDATED': {
        // Handle category updates (e.g., rename, add, delete)
        details = `Category update for tenant ${tenantId} processed. Specific logic not implemented for brevity.`;
        break;
      }
      default:
        details = `Unhandled webhook event type: ${eventType}`;
        break;
    }

    this.eventEmitter.emit('pos.webhook.received', { tenantId, eventType, payload, timestamp: new Date(), status: details });

    return { status: 'success', details };
  }
}

// Controller
@Controller('pos-sync')
export class PosSyncController {
  constructor(private readonly posSyncService: PosSyncService) {}

  @Post('microsite-to-pos')
  async pushMicrositeToPos(@Req() req: any, @Body() syncData: MicrositeToPosSyncDto): Promise<any> {
    const tenantIdFromUser = req?.user?.tenantId;

    if (!tenantIdFromUser) {
      throw new ForbiddenException('Tenant ID not found in user context. Authentication required.');
    }

    // Ensure the tenantId in the body matches the authenticated user's tenantId
    if (syncData.tenantId && syncData.tenantId !== tenantIdFromUser) {
        throw new ForbiddenException('Operation not allowed for the specified tenant ID.');
    }
    // If body tenantId is not provided, use the one from the user
    const tenantIdToUse = syncData.tenantId || tenantIdFromUser;

    const result = await (this.posSyncService as any).micrositeToPosSync(tenantIdToUse, syncData.menuItems);
    return { success: true, data: result };
  }

  @Post('pos-to-microsite')
  async pushPosToMicrosite(@Req() req: any, @Body() syncData: PosToMicrositeSyncDto): Promise<any> {
    const tenantIdFromUser = req?.user?.tenantId;

    if (!tenantIdFromUser) {
      throw new ForbiddenException('Tenant ID not found in user context. Authentication required.');
    }

    // Ensure the tenantId in the body matches the authenticated user's tenantId
    if (syncData.tenantId && syncData.tenantId !== tenantIdFromUser) {
        throw new ForbiddenException('Operation not allowed for the specified tenant ID.');
    }
    // If body tenantId is not provided, use the one from the user
    const tenantIdToUse = syncData.tenantId || tenantIdFromUser;

    const result = await (this.posSyncService as any).posToMicrositeSync(tenantIdToUse, syncData.menuItems);
    return { success: true, data: result };
  }

  @Get('status/:tenantId')
  async getSyncStatus(@Req() req: any, @Param('tenantId') tenantId: string): Promise<any> {
    const tenantIdFromUser = req?.user?.tenantId;

    if (!tenantIdFromUser) {
      throw new ForbiddenException('Tenant ID not found in user context. Authentication required.');
    }

    // CRITICAL STRICT RULE: Validate tenantId from URL against authenticated user's tenantId
    if (tenantId !== tenantIdFromUser) {
      throw new ForbiddenException('Access to sync status for this tenant is forbidden.');
    }

    const status = await (this.posSyncService as any).getSyncStatus(tenantId);
    return { success: true, data: status };
  }

  @Post('webhook')
  async handlePosWebhook(@Body() webhookEvent: PosWebhookDto): Promise<any> {
    // For webhooks, the tenantId is expected to be part of the webhook payload itself
    // as there's no authenticated user context typically.
    if (!webhookEvent.tenantId) {
        throw new BadRequestException('Webhook payload must include tenantId.');
    }

    const result = await (this.posSyncService as any).handlePosWebhook(webhookEvent);
    return { success: true, data: result };
  }
}


