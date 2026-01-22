import { Injectable, BadRequestException} from '@nestjs/common';
import  { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private jwtService: JwtService
  ) {}

  async register(dto: any) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (exists) {
      throw new BadRequestException('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return user
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }

    const isValid = await bcrypt.compare(dto.password, user.password)
    if (!isValid) {
      throw new BadRequestException('Invalid credentials')
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
        role: user.role,
      },
    )

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }
}
