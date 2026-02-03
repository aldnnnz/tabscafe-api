import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OrderAdminService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        orderItems: true,
      },
    })
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: { include: { product: true } },
      },
    })

    if (!order) throw new BadRequestException('Order not found')
    return order
  }

  async ship(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order) throw new BadRequestException('Order not found')

    if (order.status !== 'PROCESSING') {
      throw new BadRequestException('Order not ready to ship')
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
    })
  }

  async deliver(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order) throw new BadRequestException('Order not found')

    if (order.status !== 'SHIPPED') {
      throw new BadRequestException('Order not shipped yet')
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    })
  }
}
