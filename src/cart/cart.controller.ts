import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id)
  }

  @Post('items')
  addItem(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(user.id, dto.productId, dto.quantity)
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateItem(
      user.id,
      Number(productId),
      dto.quantity,
    )
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.id, Number(productId))
  }
}

