import { IsString, IsInt, IsOptional, IsNotEmpty, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { Request } from 'express'; // Import Request from express for augmenting type
import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException, Controller, Get, Post, Put, Delete, Param, Body, Query, Request as NestRequest, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';

// DTOs
class CreateMenuCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number) // Ensure transformation from string to number if needed
  sort_order?: number;
}

class UpdateMenuCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;
}

class UploadMenuItemImageDto {
  @IsUrl()
  @IsNotEmpty()
  image_url: string;
}

class OrderHistoryFilterDto {
  @IsString()
  @IsOptional()
  status?: string; // e.g., 'pending', 'completed', 'cancelled'

  @IsString()
  @IsOptional()
  startDate?: string; // ISO date string

  @IsString()
  @IsOptional()
  endDate?: string; // ISO date string
}

class RevenueReportFilterDto {
  @IsString()
  @IsOptional()
  startDate?: string; // ISO date string

  @IsString()
  @IsOptional()
  endDate?: string; // ISO date string
}

// Interfaces for req.user to satisfy TS, assuming JWT populates `req.user`
interface AuthenticatedUser {
  tenantId: string;
  userId: string;
  role: 'owner' | 'manager'; // As per "owner or manager role JWT"
  // Add other properties if your JWT payload includes them
}

// Augment Request type to include 'user' property for NestJS @Request() decorator
type ExpressRequestWithUser = any;

@Injectable()
class TenantAdminService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  // Internal helper to ensure tenantId is present and theoretically valid for operations
  private async checkTenantAccess(tenantId: string): Promise<void> {
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is missing from authentication context.');
    }
    // In a real application, more complex checks (e.g., tenant existence in DB, active status)
    // might be done here, but for this exercise, presence is sufficient.
  }

  async getDashboard(tenantId: string) {
    await this.checkTenantAccess(tenantId);

    try {
      // Example queries for dashboard data, simplified for illustration
      const totalOrdersResult = await (this.db as any).execute(
        'SELECT COUNT(id) AS total_orders FROM orders WHERE tenant_id = $1',
        [tenantId],
      );
      const totalRevenueResult = await (this.db as any).execute(
        'SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE tenant_id = $1 AND status = \'completed\'',
        [tenantId],
      );
      const menuStatsResult = await (this.db as any).execute(
        'SELECT COUNT(mi.id) AS total_menu_items, COUNT(DISTINCT mc.id) AS total_categories FROM menu_items mi LEFT JOIN menu_categories mc ON mi.category_id = mc.id WHERE mi.tenant_id = $1',
        [tenantId],
      );

      return {
        success: true,
        data: {
          totalOrders: parseInt((totalOrdersResult as any).rows[0]?.total_orders || '0', 10),
          totalRevenue: parseFloat((totalRevenueResult as any).rows[0]?.total_revenue || '0'),
          menuStats: {
            totalMenuItems: parseInt((menuStatsResult as any).rows[0]?.total_menu_items || '0', 10),
            totalCategories: parseInt((menuStatsResult as any).rows[0]?.total_categories || '0', 10),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve dashboard data: ${error.message}`);
    }
  }

  async getMenuCategories(tenantId: string) {
    await this.checkTenantAccess(tenantId);

    try {
      const categories = await (this.db as any).execute(
        'SELECT id, name, sort_order FROM menu_categories WHERE tenant_id = $1 ORDER BY sort_order ASC, name ASC',
        [tenantId],
      );
      return { success: true, data: (categories as any).rows };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve menu categories: ${error.message}`);
    }
  }

  async createMenuCategory(tenantId: string, dto: CreateMenuCategoryDto) {
    await this.checkTenantAccess(tenantId);

    try {
      let sortOrder = dto.sort_order;
      // If sort_order is not provided, determine the next available one
      if (sortOrder === undefined || sortOrder === null) {
        const maxSortOrderResult = await (this.db as any).execute(
          'SELECT COALESCE(MAX(sort_order), 0) AS max_sort_order FROM menu_categories WHERE tenant_id = $1',
          [tenantId],
        );
        sortOrder = parseInt((maxSortOrderResult as any).rows[0]?.max_sort_order || '0', 10) + 1;
      }

      const newCategoryResult = await (this.db as any).execute(
        'INSERT INTO menu_categories (tenant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id, name, sort_order',
        [tenantId, dto.name, sortOrder],
      );
      return { success: true, data: (newCategoryResult as any).rows[0] };
    } catch (error) {
      throw new BadRequestException(`Failed to create menu category: ${error.message}`);
    }
  }

  async updateMenuCategory(tenantId: string, id: string, dto: UpdateMenuCategoryDto) {
    await this.checkTenantAccess(tenantId);

    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (dto.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(dto.name);
      }
      if (dto.sort_order !== undefined) {
        updateFields.push(`sort_order = $${paramIndex++}`);
        updateValues.push(dto.sort_order);
      }

      if (updateFields.length === 0) {
        throw new BadRequestException('No fields to update provided.');
      }

      // Add id and tenantId for the WHERE clause
      updateValues.push(id, tenantId);
      const query = `UPDATE menu_categories SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} RETURNING id, name, sort_order`;

      const updatedCategoryResult = await (this.db as any).execute(query, updateValues);

      if (!(updatedCategoryResult as any).rows.length) {
        throw new NotFoundException(`Menu category with ID "${id}" not found for this tenant.`);
      }

      return { success: true, data: (updatedCategoryResult as any).rows[0] };
    } catch (error) {
      // Re-throw specific NestJS exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update menu category: ${error.message}`);
    }
  }

  async deleteMenuCategory(tenantId: string, id: string) {
    await this.checkTenantAccess(tenantId);

    try {
      const deleteResult = await (this.db as any).execute(
        'DELETE FROM menu_categories WHERE id = $1 AND tenant_id = $2 RETURNING id',
        [id, tenantId],
      );

      if (!(deleteResult as any).rows.length) {
        throw new NotFoundException(`Menu category with ID "${id}" not found for this tenant.`);
      }

      return { success: true, data: { id } };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete menu category: ${error.message}`);
    }
  }

  async uploadMenuItemImage(tenantId: string, itemId: string, dto: UploadMenuItemImageDto) {
    await this.checkTenantAccess(tenantId);

    try {
      const updatedItemResult = await (this.db as any).execute(
        'UPDATE menu_items SET image_url = $1 WHERE id = $2 AND tenant_id = $3 RETURNING id, name, image_url',
        [dto.image_url, itemId, tenantId],
      );

      if (!(updatedItemResult as any).rows.length) {
        throw new NotFoundException(`Menu item with ID "${itemId}" not found for this tenant.`);
      }

      return { success: true, data: (updatedItemResult as any).rows[0] };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to set menu item image: ${error.message}`);
    }
  }

  async getOrderHistory(tenantId: string, filters: OrderHistoryFilterDto) {
    await this.checkTenantAccess(tenantId);

    try {
      let query = 'SELECT id, order_date, total_amount, status, customer_name, customer_email FROM orders WHERE tenant_id = $1';
      const params = [tenantId];
      let paramIndex = 2;

      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      if (filters.startDate) {
        query += ` AND order_date >= $${paramIndex++}`;
        params.push(new Date(filters.startDate).toISOString());
      }
      if (filters.endDate) {
        query += ` AND order_date <= $${paramIndex++}`;
        params.push(new Date(filters.endDate).toISOString());
      }

      query += ' ORDER BY order_date DESC';

      const orders = await (this.db as any).execute(query, params);
      return { success: true, data: (orders as any).rows };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve order history: ${error.message}`);
    }
  }

  async getRevenueReport(tenantId: string, filters: RevenueReportFilterDto) {
    await this.checkTenantAccess(tenantId);

    try {
      // Default dates if not provided
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date(0); // Epoch
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date(); // Current date

      // Ensure endDate is at least as late as startDate
      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date.');
      }

      const query = `
        SELECT
          DATE_TRUNC('day', order_date) AS period,
          COALESCE(SUM(total_amount), 0) AS revenue
        FROM orders
        WHERE tenant_id = $1
          AND status = 'completed'
          AND order_date BETWEEN $2 AND $3
        GROUP BY period
        ORDER BY period ASC
      `;
      const params = [tenantId, startDate.toISOString(), endDate.toISOString()];

      const report = await (this.db as any).execute(query, params);
      return { success: true, data: (report as any).rows.map(row => ({
        period: row.period, // Date object or string depending on DB driver
        revenue: parseFloat(row.revenue || '0'),
      })) };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve revenue report: ${error.message}`);
    }
  }
}

