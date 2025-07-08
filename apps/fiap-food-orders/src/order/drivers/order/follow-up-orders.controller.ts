import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FollowUpOutput } from '../../application/order/dtos/follow-up.dto';
import {
  FollowUpOrdersQuery,
  FollowUpOrdersResult,
} from '../../application/order/queries/follow-up-orders.query';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders-follow-up' })
export class FollowUpOrdersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Order Follow Up',
    description: 'Returns Orders Follow Up',
  })
  @ApiOkResponse({ type: FollowUpOutput })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async execute() {
    const result = await this.queryBus.execute<
      FollowUpOrdersQuery,
      FollowUpOrdersResult
    >(new FollowUpOrdersQuery());

    return result.data;
  }
}
