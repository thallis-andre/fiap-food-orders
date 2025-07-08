import { StatusTransitionException } from '../errors/status-transition.exception';
import {
  EOrderStatus,
  OrderStatus,
  OrderStatusValues,
} from './order-status.value';

const AllStatuses: OrderStatusValues[] = [
  EOrderStatus.Initiated,
  EOrderStatus.PaymentRequested,
  EOrderStatus.PreparationRequested,
  EOrderStatus.PreparationCompleted,
  EOrderStatus.PaymentRejected,
  EOrderStatus.Completed,
];

describe('OrderStatus', () => {
  describe.each(AllStatuses)('Static create', (value) => {
    it(`should create an instance of ${value}`, () => {
      const actual = OrderStatus.create(value);
      expect(actual.value).toBe(value);
      expect(actual.constructor.name).toBe(`${value}OrderStatus`);
    });
  });

  describe('Static request', () => {
    it('should create a new requested status', () => {
      const actual = OrderStatus.initiate();
      expect(actual.value).toBe(EOrderStatus.Initiated);
      expect(actual.constructor.name).toBe('InitiatedOrderStatus');
    });
  });

  describe.each([
    [EOrderStatus.Initiated, EOrderStatus.Initiated, false],
    [EOrderStatus.Initiated, EOrderStatus.PaymentRequested, true],
    [EOrderStatus.Initiated, EOrderStatus.PreparationRequested, false],
    [EOrderStatus.Initiated, EOrderStatus.PreparationStarted, false],
    [EOrderStatus.Initiated, EOrderStatus.PreparationCompleted, false],
    [EOrderStatus.Initiated, EOrderStatus.PaymentRejected, false],
    [EOrderStatus.Initiated, EOrderStatus.Completed, false],

    [EOrderStatus.PaymentRequested, EOrderStatus.Initiated, false],
    [EOrderStatus.PaymentRequested, EOrderStatus.PaymentRequested, false],
    [EOrderStatus.PaymentRequested, EOrderStatus.PreparationRequested, true],
    [EOrderStatus.PaymentRequested, EOrderStatus.PreparationStarted, false],
    [EOrderStatus.PaymentRequested, EOrderStatus.PreparationCompleted, false],
    [EOrderStatus.PaymentRequested, EOrderStatus.PaymentRejected, true],
    [EOrderStatus.PaymentRequested, EOrderStatus.Completed, false],

    [EOrderStatus.PreparationRequested, EOrderStatus.Initiated, false],
    [EOrderStatus.PreparationRequested, EOrderStatus.PaymentRequested, false],
    [
      EOrderStatus.PreparationRequested,
      EOrderStatus.PreparationRequested,
      false,
    ],
    [EOrderStatus.PreparationRequested, EOrderStatus.PreparationStarted, true],
    [
      EOrderStatus.PreparationRequested,
      EOrderStatus.PreparationCompleted,
      false,
    ],
    [EOrderStatus.PreparationRequested, EOrderStatus.PaymentRejected, false],
    [EOrderStatus.PreparationRequested, EOrderStatus.Completed, false],

    [EOrderStatus.PreparationStarted, EOrderStatus.Initiated, false],
    [EOrderStatus.PreparationStarted, EOrderStatus.PaymentRequested, false],
    [EOrderStatus.PreparationStarted, EOrderStatus.PreparationRequested, false],
    [EOrderStatus.PreparationStarted, EOrderStatus.PreparationStarted, false],
    [EOrderStatus.PreparationStarted, EOrderStatus.PreparationCompleted, true],
    [EOrderStatus.PreparationStarted, EOrderStatus.PaymentRejected, false],
    [EOrderStatus.PreparationStarted, EOrderStatus.Completed, false],

    [EOrderStatus.PreparationCompleted, EOrderStatus.Initiated, false],
    [EOrderStatus.PreparationCompleted, EOrderStatus.PaymentRequested, false],
    [
      EOrderStatus.PreparationCompleted,
      EOrderStatus.PreparationRequested,
      false,
    ],
    [EOrderStatus.PreparationCompleted, EOrderStatus.PreparationStarted, false],
    [
      EOrderStatus.PreparationCompleted,
      EOrderStatus.PreparationCompleted,
      false,
    ],
    [EOrderStatus.PreparationCompleted, EOrderStatus.PaymentRejected, false],
    [EOrderStatus.PreparationCompleted, EOrderStatus.Completed, true],

    [EOrderStatus.Completed, EOrderStatus.Initiated, false],
    [EOrderStatus.Completed, EOrderStatus.PaymentRequested, false],
    [EOrderStatus.Completed, EOrderStatus.PreparationRequested, false],
    [EOrderStatus.Completed, EOrderStatus.PreparationCompleted, false],
    [EOrderStatus.Completed, EOrderStatus.PaymentRejected, false],
    [EOrderStatus.Completed, EOrderStatus.Completed, false],

    [EOrderStatus.PaymentRejected, EOrderStatus.Initiated, false],
    [EOrderStatus.PaymentRejected, EOrderStatus.PaymentRequested, false],
    [EOrderStatus.PaymentRejected, EOrderStatus.PreparationRequested, false],
    [EOrderStatus.PaymentRejected, EOrderStatus.PreparationCompleted, false],
    [EOrderStatus.PaymentRejected, EOrderStatus.PaymentRejected, false],
    [EOrderStatus.PaymentRejected, EOrderStatus.Completed, false],
  ])('Order Status Transitions', (from, to, success) => {
    it(`should${success ? ' ' : ' not '}allow transition from ${from} to ${to}`, () => {
      const target = OrderStatus.create(from as OrderStatusValues);
      const methods: Record<OrderStatusValues, string> = {
        [EOrderStatus.Initiated]: 'initiate',
        [EOrderStatus.Completed]: 'complete',
        [EOrderStatus.PreparationRequested]: 'requestPreparation',
        [EOrderStatus.PreparationStarted]: 'startPreparation',
        [EOrderStatus.PreparationCompleted]: 'completePreparation',
        [EOrderStatus.PaymentRequested]: 'requestPayment',
        [EOrderStatus.PaymentRejected]: 'rejectPayment',
      };
      const method = methods[to];
      if (success) {
        const actual = target[method]();
        expect(actual.value).toBe(to);
      } else {
        expect(() => target[method]()).toThrow(
          new StatusTransitionException(from, to),
        );
      }
    });
  });
});
