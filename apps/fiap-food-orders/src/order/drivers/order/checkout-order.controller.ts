import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  CheckoutOrderCommand,
  CheckoutOrderResult,
} from '../../application/order/commands/checkout-order.command';
import { CheckoutOrderOutput } from '../../application/order/dtos/checkout-order.output';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders' })
export class CheckoutOrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':id/checkout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Checkout Order',
    description: 'Confirms order checkout and requests payment info',
  })
  @ApiOkResponse({ type: CheckoutOrderOutput })
  @ApiBadRequestResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async execute(@Param('id', new ObjectIdValidationPipe()) id: string) {
    const result = await this.commandBus.execute<
      CheckoutOrderCommand,
      CheckoutOrderResult
    >(new CheckoutOrderCommand(id));

    return result.data;
  }
}
