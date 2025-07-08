import { AuthUser, ERoles, User, WithOptionalAuth } from '@fiap-food/setup';
import { Controller, ForbiddenException, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from '../../application/order/dtos/order.dto';
import {
  GetOrderByIdQuery,
  GetOrderByIdResult,
} from '../../application/order/queries/get-order-by-id.query';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders' })
export class GetOrderByIdController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @WithOptionalAuth()
  @ApiOperation({
    summary: 'Find an item with its id',
    description: 'Returns an existing item by querying it with its id',
  })
  @ApiOkResponse({ type: Order })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async execute(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @AuthUser() user: User,
  ) {
    const result = await this.queryBus.execute<
      GetOrderByIdQuery,
      GetOrderByIdResult
    >(new GetOrderByIdQuery(id));
    if (result.data.requester) {
      return this.handleNonAnonymousOrder(result, user);
    }
    return result.data;
  }

  private handleNonAnonymousOrder(result: GetOrderByIdResult, user: User) {
    const { data } = result;
    const { requester } = data;

    if (user?.role === ERoles.Admin) {
      return data;
    }

    const isUnauthorized = !user;
    const emailDoesNotMatch = requester.email !== user?.email;
    const cpfDoesNotMatch = requester.cpf !== user?.cpf;
    if (isUnauthorized || (emailDoesNotMatch && cpfDoesNotMatch)) {
      throw new ForbiddenException();
    }
    return data;
  }
}
