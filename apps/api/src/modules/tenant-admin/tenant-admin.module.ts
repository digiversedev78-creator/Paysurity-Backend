import { Module, Controller, Get, Post, Put, Delete, Param, Body, Req, Inject, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, ForbiddenException, Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ItemManagementService } from './item-management.service';
import { TenantAdminItemsController, SuperAdminItemsController } from './item-management.controller';


interface DatabaseResult {
  rows: any[];
  rowCount?: number;
}

type TenantAdminRequest = any;

type CreateMenuCategoryDto = {
  name: string;
  sort_order?: number;
};

type UpdateMenuCategoryDto = {
  name?: string;
  sort_order?: number;
};

type OrderHistoryFilterDto = {
  status?: string;
  startDate?: string;
  endDate?: string;
};

type RevenueReportFilterDto = {
  period?: 'daily' | 'weekly' | 'monthly';
};

@Injectable()
export class TenantAdminService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  private checkAuthorization(roles: string[]): void {
    if (!roles || (!roles.includes('owner') && !roles.includes('manager'))) {
      throw new ForbiddenException('User not authorized for this action. Requires owner or manager role.');
    }
  }

  async getDashboardStats(tenantId: string, roles: string[]): Promise<any> {
    this.checkAuthorization(roles);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const ordersResult = await (this.db as any).execute(
      'SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL \'30 days\'',
      [tenantId]
    ) as DatabaseResult;

    const revenueResult = await (this.db as any).execute(
      'SELECT SUM(total_amount) FROM orders WHERE tenant_id = $1 AND status = \'completed\' AND created_at >= NOW() - INTERVAL \'30 days\'',
      [tenantId]
    ) as DatabaseResult;

    const menuItemsResult = await (this.db as any).execute(
      'SELECT COUNT(*) FROM menu_items WHERE tenant_id = $1',
      [tenantId]
    ) as DatabaseResult;

    return {
      totalOrdersLast30Days: (ordersResult as any).rows[0]?.count || 0,
      totalRevenueLast30Days: (revenueResult as any).rows[0]?.sum || 0,
      totalMenuItems: (menuItemsResult as any).rows[0]?.count || 0,
      // Add more dashboard stats as needed
    };
  }

  async getMenuCategories(tenantId: string, roles: string[]): Promise<any[]> {
    this.checkAuthorization(roles);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    const result = await (this.db as any).execute(
      'SELECT id, name, sort_order FROM menu_categories WHERE tenant_id = $1 ORDER BY sort_order ASC',
      [tenantId]
    ) as DatabaseResult;
    return (result as any).rows;
  }

  async createMenuCategory(tenantId: string, roles: string[], name: string, sortOrder: number): Promise<any> {
    this.checkAuthorization(roles);
    if (!tenantId || !name) {
      throw new BadRequestException('Tenant ID and category name are required.');
    }
    const result = await (this.db as any).execute(
      'INSERT INTO menu_categories (tenant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id, name, sort_order',
      [tenantId, name, sortOrder]
    ) as DatabaseResult;
    return (result as any).rows[0];
  }

  async updateMenuCategory(tenantId: string, roles: string[], categoryId: string, name: string, sortOrder: number): Promise<any> {
    this.checkAuthorization(roles);
    if (!tenantId || !categoryId) {
      throw new BadRequestException('Tenant ID and category ID are required.');
    }
    const result = await (this.db as any).execute(
      'UPDATE menu_categories SET name = $1, sort_order = $2 WHERE id = $3 AND tenant_id = $4 RETURNING id, name, sort_order',
      [name, sortOrder, categoryId, tenantId]
    ) as DatabaseResult;
    if (result.rowCount === 0) {
      throw new NotFoundException(`Menu category with ID ${categoryId} not found or not owned by tenant.`);
    }
    return (result as any).rows[0];
  }

  async deleteMenuCategory(tenantId: string, roles: string[], categoryId: string): Promise<void> {
    this.checkAuthorization(roles);
    if (!tenantId || !categoryId) {
      throw new BadRequestException('Tenant ID and category ID are required.');
    }
    const result = await (this.db as any).execute(
      'DELETE FROM menu_categories WHERE id = $1 AND tenant_id = $2',
      [categoryId, tenantId]
    ) as DatabaseResult;
    if (result.rowCount === 0) {
      throw new NotFoundException(`Menu category with ID ${categoryId} not found or not owned by tenant.`);
    }
  }

  async uploadMenuItemImage(tenantId: string, roles: string[], itemId: string, imageUrl: string): Promise<any> {
    this.checkAuthorization(roles);
    if (!tenantId || !itemId || !imageUrl) {
      throw new BadRequestException('Tenant ID, item ID, and image URL are required.');
    }
    const result = await (this.db as any).execute(
      'UPDATE menu_items SET image_url = $1 WHERE id = $2 AND tenant_id = $3 RETURNING id, name, image_url',
      [imageUrl, itemId, tenantId]
    ) as DatabaseResult;
    if (result.rowCount === 0) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found or not owned by tenant.`);
    }
    return (result as any).rows[0];
  }

  async getOrderHistory(tenantId: string, roles: string[], filters: OrderHistoryFilterDto): Promise<any[]> {
    this.checkAuthorization(roles);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    let query = 'SELECT * FROM orders WHERE tenant_id = $1';
    const params = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    query += ' ORDER BY created_at DESC';

    const result = await (this.db as any).execute(query, params) as DatabaseResult;
    return (result as any).rows;
  }

  async getRevenueReport(tenantId: string, roles: string[], period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<any[]> {
    this.checkAuthorization(roles);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    let query: string;

    switch (period) {
      case 'daily':
        query = `
          SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(*) AS orders
          FROM orders
          WHERE tenant_id = $1 AND status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
        break;
      case 'weekly':
        query = `
          SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week, SUM(total_amount) AS revenue, COUNT(*) AS orders
          FROM orders
          WHERE tenant_id = $1 AND status = 'completed' AND created_at >= NOW() - INTERVAL '90 days'
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY week ASC
        `;
        break;
      case 'monthly':
      default:
        query = `
          SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month, SUM(total_amount) AS revenue, COUNT(*) AS orders
          FROM orders
          WHERE tenant_id = $1 AND status = 'completed' AND created_at >= NOW() - INTERVAL '1 year'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY month ASC
        `;
        break;
    }

    const result = await (this.db as any).execute(query, [tenantId]) as DatabaseResult;
    return (result as any).rows;
  }
}

