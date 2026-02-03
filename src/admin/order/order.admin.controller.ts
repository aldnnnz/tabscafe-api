import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/guard/auth.guard'
import { RolesGuard } from '../../auth/guard/roles.guard'
import { OrderAdminService } from './order.admin.service'
import { Roles } from '../../auth/decorators/roles.decorator'

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderAdminController {
  constructor(private service: OrderAdminService) {}


  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id)
  }


  @Patch(':id/ship')
  @Roles('ADMIN')
  ship(@Param('id') id: string) {
    return this.service.ship(+id)
  }

  @Patch(':id/deliver')
  @Roles('ADMIN')
  deliver(@Param('id') id: string) {
    return this.service.deliver(+id)
  }
}
