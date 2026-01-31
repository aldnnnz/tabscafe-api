import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as crypto from 'crypto'

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async handleWebhook(payload: any, signature: string) {
    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      status_message,
      signature_key,
      transaction_id,
      transaction_time,
      gross_amount,
    } = payload

    
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const rawSignature = `${order_id}${transaction_status}${gross_amount}${serverKey}`
    const expectedSignature = crypto
      .createHash('sha512')
      .update(rawSignature)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      throw new BadRequestException('Invalid signature')
    }

   
    return this.prisma.$transaction(async (tx) => {
      // cari order
      const order = await tx.order.findUnique({
        where: { orderCode: order_id },
        include: {
          orderItems: true,
        },
      })

      if (!order) {
        throw new BadRequestException('Order not found')
      }

     
      if (
        order.paymentStatus === transaction_status &&
        order.fraudStatus === fraud_status
      ) {
        return { message: 'Already processed' }
      }

      
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: transaction_status,
          fraudStatus: fraud_status,
        },
      })

 
      await tx.paymentLog.create({
        data: {
          orderId: order.id,
          orderCode: order.orderCode,
          oldStatus: order.paymentStatus,
          newStatus: transaction_status,
          statusMessage: status_message,
          midtransOrderId: order_id,
          midtransTransactionId: transaction_id,
          notificationType: payment_type,
          transactionTime: transaction_time
            ? new Date(transaction_time)
            : undefined,
          rawData: payload,
          processedBy: 'webhook',
        },
      })

     
      const failedStatuses = ['deny', 'cancel', 'expire']

      if (failedStatuses.includes(transaction_status)) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedStock: {
                decrement: item.quantity,
              },
            },
          })
        }
      }

      return { message: 'Webhook processed' }
    })
  }
}
