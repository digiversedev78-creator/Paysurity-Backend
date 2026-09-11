import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
  Inject
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
type RequestWithUser = any;
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// DTOs for request bodies
class CartItemDto {
  productId: string;
  quantity: number;
}

class UpdateCartItemDto {
  quantity: number;
}

class ApplyPromoDto {
  promoCode: string;
}

class AddressDto {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

class CheckoutDto {
  paymentMethodId: string; // e.g., a token from a payment gateway
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
}

import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('ecom')
export class CheckoutController {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    // Add other services like PaymentService, FulfillmentService here if needed
  ) {}

  // Helper function to get the user's cart or create one if it doesn't exist
  private async getOrCreateCart(tenantId: string, userId: string): Promise<{ id: string }> {
    const cart = await (this.db as any).execute(sql`
      SELECT id FROM ecom_carts
      WHERE tenant_id = ${tenantId} AND user_id = ${userId}
    `);

    if (cart.length === 0) {
      const newCart = await (this.db as any).execute(sql`
        INSERT INTO ecom_carts (id, tenant_id, user_id, created_at, updated_at)
        VALUES (crypto.randomUUID(), ${tenantId}, ${userId}, NOW(), NOW())
        RETURNING id
      `);
      return newCart[0];
    }
    return cart[0];
  }

