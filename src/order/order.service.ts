import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // ambil cart
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      })

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty')
      }

      //validasi stock
      for (const item of cart.items) {
        const available =
          item.product.stock - item.product.reservedStock

        if (item.quantity > available) {
          throw new BadRequestException(
            `Stock not enough for ${item.product.name}`,
          )
        }
      }

      // 3️⃣ reserve stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reservedStock: {
              increment: item.quantity,
            },
          },
        })
      }

      //hitung total
      const totalPrice = cart.items.reduce((sum, item) => {
        const price = item.product.discountPrice ?? item.product.price
        return sum + price * item.quantity
      }, 0)

      // 5️⃣ create order (PENDING)
      const order = await tx.order.create({
        data: {
          orderCode: `ORD-${Date.now()}`,
          userId,
          totalPrice,
          grandTotal: totalPrice,

          paymentStatus: 'PENDING', // ✅ PENTING

          customerName: 'Customer',
          customerEmail: 'customer@mail.com',
          customerPhone: '000000',
          shippingAddress: 'Address',
        },
      })

      // 6️⃣ create order items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            discountPrice: item.product.discountPrice,
            subtotal:
              (item.product.discountPrice ?? item.product.price) *
              item.quantity,
            productName: item.product.name,
            productImage: item.product.images?.[0],
            productWeight: item.product.weight,
          },
        })
      }

      // 7️⃣ clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      return {
        message: 'Checkout success',
        orderId: order.id,
        orderCode: order.orderCode,
      }
    })
  }
}
