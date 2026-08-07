// ...existing code...
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // ...existing code...
  async register(registerDto: RegisterDto) {
    // required fields
    if (!registerDto?.name || !registerDto?.email || !registerDto?.password) {
      throw new BadRequestException('Name, email and password are required');
    }

    const name = String(registerDto.name).trim();
    const email = String(registerDto.email).trim().toLowerCase();
    const passwordRaw = registerDto.password;

    if (typeof passwordRaw !== 'string') {
      throw new BadRequestException('Password must be a string');
    }

    const password = passwordRaw.trim();

    // explicit password rules (clear, strict checks)
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must include at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must include at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      throw new BadRequestException('Password must include at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new BadRequestException('Password must include at least one special character (e.g. @, !, #)');
    }

    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      name,
      email,
      passwordHash,
      role: registerDto.role || 'member',
    });

    const savedUser = await this.userRepository.save(newUser);
    const { passwordHash: _, ...result } = savedUser;

    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: result,
      accessToken,
    };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { passwordHash: _, ...result } = user;

    return {
      message: 'Login successful',
      user: result,
      accessToken,
    };
  }
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }
}
