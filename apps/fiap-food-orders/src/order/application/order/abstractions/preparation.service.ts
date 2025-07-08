import { OrderItem } from '../../../domain/values/order-item.value';

export abstract class PreparationService {
  abstract requestPreparation(
    orderId: string,
    items: OrderItem[],
  ): Promise<{ conciliationId: string }>;
}
