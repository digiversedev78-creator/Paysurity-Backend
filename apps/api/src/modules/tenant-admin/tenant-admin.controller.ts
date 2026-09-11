import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';

// Interfaces for DTOs - minimal definitions for demonstration
interface TenantAdminDashboardDto {
  orders: number;
  revenue: number;
  menuStats: any;
}

interface CreateMenuCategoryDto {
  name: string;
  sort_order: number;
}

interface UpdateMenuCategoryDto {
  name?: string;
  sort_order?: number;
}

interface UploadMenuItemImageDto {
  imageUrl: string;
}

interface OrderHistoryFilterDto {
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface RevenueReportFilterDto {
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

// Service definition
class TenantAdminService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  private validateTenantId(tenantId: string | undefined): string {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is missing from JWT token.');
    }
    return tenantId;
  }

  async getDashboardData(req: Request): Promise<TenantAdminDashboardDto> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    const result = await (this.db as any).execute(
      `
      SELECT
        (SELECT COUNT(*) FROM orders WHERE tenant_id = $1) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE tenant_id = $1 AND status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM menu_items WHERE tenant_id = $1 AND is_available = TRUE) as available_menu_items
      `,
      [tenantId],
    );

    const dashboardData = result[0]; // Assuming result is an array of rows

    return {
      orders: parseInt(dashboardData.total_orders, 10),
      revenue: parseFloat(dashboardData.total_revenue),
      menuStats: {
        availableItems: parseInt(dashboardData.available_menu_items, 10),
      },
    };
  }

  async getAllMenuCategories(req: Request): Promise<any[]> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    const categories = await (this.db as any).execute(
      'SELECT id, name, sort_order FROM menu_categories WHERE tenant_id = $1 ORDER BY sort_order ASC',
      [tenantId],
    );
    return categories;
  }

  async createMenuCategory(
    req: Request,
    dto: CreateMenuCategoryDto,
  ): Promise<any> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    if (!dto.name) {
      throw new BadRequestException('Menu category name is required.');
    }

    const result = await (this.db as any).execute(
      'INSERT INTO menu_categories (tenant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id, name, sort_order',
      [tenantId, dto.name, dto.sort_order || 0],
    );
    return result[0];
  }

  async updateMenuCategory(
    req: Request,
    id: string,
    dto: UpdateMenuCategoryDto,
  ): Promise<any> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    const { name, sort_order } = dto;
    const updates: string[] = [];
    const values: any[] = [tenantId, id];
    let paramIndex = 3; // Start index for dynamic parameters

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(sort_order);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields provided for update.');
    }

    const query = `
      UPDATE menu_categories
      SET ${updates.join(', ')}
      WHERE tenant_id = $1 AND id = $2
      RETURNING id, name, sort_order
    `;

    const result = await (this.db as any).execute(query, values);

    if (result.length === 0) {
      throw new NotFoundException(
        `Menu category with ID ${id} not found for this tenant.`,
      );
    }
    return result[0];
  }

  async deleteMenuCategory(req: Request, id: string): Promise<void> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    const result = await (this.db as any).execute(
      'DELETE FROM menu_categories WHERE tenant_id = $1 AND id = $2 RETURNING id',
      [tenantId, id],
    );

    if (result.length === 0) {
      throw new NotFoundException(
        `Menu category with ID ${id} not found for this tenant.`,
      );
    }
  }

  async uploadMenuItemImage(
    req: Request,
    id: string,
    dto: UploadMenuItemImageDto,
  ): Promise<any> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    if (!dto.imageUrl) {
      throw new BadRequestException('Image URL is required.');
    }

    const result = await (this.db as any).execute(
      'UPDATE menu_items SET image_url = $3 WHERE tenant_id = $1 AND id = $2 RETURNING id, name, image_url',
      [tenantId, id, dto.imageUrl],
    );

    if (result.length === 0) {
      throw new NotFoundException(
        `Menu item with ID ${id} not found for this tenant.`,
      );
    }
    return result[0];
  }

  async getOrderHistory(
    req: Request,
    filters: OrderHistoryFilterDto,
  ): Promise<any[]> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    let query = 'SELECT * FROM orders WHERE tenant_id = $1';
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      values.push(new Date(filters.startDate));
    }
    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      values.push(new Date(filters.endDate));
    }
    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    const orders = await (this.db as any).execute(query, values);
    return orders;
  }

  async getRevenueReport(
    req: Request,
    filters: RevenueReportFilterDto,
  ): Promise<any[]> {
    const tenantId = this.validateTenantId(req?.user?.tenantId as string);
    let groupByClause: string;
    let dateFormat: string;

    switch (filters.period) {
      case 'day':
        groupByClause = 'DATE_TRUNC(\'day\', created_at)';
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        groupByClause = 'DATE_TRUNC(\'week\', created_at)';
        dateFormat = 'YYYY-MM-DD'; // Start of week
        break;
      case 'month':
        groupByClause = 'DATE_TRUNC(\'month\', created_at)';
        dateFormat = 'YYYY-MM';
        break;
      case 'year':
        groupByClause = 'DATE_TRUNC(\'year\', created_at)';
        dateFormat = 'YYYY';
        break;
      default:
        throw new BadRequestException('Invalid period specified for revenue report.');
    }

    let query = `
      SELECT
        TO_CHAR(${groupByClause}, '${dateFormat}') as period,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(id) as total_orders
      FROM orders
      WHERE tenant_id = $1 AND status = 'completed'
    `;

    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      values.push(new Date(filters.startDate));
    }
    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      values.push(new Date(filters.endDate));
    }

    query += ` GROUP BY period ORDER BY period ASC`;

    const report = await (this.db as any).execute(query, values);
    return report;
  }
}

