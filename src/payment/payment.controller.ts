import { Controller, Post, Headers, Body } from '@nestjs/common'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('webhook')
  async webhook(
    @Body() payload: any,
    @Headers('x-midtrans-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(payload, signature)
  }
}
