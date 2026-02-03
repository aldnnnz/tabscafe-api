import { Module } from "@nestjs/common";
import { OrderAdminController } from "./order/order.admin.controller";
import { OrderAdminService } from "./order/order.admin.service";

@Module({
    controllers: [OrderAdminController],
    providers: [OrderAdminService],
})
export class AdminModules {}