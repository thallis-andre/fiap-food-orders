import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { RemoveItemsFromOrderCommand } from '../../application/order/commands/remove-items-from-order.command';
import { RemoveItemsFromOrderInput } from '../../application/order/dtos/remove-items-from-order.input';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders' })
export class RemoveItemsFromOrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Removes items from an existing order',
    description: 'Removes items from an existing order',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async execute(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body() data: RemoveItemsFromOrderInput,
  ) {
    data.id = id;
    await this.commandBus.execute(new RemoveItemsFromOrderCommand(data));
  }
}
