import { StatusTransitionException } from '../errors/status-transition.exception';

export enum EOrderStatus {
  Initiated = 'Initiated',
  PaymentRequested = 'PaymentRequested',
  PreparationRequested = 'PreparationRequested',
  PreparationStarted = 'PreparationStarted',
  PreparationCompleted = 'PreparationCompleted',
  Completed = 'Completed',
  PaymentRejected = 'PaymentRejected',
}

export type OrderStatusValues = `${EOrderStatus}`;

export abstract class OrderStatus {
  protected abstract readonly _value: OrderStatusValues;

  get value() {
    return this._value;
  }

  static create(value: OrderStatusValues): OrderStatus {
    const StatusMap: Record<OrderStatusValues, new () => OrderStatus> = {
      [EOrderStatus.Initiated]: InitiatedOrderStatus,
      [EOrderStatus.PaymentRequested]: PaymentRequestedOrderStatus,
      [EOrderStatus.PreparationRequested]: PreparationRequestedOrderStatus,
      [EOrderStatus.PreparationStarted]: PreparationStartedOrderStatus,
      [EOrderStatus.PreparationCompleted]: PreparationCompletedOrderStatus,
      [EOrderStatus.PaymentRejected]: PaymentRejectedOrderStatus,
      [EOrderStatus.Completed]: CompletedOrderStatus,
    };

    const Status = StatusMap[value];

    return new Status();
  }

  static initiate() {
    return OrderStatus.create(EOrderStatus.Initiated);
  }

  initiate(): OrderStatus {
    throw new StatusTransitionException(this._value, EOrderStatus.Initiated);
  }

  requestPayment(): OrderStatus {
    throw new StatusTransitionException(
      this._value,
      EOrderStatus.PaymentRequested,
    );
  }

  requestPreparation(): OrderStatus {
    throw new StatusTransitionException(
      this._value,
      EOrderStatus.PreparationRequested,
    );
  }

  startPreparation(): OrderStatus {
    throw new StatusTransitionException(
      this._value,
      EOrderStatus.PreparationStarted,
    );
  }

  completePreparation(): OrderStatus {
    throw new StatusTransitionException(
      this._value,
      EOrderStatus.PreparationCompleted,
    );
  }

  complete(): OrderStatus {
    throw new StatusTransitionException(this._value, EOrderStatus.Completed);
  }

  rejectPayment(): OrderStatus {
    throw new StatusTransitionException(
      this._value,
      EOrderStatus.PaymentRejected,
    );
  }
}

class InitiatedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.Initiated;

  requestPayment() {
    return OrderStatus.create(EOrderStatus.PaymentRequested);
  }
}

class PaymentRequestedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.PaymentRequested;

  requestPreparation() {
    return OrderStatus.create(EOrderStatus.PreparationRequested);
  }

  rejectPayment() {
    return OrderStatus.create(EOrderStatus.PaymentRejected);
  }
}

class PreparationRequestedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.PreparationRequested;

  startPreparation() {
    return OrderStatus.create(EOrderStatus.PreparationStarted);
  }
}

class PreparationStartedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.PreparationStarted;

  completePreparation() {
    return OrderStatus.create(EOrderStatus.PreparationCompleted);
  }
}

class PreparationCompletedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.PreparationCompleted;

  complete() {
    return OrderStatus.create(EOrderStatus.Completed);
  }
}

class CompletedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.Completed;
}

class PaymentRejectedOrderStatus extends OrderStatus {
  protected _value: OrderStatusValues = EOrderStatus.PaymentRejected;
}