  @UseGuards(AuthGuard)
  @Get('cart')
  async getCart(@Req() req: RequestWithUser) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant ID and User ID are required.');
    }

    const cartData = await (this.db as any).execute(sql`
      SELECT
          c.id AS cart_id,
          c.user_id,
          c.tenant_id,
          c.promo_code_id,
          pc.code AS promo_code,
          c.discount_amount,
          ci.id AS item_id,
          ci.product_id,
          p.name AS product_name,
          p.description AS product_description,
          p.price AS product_unit_price,
          p.image_url AS product_image_url,
          ci.quantity,
          ci.unit_price_snapshot
      FROM ecom_carts c
      LEFT JOIN ecom_cart_items ci ON c.id = ci.cart_id
      LEFT JOIN ecom_products p ON ci.product_id = p.id
      LEFT JOIN ecom_promo_codes pc ON c.promo_code_id = pc.id
      WHERE c.tenant_id = ${tenantId} AND c.user_id = ${userId}
    `);

    if (!cartData || cartData.length === 0 || !cartData[0].cart_id) {
      // If no cart exists or cart exists but has no items, return an empty cart structure
      return {
        cartId: null,
        userId,
        tenantId,
        items: [],
        subtotal: '0.00',
        discount: '0.00',
        total: '0.00',
        promoCode: null,
        promoDiscountAmount: '0.00',
      };
    }

    const items = cartData
      .filter(row => row.item_id !== null) // Filter out rows where cart exists but has no items
      .map(row => ({
        itemId: row.item_id,
        productId: row.product_id,
        productName: row.product_name,
        productDescription: row.product_description,
        productUnitPrice: parseFloat(row.product_unit_price).toFixed(2),
        productImageUrl: row.product_image_url,
        quantity: row.quantity,
        unitPriceSnapshot: parseFloat(row.unit_price_snapshot).toFixed(2), // Price at the time of adding to cart
        lineTotal: (parseFloat(row.unit_price_snapshot) * row.quantity).toFixed(2),
      }));

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.lineTotal), 0);
    const discount = parseFloat(cartData[0].discount_amount || '0.00');
    const total = subtotal - discount;

    const cartResponse = {
      cartId: cartData[0].cart_id,
      userId: cartData[0].user_id,
      tenantId: cartData[0].tenant_id,
      items: items,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      promoCode: cartData[0].promo_code,
      promoDiscountAmount: discount.toFixed(2),
    };

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_cart_viewed',
      details: { cartId: cartResponse.cartId },
    });

    return cartResponse;
  }

  @UseGuards(AuthGuard)
  @Post('cart/items')
  @HttpCode(HttpStatus.CREATED)
  async addCartItem(@Req() req: RequestWithUser, @Body() body: CartItemDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { productId, quantity } = body;

    if (!tenantId || !userId || !productId || quantity <= 0) {
      throw new BadRequestException('Invalid request parameters. Product ID and quantity > 0 are required.');
    }

    // Check if product exists and is active/in stock
    const product = await (this.db as any).execute(sql`
      SELECT id, price, stock FROM ecom_products
      WHERE id = ${productId} AND tenant_id = ${tenantId} AND is_active = TRUE
    `);

    if (!product || product.length === 0) {
      throw new NotFoundException('Product not found or not available.');
    }
    const unitPriceSnapshot = product[0].price; // Snapshot current price
    const currentStock = product[0].stock;

    const { id: cartId } = await this.getOrCreateCart(tenantId, userId);

    // Check if item already exists in cart
    const existingCartItem = await (this.db as any).execute(sql`
      SELECT id, quantity FROM ecom_cart_items
      WHERE cart_id = ${cartId} AND product_id = ${productId}
    `);

    let auditDetails = {};
    if (existingCartItem && existingCartItem.length > 0) {
      // Update quantity
      const newQuantity = existingCartItem[0].quantity + quantity;
      if (currentStock < newQuantity) {
        throw new BadRequestException(`Adding ${quantity} would exceed stock for product ${product[0].id}. Current cart: ${existingCartItem[0].quantity}, Available total: ${currentStock}`);
      }

      await (this.db as any).execute(sql`
        UPDATE ecom_cart_items
        SET quantity = ${newQuantity}, updated_at = NOW(), unit_price_snapshot = ${unitPriceSnapshot}
        WHERE id = ${existingCartItem[0].id} AND cart_id = ${cartId}
      `);
      auditDetails = { cartId, productId, oldQuantity: existingCartItem[0].quantity, newQuantity, actionType: 'updated' };
    } else {
      // Check stock for new item
      if (currentStock < quantity) {
        throw new BadRequestException(`Not enough stock for product ${product[0].id}. Available: ${currentStock}, Requested: ${quantity}`);
      }
      // Insert new item
      await (this.db as any).execute(sql`
        INSERT INTO ecom_cart_items (id, cart_id, product_id, quantity, unit_price_snapshot, created_at, updated_at)
        VALUES (crypto.randomUUID(), ${cartId}, ${productId}, ${quantity}, ${unitPriceSnapshot}, NOW(), NOW())
      `);
      auditDetails = { cartId, productId, quantity, actionType: 'added' };
    }

    // Reset promo on cart as items have changed, promo needs re-evaluation
    await (this.db as any).execute(sql`
      UPDATE ecom_carts
      SET promo_code_id = NULL, discount_amount = 0.00, updated_at = NOW()
      WHERE id = ${cartId}
    `);

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_cart_item_added_or_updated',
      details: auditDetails,
    });

    return { message: 'Item added/updated in cart successfully.' };
  }

  @UseGuards(AuthGuard)
  @Patch('cart/items/:id')
  async updateCartItemQuantity(@Req() req: RequestWithUser, @Param('id') itemId: string, @Body() body: UpdateCartItemDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { quantity } = body;

    if (!tenantId || !userId || !itemId || quantity <= 0) {
      throw new BadRequestException('Invalid request parameters. Item ID and quantity > 0 are required.');
    }

    const cartIdResult = await (this.db as any).execute(sql`
      SELECT c.id AS cart_id, ci.product_id, ci.quantity AS old_quantity
      FROM ecom_carts c
      JOIN ecom_cart_items ci ON c.id = ci.cart_id
      WHERE c.tenant_id = ${tenantId} AND c.user_id = ${userId} AND ci.id = ${itemId}
    `);

    if (cartIdResult.length === 0) {
      throw new NotFoundException('Cart item not found or does not belong to user/tenant.');
    }

    const { cart_id: cartId, product_id: productId, old_quantity: oldQuantity } = cartIdResult[0];

    // Check product stock again for the new quantity
    const product = await (this.db as any).execute(sql`
      SELECT stock FROM ecom_products
      WHERE id = ${productId} AND tenant_id = ${tenantId} AND is_active = TRUE
    `);

    if (!product || product.length === 0) {
      throw new NotFoundException('Associated product not found or not available.');
    }
    const currentStock = product[0].stock;

    if (currentStock < quantity) {
      throw new BadRequestException(`Not enough stock for product ${productId}. Available: ${currentStock}. Requested: ${quantity}`);
    }

    await (this.db as any).execute(sql`
      UPDATE ecom_cart_items
      SET quantity = ${quantity}, updated_at = NOW()
      WHERE id = ${itemId} AND cart_id = ${cartId}
    `);

    // Reset promo on cart as items have changed, promo needs re-evaluation
    await (this.db as any).execute(sql`
      UPDATE ecom_carts
      SET promo_code_id = NULL, discount_amount = 0.00, updated_at = NOW()
      WHERE id = ${cartId}
    `);

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_cart_item_quantity_updated',
      details: { cartId, itemId, productId, oldQuantity, newQuantity: quantity },
    });

    return { message: 'Cart item quantity updated successfully.' };
  }

  @UseGuards(AuthGuard)
  @Delete('cart/items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCartItem(@Req() req: RequestWithUser, @Param('id') itemId: string) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    if (!tenantId || !userId || !itemId) {
      throw new BadRequestException('Invalid request parameters.');
    }

    const cartIdResult = await (this.db as any).execute(sql`
      SELECT c.id AS cart_id, ci.product_id
      FROM ecom_carts c
      JOIN ecom_cart_items ci ON c.id = ci.cart_id
      WHERE c.tenant_id = ${tenantId} AND c.user_id = ${userId} AND ci.id = ${itemId}
    `);

    if (cartIdResult.length === 0) {
      throw new NotFoundException('Cart item not found or does not belong to user/tenant.');
    }

    const { cart_id: cartId, product_id: productId } = cartIdResult[0];

    await (this.db as any).execute(sql`
      DELETE FROM ecom_cart_items
      WHERE id = ${itemId} AND cart_id = ${cartId}
    `);

    // Reset promo on cart as items have changed, promo needs re-evaluation
    await (this.db as any).execute(sql`
      UPDATE ecom_carts
      SET promo_code_id = NULL, discount_amount = 0.00, updated_at = NOW()
      WHERE id = ${cartId}
    `);

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_cart_item_removed',
      details: { cartId, itemId, productId },
    });
  }

  @UseGuards(AuthGuard)
  @Post('cart/promo')
  @HttpCode(HttpStatus.OK)
  async applyPromoCode(@Req() req: RequestWithUser, @Body() body: ApplyPromoDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { promoCode } = body;

    if (!tenantId || !userId || !promoCode) {
      throw new BadRequestException('Promo code is required.');
    }

    // Calculate current cart subtotal (based on current product prices)
    const cartData = await (this.db as any).execute(sql`
      SELECT c.id AS cart_id, SUM(ci.quantity * p.price) AS subtotal
      FROM ecom_carts c
      JOIN ecom_cart_items ci ON c.id = ci.cart_id
      JOIN ecom_products p ON ci.product_id = p.id
      WHERE c.tenant_id = ${tenantId} AND c.user_id = ${userId}
      GROUP BY c.id
    `);

    if (cartData.length === 0 || cartData[0].subtotal === null) {
      throw new BadRequestException('Cart is empty. Cannot apply promo code.');
    }
    const cartId = cartData[0].cart_id;
    const cartSubtotal = parseFloat(cartData[0].subtotal);

    // Fetch promo code details
    const promo = await (this.db as any).execute(sql`
      SELECT id, type, value, min_cart_value, max_uses, current_uses, start_date, end_date, is_active
      FROM ecom_promo_codes
      WHERE code = ${promoCode} AND tenant_id = ${tenantId} AND is_active = TRUE
    `);

    if (!promo || promo.length === 0) {
      throw new NotFoundException('Promo code not found or invalid.');
    }

    const promoDetails = promo[0];
    const now = new Date();
    if (new Date(promoDetails.start_date) > now || new Date(promoDetails.end_date) < now) {
      throw new BadRequestException('Promo code is expired or not yet active.');
    }
    if (promoDetails.max_uses !== null && promoDetails.current_uses >= promoDetails.max_uses) {
      throw new BadRequestException('Promo code has reached its maximum usage limit.');
    }
    if (promoDetails.min_cart_value !== null && cartSubtotal < parseFloat(promoDetails.min_cart_value)) {
      throw new BadRequestException(`Minimum cart value of $${parseFloat(promoDetails.min_cart_value).toFixed(2)} not met.`);
    }

    let discountAmount = 0;
    if (promoDetails.type === 'PERCENT') {
      discountAmount = cartSubtotal * (parseFloat(promoDetails.value) / 100);
    } else if (promoDetails.type === 'FIXED') {
      discountAmount = parseFloat(promoDetails.value);
    } else {
      throw new InternalServerErrorException('Unknown promo code type.');
    }

    // Cap discount amount at subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);

    // Update cart with promo code and discount
    await (this.db as any).execute(sql`
      UPDATE ecom_carts
      SET promo_code_id = ${promoDetails.id}, discount_amount = ${discountAmount.toFixed(2)}, updated_at = NOW()
      WHERE id = ${cartId}
    `);

    // Increment promo code usage count
    await (this.db as any).execute(sql`
      UPDATE ecom_promo_codes
      SET current_uses = current_uses + 1, updated_at = NOW()
      WHERE id = ${promoDetails.id}
    `);

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_promo_code_applied',
      details: { cartId, promoCodeId: promoDetails.id, discountAmount: discountAmount.toFixed(2) },
    });

    return { message: 'Promo code applied successfully.', discountAmount: discountAmount.toFixed(2) };
  }

  @UseGuards(AuthGuard)
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async completeCheckout(@Req() req: RequestWithUser, @Body() body: CheckoutDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { paymentMethodId, shippingAddress, billingAddress } = body;

    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant ID and User ID are required.');
    }
    if (!paymentMethodId || !shippingAddress || !billingAddress) {
      throw new BadRequestException('Payment method and address details are required.');
    }

    // Start a transaction for the entire checkout process to ensure atomicity
    const checkoutResult = await (this.db as any).transaction(async (tx) => {
      // 1. Get cart details and calculate final amount
      const cartItemsResult = await tx.execute(sql`
        SELECT
            c.id AS cart_id,
            c.promo_code_id,
            c.discount_amount,
            ci.product_id,
            p.name AS product_name,
            p.price AS product_unit_price,
            ci.quantity,
            p.stock AS product_stock
        FROM ecom_carts c
        JOIN ecom_cart_items ci ON c.id = ci.cart_id
        JOIN ecom_products p ON ci.product_id = p.id
        WHERE c.tenant_id = ${tenantId} AND c.user_id = ${userId}
        FOR UPDATE -- Lock cart rows to prevent concurrent modifications
      `);

      if (cartItemsResult.length === 0) {
        throw new BadRequestException('Your cart is empty.');
      }

      const cartId = cartItemsResult[0].cart_id;
      const promoCodeId = cartItemsResult[0].promo_code_id;
      const discountAmount = parseFloat(cartItemsResult[0].discount_amount || '0.00');

      let subtotalAmount = 0;
      for (const item of cartItemsResult) {
        if (item.product_stock < item.quantity) {
          throw new BadRequestException(`Product "${item.product_name}" is out of stock or does not have enough quantity. Available: ${item.product_stock}, Requested: ${item.quantity}`);
        }
        subtotalAmount += parseFloat(item.product_unit_price) * item.quantity;
      }

      // Fetch dynamic rates (tax, shipping, loyalty) from DB config
      const configResults = await tx.execute(sql`
        SELECT key, value FROM ecom_configs WHERE tenant_id = ${tenantId} AND key IN ('tax_rate_percent', 'base_shipping_cost', 'loyalty_earn_rate_percent')
      `);

      const config = configResults.reduce((acc, row) => {
        acc[row.key] = parseFloat(row.value);
        return acc;
      }, {});

      const taxRate = config['tax_rate_percent'] || 0; // Default to 0 if not configured
      const baseShippingCost = config['base_shipping_cost'] || 0; // Default to 0 if not configured
      const loyaltyEarnRate = config['loyalty_earn_rate_percent'] || 0; // Default to 0 if not configured

      const taxableAmount = subtotalAmount - discountAmount;
      const taxAmount = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0;
      const shippingAmount = baseShippingCost; // Simple flat rate for now; could be more complex
      const totalAmount = subtotalAmount - discountAmount + taxAmount + shippingAmount;

      if (totalAmount <= 0) {
        throw new BadRequestException('Total amount must be greater than zero to complete checkout.');
      }

      // 2. Process Payment (Simulated)
      // In a real system, this would involve calling an external payment gateway service
      // Example: const paymentResponse = await (this.paymentService as any).charge(paymentMethodId, totalAmount, 'USD', userId);
      // For this task, we simulate success/failure.
      const paymentSuccess = Math.random() > 0.1; // 90% success rate for simulation
      if (!paymentSuccess) {
        await (this.auditLogService as any).record(tenantId, {
          userId,
          action: 'ecom_checkout_payment_failed',
          details: { cartId, totalAmount: totalAmount.toFixed(2), paymentMethodId, shippingAddress, billingAddress },
        });
        throw new BadRequestException('Payment failed. Please try again or use a different payment method.');
      }
      const transactionId = `txn_${crypto.randomUUID()}`; // Simulate a payment gateway transaction ID

      // 3. Create Order
      const newOrder = await tx.execute(sql`
        INSERT INTO ecom_orders (
            id, tenant_id, user_id, status, subtotal_amount, discount_amount, tax_amount, shipping_amount, total_amount, promo_code_id, created_at, updated_at
        ) VALUES (
            crypto.randomUUID(), ${tenantId}, ${userId}, 'pending', ${subtotalAmount.toFixed(2)}, ${discountAmount.toFixed(2)},
            ${taxAmount.toFixed(2)}, ${shippingAmount.toFixed(2)}, ${totalAmount.toFixed(2)}, ${promoCodeId}, NOW(), NOW()
        ) RETURNING id, status
      `);
      const orderId = newOrder[0].id;

      // 4. Create Order Items
      for (const item of cartItemsResult) {
        await tx.execute(sql`
          INSERT INTO ecom_order_items (
              id, order_id, product_id, product_name_snapshot, quantity, unit_price_snapshot, subtotal_snapshot, created_at
          ) VALUES (
              crypto.randomUUID(), ${orderId}, ${item.product_id}, ${item.product_name}, ${item.quantity},
              ${item.product_unit_price}, ${(parseFloat(item.product_unit_price) * item.quantity).toFixed(2)}, NOW()
          )
        `);
      }

      // 5. Record Payment
      await tx.execute(sql`
        INSERT INTO ecom_order_payments (
            id, order_id, payment_method_id, amount, currency, transaction_id, status, created_at, updated_at
        ) VALUES (
            crypto.randomUUID(), ${orderId}, ${paymentMethodId}, ${totalAmount.toFixed(2)}, 'USD', ${transactionId}, 'completed', NOW(), NOW()
        )
      `);

      // 6. Record Shipping Address
      await tx.execute(sql`
        INSERT INTO ecom_order_shipping (
            id, order_id, address_line1, address_line2, city, state, zip, country, cost, status, created_at, updated_at
        ) VALUES (
            crypto.randomUUID(), ${orderId}, ${shippingAddress.line1}, ${shippingAddress.line2 || null}, ${shippingAddress.city},
            ${shippingAddress.state}, ${shippingAddress.zip}, ${shippingAddress.country}, ${shippingAmount.toFixed(2)}, 'pending', NOW(), NOW()
        )
      `);

      // 7. Add initial order status timeline entry
      await tx.execute(sql`
        INSERT INTO ecom_order_statuses (
            id, order_id, status, timestamp, details
        ) VALUES (
            crypto.randomUUID(), ${orderId}, 'pending', NOW(), 'Order created and payment received.'
        )
      `);

      // 8. Update product stock (fulfillment part 1)
      for (const item of cartItemsResult) {
        await tx.execute(sql`
          UPDATE ecom_products
          SET stock = stock - ${item.quantity}, updated_at = NOW()
          WHERE id = ${item.product_id}
        `);
      }

      // 9. Clear Cart
      await tx.execute(sql`
        DELETE FROM ecom_cart_items WHERE cart_id = ${cartId}
      `);
      await tx.execute(sql`
        UPDATE ecom_carts
        SET promo_code_id = NULL, discount_amount = 0.00, updated_at = NOW()
        WHERE id = ${cartId}
      `);

      // 10. Loyalty points earning (optional, based on total amount)
      if (loyaltyEarnRate > 0) {
        const pointsEarned = (totalAmount * (loyaltyEarnRate / 100)).toFixed(0); // Round to whole points
        if (parseInt(pointsEarned) > 0) {
          await tx.execute(sql`
            INSERT INTO ecom_loyalty_transactions (
                id, tenant_id, user_id, order_id, type, points_amount, created_at
            ) VALUES (
                crypto.randomUUID(), ${tenantId}, ${userId}, ${orderId}, 'EARN', ${pointsEarned}, NOW()
            )
          `);
          // A corresponding UPDATE to the user's loyalty_points column would typically go here
          // Example: await tx.execute(sql`UPDATE users SET loyalty_points = loyalty_points + ${pointsEarned} WHERE id = ${userId}`);
        }
      }

      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'ecom_checkout_completed',
        details: { orderId, totalAmount: totalAmount.toFixed(2), paymentMethodId, shippingAddress, billingAddress, cartId, promoCodeId },
      });

      return {
        orderId,
        totalAmount: totalAmount.toFixed(2),
        message: 'Checkout completed successfully!',
      };
    }).catch(error => {
      // Re-throw specific exceptions, log others as internal errors
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'ecom_checkout_failed_unexpected',
        details: { error: error.message, stack: error.stack, cartDetails: body },
      });
      throw new InternalServerErrorException('An unexpected error occurred during checkout. Please try again.');
    });

    return checkoutResult;
  }

  @UseGuards(AuthGuard)
  @Get('orders')
  async listOrders(@Req() req: RequestWithUser) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant ID and User ID are required.');
    }

    const orders = await (this.db as any).execute(sql`
      SELECT
          o.id,
          o.status,
          o.total_amount,
          o.created_at,
          os.address_line1 AS shipping_address_line1,
          os.city AS shipping_city,
          os.state AS shipping_state,
          os.zip AS shipping_zip
      FROM ecom_orders o
      LEFT JOIN ecom_order_shipping os ON o.id = os.order_id
      WHERE o.tenant_id = ${tenantId} AND o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `);

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_orders_listed',
      details: { count: orders.length },
    });

    return orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: parseFloat(order.total_amount).toFixed(2),
      createdAt: order.created_at,
      shippingAddress: {
        line1: order.shipping_address_line1,
        city: order.shipping_city,
        state: order.shipping_state,
        zip: order.shipping_zip,
      },
    }));
  }

  @UseGuards(AuthGuard)
  @Get('orders/:id')
  async getOrderDetail(@Req() req: RequestWithUser, @Param('id') orderId: string) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    if (!tenantId || !userId || !orderId) {
      throw new BadRequestException('Invalid request parameters.');
    }

    const orderData = await (this.db as any).execute(sql`
      SELECT
          o.id,
          o.status,
          o.subtotal_amount,
          o.discount_amount,
          o.tax_amount,
          o.shipping_amount,
          o.total_amount,
          o.created_at,
          o.updated_at,
          pc.code AS promo_code,
          oship.address_line1 AS shipping_address_line1,
          oship.address_line2 AS shipping_address_line2,
          oship.city AS shipping_city,
          oship.state AS shipping_state,
          oship.zip AS shipping_zip,
          oship.country AS shipping_country,
          oship.cost AS shipping_cost,
          oship.tracking_number AS shipping_tracking_number,
          oship.status AS shipping_status,
          opay.payment_method_id,
          opay.amount AS payment_amount,
          opay.transaction_id AS payment_transaction_id,
          opay.status AS payment_status
      FROM ecom_orders o
      LEFT JOIN ecom_promo_codes pc ON o.promo_code_id = pc.id
      LEFT JOIN ecom_order_shipping oship ON o.id = oship.order_id
      LEFT JOIN ecom_order_payments opay ON o.id = opay.order_id
      WHERE o.id = ${orderId} AND o.tenant_id = ${tenantId} AND o.user_id = ${userId}
    `);

    if (orderData.length === 0) {
      throw new NotFoundException('Order not found or does not belong to user/tenant.');
    }

    const order = orderData[0];

    const orderItems = await (this.db as any).execute(sql`
      SELECT
          id, product_id, product_name_snapshot, quantity, unit_price_snapshot, subtotal_snapshot
      FROM ecom_order_items
      WHERE order_id = ${orderId}
      ORDER BY id
    `);

    const orderTimeline = await (this.db as any).execute(sql`
      SELECT
          status, timestamp, details
      FROM ecom_order_statuses
      WHERE order_id = ${orderId}
      ORDER BY timestamp
    `);

    const detailedOrder = {
      id: order.id,
      status: order.status,
      subtotalAmount: parseFloat(order.subtotal_amount).toFixed(2),
      discountAmount: parseFloat(order.discount_amount).toFixed(2),
      taxAmount: parseFloat(order.tax_amount).toFixed(2),
      shippingAmount: parseFloat(order.shipping_amount).toFixed(2),
      totalAmount: parseFloat(order.total_amount).toFixed(2),
      promoCode: order.promo_code,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: orderItems.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name_snapshot,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price_snapshot).toFixed(2),
        subtotal: parseFloat(item.subtotal_snapshot).toFixed(2),
      })),
      shippingDetails: {
        addressLine1: order.shipping_address_line1,
        addressLine2: order.shipping_address_line2,
        city: order.shipping_city,
        state: order.shipping_state,
        zip: order.shipping_zip,
        country: order.shipping_country,
        cost: parseFloat(order.shipping_cost).toFixed(2),
        trackingNumber: order.shipping_tracking_number,
        status: order.shipping_status,
      },
      paymentDetails: {
        methodId: order.payment_method_id,
        amount: parseFloat(order.payment_amount).toFixed(2),
        transactionId: order.payment_transaction_id,
        status: order.payment_status,
      },
      timeline: orderTimeline.map(entry => ({
        status: entry.status,
        timestamp: entry.timestamp,
        details: entry.details,
      })),
    };

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'ecom_order_detail_viewed',
      details: { orderId: order.id },
    });

    return detailedOrder;
  }
}






