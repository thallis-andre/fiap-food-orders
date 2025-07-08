import { AggregateRoot } from '@fiap-food/tactical-design/core';
import { OrderAlreadyInAdvancedStatus } from './errors/order-already-closed.exception';
import { ItemAdded } from './events/item-added.event';
import { ItemRemoved } from './events/item-removed.event';
import { OrderCheckedOut } from './events/order-checked-out.event';
import { OrderCompleted } from './events/order-completed.event';
import { OrderCreated } from './events/order-created.event';
import { OrderPreparationCompleted } from './events/order-preparation-completed.event';
import { OrderPreparationRequested } from './events/order-preparation-requested.event';
import { OrderPreparationSarted } from './events/order-preparation-started.event';
import { OrderRejected } from './events/order-rejected.event';
import { Item } from './item.entity';
import { OrderItem } from './values/order-item.value';
import { OrderRejectionReason } from './values/order-rejection-reason.value';
import { EOrderStatus, OrderStatus } from './values/order-status.value';
import { Requester } from './values/requester.value';

export class Order extends AggregateRoot {
  constructor(
    protected readonly _id: string,
    private readonly _requester: Requester = null,
    private _status: OrderStatus = OrderStatus.initiate(),
    private _total: number = 0,
    private readonly _items: OrderItem[] = [],
    private _paymentId: string = null,
    private _qrCode: string = null,
    private _preparationId: string = null,
    private _preparationRequestedAt: Date = null,
    private _rejectionReason: string = null,
  ) {
    super(_id);
  }

  get status() {
    return this._status.value;
  }

  get requester(): Requester {
    return this._requester;
  }

  get total() {
    return this._total;
  }

  get items() {
    return this._items.map((x) => new OrderItem(x.key, x.name, x.price));
  }

  get paymentId() {
    return this._paymentId;
  }

  get qrCode() {
    return this._qrCode;
  }

  get preparationId() {
    return this._preparationId;
  }

  get preparationRequestedAt() {
    return this._preparationRequestedAt;
  }

  get rejectionReason() {
    return this._rejectionReason;
  }

  create() {
    this.apply(new OrderCreated());
  }

  [OrderCreated.handler]() {
    this._status = OrderStatus.initiate();
  }

  requestPreparation(preparationId: string) {
    this.apply(new OrderPreparationRequested(preparationId));
  }

  [OrderPreparationRequested.handler](event: OrderPreparationRequested) {
    this._status = this._status.requestPreparation();
    this._preparationId = event.preparationId;
    this._preparationRequestedAt = event.requestedAt;
  }

  startPreparation() {
    this.apply(new OrderPreparationSarted());
  }

  [OrderPreparationSarted.handler]() {
    this._status = this._status.startPreparation();
  }

  completePreparation() {
    this.apply(new OrderPreparationCompleted());
  }

  [OrderPreparationCompleted.handler]() {
    this._status = this._status.completePreparation();
  }
  reject(reason: OrderRejectionReason) {
    this.apply(new OrderRejected(reason));
  }

  [OrderRejected.handler](event: OrderRejected) {
    this._status = this._status.rejectPayment();
    this._rejectionReason = event.reason;
  }

  complete() {
    this.apply(new OrderCompleted());
  }

  [OrderCompleted.handler]() {
    this._status = this._status.complete();
  }

  addItem(item: Item) {
    const status = this._status.value;
    if (status !== EOrderStatus.Initiated) {
      throw new OrderAlreadyInAdvancedStatus();
    }
    this.apply(new ItemAdded(OrderItem.fromItem(item)));
  }

  [ItemAdded.handler]({ item }: ItemAdded) {
    this._items.push(item);
    this.calculatePrice(item.price);
  }

  removeItem(item: OrderItem) {
    const status = this._status.value;
    if (status !== EOrderStatus.Initiated) {
      throw new OrderAlreadyInAdvancedStatus();
    }
    this.apply(new ItemRemoved(item));
  }

  [ItemRemoved.handler]({ item }: ItemRemoved) {
    const foundItem = this._items.findIndex((x) => x.key === item.key);
    if (foundItem < 0) {
      return;
    }
    this._items.splice(foundItem, 1);
    this.calculatePrice(-item.price);
  }

  checkout(paymentId: string, qrCode: string) {
    this.apply(new OrderCheckedOut(paymentId, qrCode));
  }

  [OrderCheckedOut.handler](event: OrderCheckedOut) {
    this._status = this._status.requestPayment();
    this._paymentId = event.paymentId;
    this._qrCode = event.qrCode;
  }

  private calculatePrice(itemPrice: number) {
    const ensureFinancialAmount = (value: number) => Number(value.toFixed(2));
    this._total = ensureFinancialAmount(this._total + itemPrice);
  }
}