// Controller definition
@Controller('tenant-admin')
export class TenantAdminController {
  private readonly tenantAdminService: TenantAdminService;

  constructor(@Inject('DATABASE') private readonly db: any) {
    this.tenantAdminService = new TenantAdminService(this.db);
  }

  @Get('dashboard')
  async getDashboard(@Req() req: Request) {
    const data = await (this.tenantAdminService as any).getDashboardData(req);
    return { success: true, data };
  }

  @Get('menu-categories')
  async getMenuCategories(@Req() req: Request) {
    const data = await (this.tenantAdminService as any).getAllMenuCategories(req);
    return { success: true, data };
  }

  @Post('menu-categories')
  async createMenuCategory(
    @Req() req: Request,
    @Body() createMenuCategoryDto: CreateMenuCategoryDto,
  ) {
    const data = await (this.tenantAdminService as any).createMenuCategory(
      req,
      createMenuCategoryDto,
    );
    return { success: true, data };
  }

  @Put('menu-categories/:id')
  async updateMenuCategory(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateMenuCategoryDto: UpdateMenuCategoryDto,
  ) {
    const data = await (this.tenantAdminService as any).updateMenuCategory(
      req,
      id,
      updateMenuCategoryDto,
    );
    return { success: true, data };
  }

  @Delete('menu-categories/:id')
  async deleteMenuCategory(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    await (this.tenantAdminService as any).deleteMenuCategory(req, id);
    return { success: true, message: 'Menu category deleted successfully.' };
  }

  @Post('menu-items/:id/image')
  async uploadMenuItemImage(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() uploadMenuItemImageDto: UploadMenuItemImageDto,
  ) {
    const data = await (this.tenantAdminService as any).uploadMenuItemImage(
      req,
      id,
      uploadMenuItemImageDto,
    );
    return { success: true, data };
  }

  @Get('order-history')
  async getOrderHistory(
    @Req() req: Request,
    @Body() filters: OrderHistoryFilterDto, // Assuming filters can come from body for POST or query for GET
  ) {
    // For GET requests, filters typically come from query params
    // Adjusting to use query params for GET requests, if needed, otherwise Body works for demonstration
    // If using query: @Query() filters: OrderHistoryFilterDto
    const data = await (this.tenantAdminService as any).getOrderHistory(req, filters);
    return { success: true, data };
  }

  @Get('revenue-report')
  async getRevenueReport(
    @Req() req: Request,
    @Body() filters: RevenueReportFilterDto, // Similar to order-history, assuming Body for demo
  ) {
    const data = await (this.tenantAdminService as any).getRevenueReport(req, filters);
    return { success: true, data };
  }
}


