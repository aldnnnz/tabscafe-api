import { Injectable, BadRequestException, UnauthorizedException} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const { name, email, password } = dto

    if (!email || !password || !name) {
      throw new BadRequestException('Name, email, and password are required')
    }

    const exists = await this.prisma.user.findUnique({
      where: { email },
    })

    if (exists) {
      throw new BadRequestException('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
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

    return {
      message: 'Register success',
      user,
    }
  }

  //login 
  async login(dto: any) {
    const { email, password } = dto

    if (!email || !password) {
      throw new BadRequestException('Email and password are required')
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload)

    return {
      message: 'Login success',
      access_token: accessToken,
    }
  }
}
