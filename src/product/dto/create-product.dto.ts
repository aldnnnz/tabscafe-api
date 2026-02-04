
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { RoastType } from 'src/generated/prisma/enums'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  slug: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  origin?: string

  @IsOptional()
  @IsString()
  badge?: string

  // Prisma: Json
  @IsArray()
  images: any[]

  @IsInt()
  @Min(0)
  price: number

  @IsOptional()
  @IsInt()
  @Min(0)
  discountPrice?: number

  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  roast: RoastType

  @IsOptional()
  @IsInt()
  weight?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number

  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsString()
  barcode?: string

  @IsOptional()
  @IsString()
  metaTitle?: string

  @IsOptional()
  @IsString()
  metaDescription?: string

  @IsInt()
  categoryId: number
}


