import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string

  @IsString()
  @MaxLength(100)
  slug: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsInt()
  sortOrder?: number
}