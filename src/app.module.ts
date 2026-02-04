import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';



@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PaymentModule,
    ConfigModule.forRoot({ 
      isGlobal: true
     }),
    ProductModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
