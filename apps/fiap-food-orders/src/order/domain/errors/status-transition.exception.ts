import { DomainException } from '@fiap-food/tactical-design/core';

export class StatusTransitionException extends DomainException {
  constructor(currentStatus: string, desiredStatus: string) {
    super(`Cannot transition from status ${currentStatus} to ${desiredStatus}`);
  }
}
