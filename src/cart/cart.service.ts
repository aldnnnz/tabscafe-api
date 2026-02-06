import { BadRequestException, Injectable } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      })
    }

    return cart
  }

  async getCart(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    })
  }

  async addItem(userId: string, productId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId)

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isAvailable) {
      throw new BadRequestException('Product not available')
    }

    if (quantity > product.stock) {
      throw new BadRequestException('Stock not enough')
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      const newQty = existingItem.quantity + quantity

      if (newQty > product.stock) {
        throw new BadRequestException('Stock not enough')
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      })
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })
  }

  
  async updateItem(userId: string, productId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId)

    return this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity },
    })
  }


  async removeItem(userId: string, productId: number) {
    const cart = await this.getOrCreateCart(userId)

    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })
  }
}
