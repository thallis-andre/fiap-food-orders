export enum EOrderRejectionReason {
  PaymentRejected = 'PaymentRejected',
}

export type OrderRejectionReason = `${EOrderRejectionReason}`;
