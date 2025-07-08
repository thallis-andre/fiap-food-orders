import { FollowUpOutput } from '../dtos/follow-up.dto';

export class FollowUpOrdersQuery /* NOSONAR */ {}

export class FollowUpOrdersResult {
  constructor(public readonly data: FollowUpOutput) {}
}
