import { WithRoles } from '@fiap-food/setup';
import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FindOrdersInput } from '../../application/order/dtos/find-orders.input';
import { Order } from '../../application/order/dtos/order.dto';
import {
  FindOrdersQuery,
  FindOrdersResult,
} from '../../application/order/queries/find-orders.query';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders' })
export class FindOrdersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @WithRoles('ADMIN')
  @ApiOperation({
    summary: 'Find orders with the given criteria',
    description: 'Returns orders that match provided criteria',
  })
  @ApiOkResponse({ type: Order })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async execute(@Query() query: FindOrdersInput) {
    const result = await this.queryBus.execute<
      FindOrdersQuery,
      FindOrdersResult
    >(new FindOrdersQuery(query));

    return result;
  }
}
