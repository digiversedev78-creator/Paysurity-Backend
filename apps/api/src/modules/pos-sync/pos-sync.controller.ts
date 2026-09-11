import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Body, Controller, Get, Param, Post, Req, BadRequestException, UsePipes, ValidationPipe, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';

// DTOs
class MenuItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  externalId?: string; // To link items between systems

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  price?: string; // Use string for price to handle currency flexibility
}

class MicrositeToPosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menuItems: MenuItemDto[];

  @IsBoolean()
  @IsOptional()
  forceSync?: boolean = false;
}

class PosToMicrositeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menuItems: MenuItemDto[];

  @IsBoolean()
  @IsOptional()
  forceSync?: boolean = false;
}

class PosWebhookDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  eventType: string; // e.g., 'MENU_UPDATE', 'ITEM_DELETED'

  @IsObject()
  @IsNotEmpty()
  payload: Record<string, any>; // The actual data from the POS
}

// Service
@Injectable()
class PosSyncService {
  constructor(
    @Inject('DATABASE') private readonly db: any,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async pushMicrositeMenuToPos(tenantId: string, data: MicrositeToPosDto): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    console.log(`[PosSyncService] Syncing microsite menu to POS for tenant: ${tenantId}`);
    const { menuItems, forceSync } = data;

    try {
      // Step 1: Fetch existing POS menu items for this tenant
      // Simulating a DB call for existing POS menu items.
      const existingPosMenuItemsResult = await (this.db as any).execute(
        'SELECT id, name, category, external_id, description, is_active, price FROM pos_menu_items WHERE tenant_id = $1',
        [tenantId]
      );
      const existingPosMenuItems = (existingPosMenuItemsResult as any).rows;

      const itemsToUpsert = [];
      const itemsToDelete = [];

      // Create a map for efficient lookup of existing POS items
      const existingPosMap = new Map();
      existingPosMenuItems.forEach((item: any) => {
        existingPosMap.set(`${item.name}::${item.category}`, item);
      });

      for (const item of menuItems) {
        const key = `${item.name}::${item.category}`;
        const existingItem = existingPosMap.get(key);

        if (existingItem) {
          // Check if item needs update (simplified comparison)
          const needsUpdate = forceSync ||
                              existingItem.description !== item.description ||
                              existingItem.is_active !== item.isActive ||
                              existingItem.price !== item.price ||
                              existingItem.external_id !== item.externalId; // Add more comparisons as needed
          if (needsUpdate) {
            itemsToUpsert.push({ ...item, id: existingItem.id }); // Mark for update
          }
          existingPosMap.delete(key); // Remove from map, remaining items are for potential deletion
        } else {
          // New item, mark for insertion
          itemsToUpsert.push(item);
        }
      }

      // Remaining items in existingPosMap are not present in the new microsite menu -> mark for deletion in POS
      existingPosMap.forEach((item: any) => {
        itemsToDelete.push(item);
      });

      const upsertResults = [];
      for (const item of itemsToUpsert) {
        if (item.id) {
          // Update existing item
          const res = await (this.db as any).execute(
            `UPDATE pos_menu_items SET name = $1, category = $2, description = $3, is_active = $4, price = $5, external_id = $6, updated_at = NOW() WHERE id = $7 AND tenant_id = $8 RETURNING *`,
            [item.name, item.category, item.description, item.isActive, item.price, item.externalId, item.id, tenantId]
          );
          upsertResults.push((res as any).rows[0]);
        } else {
          // Insert new item
          const res = await (this.db as any).execute(
            `INSERT INTO pos_menu_items (tenant_id, name, category, description, external_id, is_active, price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
            [tenantId, item.name, item.category, item.description, item.externalId, item.isActive, item.price]
          );
          upsertResults.push((res as any).rows[0]);
        }
      }

      const deleteResults = [];
      for (const item of itemsToDelete) {
        const res = await (this.db as any).execute(
          `DELETE FROM pos_menu_items WHERE id = $1 AND tenant_id = $2 RETURNING id`,
          [item.id, tenantId]
        );
        deleteResults.push((res as any).rows[0]);
      }

      // Record sync status
      await (this.db as any).execute(
        `INSERT INTO sync_logs (tenant_id, sync_type, status, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [tenantId, 'microsite-to-pos', 'completed', JSON.stringify({ upserted: upsertResults.length, deleted: deleteResults.length })]
      );

      this.eventEmitter.emit('pos.sync.micrositeToPos', {
        tenantId,
        status: 'completed',
        details: { upserted: upsertResults.length, deleted: deleteResults.length },
      });

      return {
        message: 'Microsite menu successfully pushed to POS.',
        upsertedCount: upsertResults.length,
        deletedCount: deleteResults.length,
        upsertedItems: upsertResults,
        deletedItems: deleteResults,
      };
    } catch (error) {
      console.error(`Error pushing microsite menu to POS for tenant ${tenantId}:`, error);
      await (this.db as any).execute(
        `INSERT INTO sync_logs (tenant_id, sync_type, status, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [tenantId, 'microsite-to-pos', 'failed', JSON.stringify({ error: error.message })]
      );
      this.eventEmitter.emit('pos.sync.micrositeToPos', {
        tenantId,
        status: 'failed',
        error: error.message,
      });
      throw new InternalServerErrorException('Failed to push microsite menu to POS.');
    }
  }

  async pushPosMenuToMicrosite(tenantId: string, data: PosToMicrositeDto): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    console.log(`[PosSyncService] Syncing POS menu to microsite for tenant: ${tenantId}`);
    const { menuItems, forceSync } = data;

    try {
      // Step 1: Fetch existing Microsite menu items for this tenant
      const existingMicrositeMenuItemsResult = await (this.db as any).execute(
        'SELECT id, name, category, external_id, description, is_active, price FROM microsite_menu_items WHERE tenant_id = $1',
        [tenantId]
      );
      const existingMicrositeMenuItems = (existingMicrositeMenuItemsResult as any).rows;

      const itemsToUpsert = [];
      const itemsToDelete = [];

      const existingMicrositeMap = new Map();
      existingMicrositeMenuItems.forEach((item: any) => {
        existingMicrositeMap.set(`${item.name}::${item.category}`, item);
      });

      for (const item of menuItems) {
        const key = `${item.name}::${item.category}`;
        const existingItem = existingMicrositeMap.get(key);

        if (existingItem) {
          const needsUpdate = forceSync ||
                              existingItem.description !== item.description ||
                              existingItem.is_active !== item.isActive ||
                              existingItem.price !== item.price ||
                              existingItem.external_id !== item.externalId;
          if (needsUpdate) {
            itemsToUpsert.push({ ...item, id: existingItem.id });
          }
          existingMicrositeMap.delete(key);
        } else {
          itemsToUpsert.push(item);
        }
      }

      existingMicrositeMap.forEach((item: any) => {
        itemsToDelete.push(item);
      });

      const upsertResults = [];
      for (const item of itemsToUpsert) {
        if (item.id) {
          // Update existing item
          const res = await (this.db as any).execute(
            `UPDATE microsite_menu_items SET name = $1, category = $2, description = $3, is_active = $4, price = $5, external_id = $6, updated_at = NOW() WHERE id = $7 AND tenant_id = $8 RETURNING *`,
            [item.name, item.category, item.description, item.isActive, item.price, item.externalId, item.id, tenantId]
          );
          upsertResults.push((res as any).rows[0]);
        } else {
          // Insert new item
          const res = await (this.db as any).execute(
            `INSERT INTO microsite_menu_items (tenant_id, name, category, description, external_id, is_active, price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
            [tenantId, item.name, item.category, item.description, item.externalId, item.isActive, item.price]
          );
          upsertResults.push((res as any).rows[0]);
        }
      }

      const deleteResults = [];
      for (const item of itemsToDelete) {
        const res = await (this.db as any).execute(
          `DELETE FROM microsite_menu_items WHERE id = $1 AND tenant_id = $2 RETURNING id`,
          [item.id, tenantId]
        );
        deleteResults.push((res as any).rows[0]);
      }

      await (this.db as any).execute(
        `INSERT INTO sync_logs (tenant_id, sync_type, status, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [tenantId, 'pos-to-microsite', 'completed', JSON.stringify({ upserted: upsertResults.length, deleted: deleteResults.length })]
      );

      this.eventEmitter.emit('pos.sync.posToMicrosite', {
        tenantId,
        status: 'completed',
        details: { upserted: upsertResults.length, deleted: deleteResults.length },
      });

      return {
        message: 'POS menu successfully pushed to Microsite.',
        upsertedCount: upsertResults.length,
        deletedCount: deleteResults.length,
        upsertedItems: upsertResults,
        deletedItems: deleteResults,
      };
    } catch (error) {
      console.error(`Error pushing POS menu to Microsite for tenant ${tenantId}:`, error);
      await (this.db as any).execute(
        `INSERT INTO sync_logs (tenant_id, sync_type, status, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [tenantId, 'pos-to-microsite', 'failed', JSON.stringify({ error: error.message })]
      );
      this.eventEmitter.emit('pos.sync.posToMicrosite', {
        tenantId,
        status: 'failed',
        error: error.message,
      });
      throw new InternalServerErrorException('Failed to push POS menu to Microsite.');
    }
  }

  async getSyncStatus(tenantId: string): Promise<any> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    try {
      // Get last sync status for both directions
      const lastMicrositeToPosSyncResult = await (this.db as any).execute(
        `SELECT sync_type, status, details, created_at FROM sync_logs WHERE tenant_id = $1 AND sync_type = 'microsite-to-pos' ORDER BY created_at DESC LIMIT 1`,
        [tenantId]
      );

      const lastPosToMicrositeSyncResult = await (this.db as any).execute(
        `SELECT sync_type, status, details, created_at FROM sync_logs WHERE tenant_id = $1 AND sync_type = 'pos-to-microsite' ORDER BY created_at DESC LIMIT 1`,
        [tenantId]
      );

      // Simulate pending changes check (e.g., from a 'pending_sync_items' table or by comparing current state)
      const pendingChangesResult = await (this.db as any).execute(
        `SELECT COUNT(*) FROM pending_sync_items WHERE tenant_id = $1`,
        [tenantId]
      );

      return {
        tenantId,
        lastMicrositeToPosSync: (lastMicrositeToPosSyncResult as any).rows[0] || null,
        lastPosToMicrositeSync: (lastPosToMicrositeSyncResult as any).rows[0] || null,
        pendingChangesCount: parseInt((pendingChangesResult as any).rows[0]?.count || '0', 10),
        message: 'Sync status retrieved successfully.',
      };
    } catch (error) {
      console.error(`Error getting sync status for tenant ${tenantId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve sync status.');
    }
  }

  async handlePosWebhook(data: PosWebhookDto): Promise<any> {
    const { tenantId, eventType, payload } = data;

    if (!tenantId || !eventType || !payload) {
      throw new BadRequestException('Invalid webhook payload: tenantId, eventType, and payload are required.');
    }

    console.log(`[PosSyncService] Received POS webhook for tenant ${tenantId}, event: ${eventType}`);

    try {
      // Record the incoming webhook event
      await (this.db as any).execute(
        `INSERT INTO webhook_logs (tenant_id, event_type, payload, received_at) VALUES ($1, $2, $3, NOW())`,
        [tenantId, eventType, JSON.stringify(payload)]
      );

      // Emit an event for other parts of the application to react to
      this.eventEmitter.emit('pos.webhook.received', { tenantId, eventType, payload });

      // Depending on the eventType, trigger a sync or mark pending changes
      switch (eventType) {
        case 'MENU_UPDATE':
        case 'ITEM_CREATED':
        case 'ITEM_UPDATED':
        case 'ITEM_DELETED':
          // A real implementation would parse 'payload' to get specific item changes
          // Then, it might enqueue a job for 'pos-to-microsite' sync or directly trigger a partial sync.
          // For simplicity, we just log and indicate pending changes.
          await (this.db as any).execute(
            `INSERT INTO pending_sync_items (tenant_id, source, change_type, details, created_at) VALUES ($1, $2, $3, $4, NOW())`,
            [tenantId, 'pos', eventType, JSON.stringify(payload)]
          );
          return { message: `Webhook processed for tenant ${tenantId}, eventType: ${eventType}. Pending changes recorded.` };

        case 'ORDER_RECEIVED':
        case 'TABLE_STATUS_CHANGE':
          // These events might not require menu sync but could trigger other services.
          return { message: `Webhook processed for tenant ${tenantId}, eventType: ${eventType}. No menu sync triggered.` };

        default:
          console.warn(`[PosSyncService] Unknown webhook event type received: ${eventType}`);
          return { message: `Webhook processed for tenant ${tenantId}, unknown eventType: ${eventType}.` };
      }
    } catch (error) {
      console.error(`Error handling POS webhook for tenant ${tenantId}:`, error);
      throw new InternalServerErrorException('Failed to process POS webhook.');
    }
  }
}

// Controller
type CustomRequest = any;

@Controller('pos-sync')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
class PosSyncController {
  constructor(private readonly posSyncService: PosSyncService) {}

  private getTenantId(req: CustomRequest): string {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context. Authentication required.');
    }
    return tenantId;
  }

  @Post('microsite-to-pos')
  async pushMicrositeMenuToPos(@Req() req: CustomRequest, @Body() body: MicrositeToPosDto) {
    const tenantId = this.getTenantId(req);
    const data = await (this.posSyncService as any).pushMicrositeMenuToPos(tenantId, body);
    return { success: true, data };
  }

  @Post('pos-to-microsite')
  async pushPosMenuToMicrosite(@Req() req: CustomRequest, @Body() body: PosToMicrositeDto) {
    const tenantId = this.getTenantId(req);
    const data = await (this.posSyncService as any).pushPosMenuToMicrosite(tenantId, body);
    return { success: true, data };
  }

  @Get('status/:tenantId')
  async getSyncStatus(@Req() req: CustomRequest, @Param('tenantId') paramTenantId: string) {
    const tenantIdFromAuth = this.getTenantId(req);

    // CRITICAL strict rule: Protect operations internally by validating 'const tenantId = req?.user?.tenantId'.
    // Here, we ensure the tenantId from the path parameter matches the authenticated user's tenantId.
    if (tenantIdFromAuth !== paramTenantId) {
      throw new BadRequestException('Access denied: You can only view the sync status for your own tenant.');
    }

    const data = await (this.posSyncService as any).getSyncStatus(paramTenantId);
    return { success: true, data };
  }

  @Post('webhook')
  async handlePosWebhook(@Body() body: PosWebhookDto) {
    // Webhooks usually don't come with user authentication,
    // so we trust the tenantId provided in the webhook payload,
    // but the service should validate its existence.
    const data = await (this.posSyncService as any).handlePosWebhook(body);
    return { success: true, data };
  }
}





