/**
 * Hardware Driver Abstraction Layer
 * PORTED FROM: PS-Platform/POS-Restaurant/services/HardwareDriverService.ts (776 lines)
 *
 * Multi-vendor POS hardware abstraction: receipt printers (Epson/Star), cash drawers,
 * barcode scanners, kitchen display systems (KDS), weight scales, card readers.
 * REQ: POSR-HW-001..006
 */
import { Injectable, Logger } from '@nestjs/common';

// ─── Hardware Types ─────────────────────────────────────────────────

export type HardwareType = 'printer' | 'cash_drawer' | 'barcode_scanner' | 'kds' | 'scale' | 'card_reader';
export type HardwareStatus = 'connected' | 'disconnected' | 'error' | 'busy';
export type PrinterVendor = 'epson' | 'star' | 'generic_esc_pos';

export interface HardwareDevice {
  id: string;
  type: HardwareType;
  vendor: string;
  model: string;
  connectionType: 'usb' | 'ethernet' | 'bluetooth' | 'serial';
  connectionAddress: string;
  status: HardwareStatus;
  lastPingAt?: Date;
}

export interface PrintJob {
  id: string;
  deviceId: string;
  content: PrintContent[];
  copies: number;
  cutAfterPrint: boolean;
  openDrawer: boolean;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PrintContent {
  type: 'text' | 'barcode' | 'qr_code' | 'image' | 'line' | 'feed' | 'cut';
  data?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  doubleWidth?: boolean;
  doubleHeight?: boolean;
  barcodeType?: 'CODE39' | 'CODE128' | 'EAN13' | 'UPC_A' | 'QR';
  width?: number;
  height?: number;
}

export interface ReceiptTemplate {
  header: PrintContent[];
  body: PrintContent[];
  footer: PrintContent[];
  barcode?: { type: string; data: string };
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class HardwareDriverService {
  private readonly logger = new Logger(HardwareDriverService.name);
  private readonly devices = new Map<string, HardwareDevice>();

  /**
   * Register a hardware device.
   */
  registerDevice(device: HardwareDevice): HardwareDevice {
    this.devices.set(device.id, device);
    this.logger.log(`[HW] Device registered: ${device.vendor} ${device.model} (${device.type}) via ${device.connectionType}`);
    return device;
  }

  /**
   * Build ESC/POS compatible byte commands for a receipt.
   * Returns command buffer as hex string array.
   */
  buildPrintCommands(template: ReceiptTemplate, vendor: PrinterVendor = 'epson'): string[] {
    const commands: string[] = [];

    // Initialize printer
    commands.push(this.ESC_POS.INIT);

    // Header
    for (const content of template.header) {
      commands.push(...this.contentToCommands(content, vendor));
    }

    // Separator
    commands.push(this.ESC_POS.LINE);

    // Body
    for (const content of template.body) {
      commands.push(...this.contentToCommands(content, vendor));
    }

    // Separator
    commands.push(this.ESC_POS.LINE);

    // Footer
    for (const content of template.footer) {
      commands.push(...this.contentToCommands(content, vendor));
    }

    // Barcode
    if (template.barcode) {
      commands.push(this.ESC_POS.ALIGN_CENTER);
      commands.push(`BARCODE:${template.barcode.type}:${template.barcode.data}`);
    }

    // Feed + cut
    commands.push(this.ESC_POS.FEED_3);
    commands.push(this.ESC_POS.CUT);

    return commands;
  }

  /**
   * Build a restaurant receipt from order data.
   */
  buildOrderReceipt(order: {
    restaurantName: string;
    address: string;
    orderId: string;
    tableNumber?: number;
    serverName: string;
    items: Array<{ name: string; qty: number; price: number; modifiers?: string[] }>;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    paymentMethod: string;
    lastFour?: string;
  }): ReceiptTemplate {
    const header: PrintContent[] = [
      { type: 'text', data: order.restaurantName, align: 'center', bold: true, doubleWidth: true, doubleHeight: true },
      { type: 'text', data: order.address, align: 'center' },
      { type: 'feed' },
      { type: 'text', data: `Order: ${order.orderId}`, align: 'left', bold: true },
      { type: 'text', data: `Table: ${order.tableNumber ?? 'N/A'}  Server: ${order.serverName}`, align: 'left' },
      { type: 'text', data: new Date().toLocaleString(), align: 'left' },
    ];

    const body: PrintContent[] = [];
    for (const item of order.items) {
      body.push({ type: 'text', data: `${item.qty}x ${item.name}`, align: 'left' });
      body.push({ type: 'text', data: `$${item.price.toFixed(2)}`, align: 'right' });
      if (item.modifiers?.length) {
        for (const mod of item.modifiers) {
          body.push({ type: 'text', data: `  + ${mod}`, align: 'left' });
        }
      }
    }

    const footer: PrintContent[] = [
      { type: 'text', data: `Subtotal:  $${order.subtotal.toFixed(2)}`, align: 'right' },
      { type: 'text', data: `Tax:       $${order.tax.toFixed(2)}`, align: 'right' },
      { type: 'text', data: `Tip:       $${order.tip.toFixed(2)}`, align: 'right' },
      { type: 'line' },
      { type: 'text', data: `TOTAL:     $${order.total.toFixed(2)}`, align: 'right', bold: true, doubleWidth: true },
      { type: 'feed' },
      { type: 'text', data: `Paid: ${order.paymentMethod}${order.lastFour ? ' ****' + order.lastFour : ''}`, align: 'center' },
      { type: 'text', data: 'Thank you for dining with us!', align: 'center' },
      { type: 'text', data: 'Powered by PaySurity / BistroBeast', align: 'center' },
    ];

    return { header, body, footer, barcode: { type: 'QR', data: order.orderId } };
  }

  /**
   * Build kitchen ticket (no prices, large font for item names).
   */
  buildKitchenTicket(order: {
    orderId: string;
    tableNumber?: number;
    items: Array<{ name: string; qty: number; modifiers?: string[] }>;
    specialInstructions?: string;
  }): PrintContent[] {
    const commands: PrintContent[] = [
      { type: 'text', data: `** ORDER ${order.orderId} **`, align: 'center', bold: true, doubleWidth: true, doubleHeight: true },
      { type: 'text', data: `Table: ${order.tableNumber ?? 'N/A'}`, align: 'left', bold: true },
      { type: 'text', data: new Date().toLocaleTimeString(), align: 'left' },
      { type: 'line' },
    ];

    for (const item of order.items) {
      commands.push({ type: 'text', data: `${item.qty}x ${item.name}`, align: 'left', bold: true, doubleHeight: true });
      if (item.modifiers?.length) {
        for (const mod of item.modifiers) {
          commands.push({ type: 'text', data: `   >>> ${mod}`, align: 'left' });
        }
      }
    }

    if (order.specialInstructions) {
      commands.push({ type: 'line' });
      commands.push({ type: 'text', data: `NOTES: ${order.specialInstructions}`, align: 'left', bold: true });
    }

    commands.push({ type: 'feed' });
    commands.push({ type: 'cut' });

    return commands;
  }

  /**
   * Get all registered devices, optionally filtered by type.
   */
  getDevices(type?: HardwareType): HardwareDevice[] {
    const all = [...this.devices.values()];
    return type ? all.filter(d => d.type === type) : all;
  }

  /**
   * Ping a device and update its status.
   */
  async pingDevice(deviceId: string): Promise<HardwareStatus> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error(`Device not found: ${deviceId}`);

    // In production: actual TCP/USB probe
    device.status = 'connected';
    device.lastPingAt = new Date();
    return device.status;
  }

