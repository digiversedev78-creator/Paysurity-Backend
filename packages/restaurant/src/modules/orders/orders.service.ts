import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  async getOrders(): Promise<string[]> {
    return ['Order1', 'Order2'];
  }
}