@Controller('/api/tenant-admin')
export class TenantAdminController {
  constructor(private readonly tenantAdminService: TenantAdminService) {}

  private getTenantInfo(req: TenantAdminRequest) {
    const tenantId = req?.user?.tenantId;
    const roles = req?.user?.roles;
    if (!tenantId || !roles) {
      throw new BadRequestException('Tenant ID and user roles are required for this operation. Please ensure user information is available in the JWT payload.');
    }
    return { tenantId, roles };
  }

  @Get('dashboard')
  async getDashboard(@Req() req: TenantAdminRequest) {
    const { tenantId, roles } = this.getTenantInfo(req);
    const data = await (this.tenantAdminService as any).getDashboardStats(tenantId, roles);
    return { success: true, data };
  }

  @Get('menu-categories')
  async getMenuCategories(@Req() req: TenantAdminRequest) {
    const { tenantId, roles } = this.getTenantInfo(req);
    const data = await (this.tenantAdminService as any).getMenuCategories(tenantId, roles);
    return { success: true, data };
  }

  @Post('menu-categories')
  async createMenuCategory(@Req() req: TenantAdminRequest, @Body() body: CreateMenuCategoryDto) {
    const { tenantId, roles } = this.getTenantInfo(req);
    const { name, sort_order } = body;
    if (!name) {
      throw new BadRequestException('Category name is required.');
    }
    const data = await (this.tenantAdminService as any).createMenuCategory(tenantId, roles, name, sort_order ?? 0);
    return { success: true, data };
  }

  @Put('menu-categories/:id')
  async updateMenuCategory(
    @Req() req: TenantAdminRequest,
    @Param('id') id: string,
    @Body() body: UpdateMenuCategoryDto,
  ) {
    const { tenantId, roles } = this.getTenantInfo(req);
    const { name, sort_order } = body;

    if (!name && sort_order === undefined) {
      throw new BadRequestException('At least one field (name or sort_order) is required for update.');
    }

    const existingCategories = await (this.tenantAdminService as any).getMenuCategories(tenantId, roles);
    const existingCategory = existingCategories.find(cat => cat.id === id);

    if (!existingCategory) {
      throw new NotFoundException(`Menu category with ID ${id} not found.`);
    }

    const data = await (this.tenantAdminService as any).updateMenuCategory(
      tenantId,
      roles,
      id,
      name ?? existingCategory.name,
      sort_order ?? existingCategory.sort_order,
    );
    return { success: true, data };
  }

  @Delete('menu-categories/:id')
  async deleteMenuCategory(@Req() req: TenantAdminRequest, @Param('id') id: string) {
    const { tenantId, roles } = this.getTenantInfo(req);
    await (this.tenantAdminService as any).deleteMenuCategory(tenantId, roles, id);
    return { success: true, message: `Menu category with ID ${id} deleted successfully.` };
  }

  @Post('menu-items/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadMenuItemImage(
    @Req() req: TenantAdminRequest,
    @Param('id') itemId: string,
    @UploadedFile() file: any,
  ) {
    const { tenantId, roles } = this.getTenantInfo(req);
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    // In a real application, you would upload 'file' to a cloud storage service (e.g., AWS S3, Google Cloud Storage)
    // and receive a publicly accessible URL. For this example, we simulate a URL.
    const simulatedImageUrl = `http://example.com/images/${tenantId}/${itemId}/${file.originalname}`;
    const data = await (this.tenantAdminService as any).uploadMenuItemImage(tenantId, roles, itemId, simulatedImageUrl);
    return { success: true, data: { ...data, simulatedImageUrl } };
  }

  @Get('order-history')
  async getOrderHistory(@Req() req: TenantAdminRequest, @Body() filters: OrderHistoryFilterDto) {
    const { tenantId, roles } = this.getTenantInfo(req);
    const data = await (this.tenantAdminService as any).getOrderHistory(tenantId, roles, filters);
    return { success: true, data };
  }

  @Get('revenue-report')
  async getRevenueReport(@Req() req: TenantAdminRequest, @Body() filters: RevenueReportFilterDto) {
    const { tenantId, roles } = this.getTenantInfo(req);
    const data = await (this.tenantAdminService as any).getRevenueReport(tenantId, roles, filters.period);
    return { success: true, data };
  }
}

@Module({
  imports: [AuditLogModule],
  controllers: [TenantAdminController, TenantAdminItemsController, SuperAdminItemsController],
  providers: [TenantAdminService, ItemManagementService],
  exports: [TenantAdminService, ItemManagementService],
})
export class TenantAdminModule {}




