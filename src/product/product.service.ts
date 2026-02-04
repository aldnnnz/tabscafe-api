import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ProductService {
constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
      include: {category: true},
      },
    );
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: true },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        notes: dto.notes,
        origin: dto.origin,
        badge: dto.badge,
        images: dto.images ?? [],
        price: dto.price,
        discountPrice: dto.discountPrice,
        isOnSale: !!dto.discountPrice,
        roast: dto.roast,
        weight: dto.weight,
        stock: dto.stock ?? 0,
        sku: dto.sku,
        categoryId: dto.categoryId,
      },
    })
  }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
