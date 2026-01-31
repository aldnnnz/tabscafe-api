// src/order/order.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common'
import { OrderService } from './order.service'
import { JwtAuthGuard } from '../auth/guard/auth.guard'
import { RolesGuard } from '../auth/guard/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  checkout(@CurrentUser() user: any) {
    return this.orderService.checkout(user.sub)
  }
}