@Controller('tenant-admin')
class TenantAdminController {
  constructor(private readonly tenantAdminService: TenantAdminService) {}

  private getTenantId(req: ExpressRequestWithUser): string {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      // As per rule #5, operations are protected internally. If tenantId is missing,
      // it signifies an authentication failure or misconfiguration.
      throw new ForbiddenException('Tenant ID not found in user context. Authentication required and valid JWT expected.');
    }
    return tenantId;
  }

  @Get('dashboard')
  async getDashboard(@NestRequest() req: ExpressRequestWithUser) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).getDashboard(tenantId);
  }

  @Get('menu-categories')
  async getMenuCategories(@NestRequest() req: ExpressRequestWithUser) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).getMenuCategories(tenantId);
  }

  @Post('menu-categories')
  @HttpCode(HttpStatus.CREATED)
  async createMenuCategory(@NestRequest() req: ExpressRequestWithUser, @Body() createMenuCategoryDto: CreateMenuCategoryDto) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).createMenuCategory(tenantId, createMenuCategoryDto);
  }

  @Put('menu-categories/:id')
  async updateMenuCategory(
    @NestRequest() req: ExpressRequestWithUser,
    @Param('id', ParseUUIDPipe) id: string, // Assuming category IDs are UUIDs
    @Body() updateMenuCategoryDto: UpdateMenuCategoryDto,
  ) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).updateMenuCategory(tenantId, id, updateMenuCategoryDto);
  }

  @Delete('menu-categories/:id')
  // Per instruction #6, "Return proper JSON structures: { success: true, data }",
  // so we'll return a 200 OK with a body, not 204 No Content.
  async deleteMenuCategory(@NestRequest() req: ExpressRequestWithUser, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).deleteMenuCategory(tenantId, id);
  }

  @Post('menu-items/:id/image')
  async uploadMenuItemImage(
    @NestRequest() req: ExpressRequestWithUser,
    @Param('id', ParseUUIDPipe) id: string, // Assuming menu item IDs are UUIDs
    @Body() uploadMenuItemImageDto: UploadMenuItemImageDto,
  ) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).uploadMenuItemImage(tenantId, id, uploadMenuItemImageDto);
  }

  @Get('order-history')
  async getOrderHistory(@NestRequest() req: ExpressRequestWithUser, @Query() filters: OrderHistoryFilterDto) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).getOrderHistory(tenantId, filters);
  }

  @Get('revenue-report')
  async getRevenueReport(@NestRequest() req: ExpressRequestWithUser, @Query() filters: RevenueReportFilterDto) {
    const tenantId = this.getTenantId(req);
    return (this.tenantAdminService as any).getRevenueReport(tenantId, filters);
  }
}