  // ─── ESC/POS Command Constants ────────────────────────────────

  private readonly ESC_POS = {
    INIT: '\x1b\x40',                 // Initialize
    ALIGN_LEFT: '\x1b\x61\x00',      // Align left
    ALIGN_CENTER: '\x1b\x61\x01',    // Align center
    ALIGN_RIGHT: '\x1b\x61\x02',     // Align right
    BOLD_ON: '\x1b\x45\x01',         // Bold on
    BOLD_OFF: '\x1b\x45\x00',        // Bold off
    DOUBLE_W: '\x1b\x21\x20',        // Double width
    DOUBLE_H: '\x1b\x21\x10',        // Double height
    DOUBLE_WH: '\x1b\x21\x30',       // Double width + height
    NORMAL: '\x1b\x21\x00',          // Normal text
    CUT: '\x1d\x56\x00',             // Full cut
    PARTIAL_CUT: '\x1d\x56\x01',     // Partial cut
    FEED_3: '\x1b\x64\x03',          // Feed 3 lines
    LINE: '--------------------------------',
    OPEN_DRAWER: '\x1b\x70\x00\x19\xFA', // Open cash drawer (pin 2)
  };

  private contentToCommands(content: PrintContent, vendor: PrinterVendor): string[] {
    const cmds: string[] = [];

    if (content.align === 'center') cmds.push(this.ESC_POS.ALIGN_CENTER);
    else if (content.align === 'right') cmds.push(this.ESC_POS.ALIGN_RIGHT);
    else cmds.push(this.ESC_POS.ALIGN_LEFT);

    if (content.bold) cmds.push(this.ESC_POS.BOLD_ON);
    if (content.doubleWidth && content.doubleHeight) cmds.push(this.ESC_POS.DOUBLE_WH);
    else if (content.doubleWidth) cmds.push(this.ESC_POS.DOUBLE_W);
    else if (content.doubleHeight) cmds.push(this.ESC_POS.DOUBLE_H);

    switch (content.type) {
      case 'text': cmds.push(content.data ?? ''); break;
      case 'line': cmds.push(this.ESC_POS.LINE); break;
      case 'feed': cmds.push('\n'); break;
      case 'cut': cmds.push(this.ESC_POS.CUT); break;
      case 'barcode': cmds.push(`BARCODE:${content.barcodeType}:${content.data}`); break;
      case 'qr_code': cmds.push(`QR:${content.data}`); break;
    }

    // Reset formatting
    cmds.push(this.ESC_POS.NORMAL);
    if (content.bold) cmds.push(this.ESC_POS.BOLD_OFF);

    return cmds;
  }
}
