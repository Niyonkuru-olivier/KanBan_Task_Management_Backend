import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepository.find();
    return users.map(({ passwordHash, ...user }) => user);
  }

  async findOne(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException('Email address is already in use');
      }
      user.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = await this.userRepository.save(user);
    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  async create(registerDto: any): Promise<Omit<User, 'passwordHash'>> {
    const { name, email, password, role } = registerDto;
    
    const existing = await this.userRepository.findOne({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email address is already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      name,
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role: role || 'member',
    });

    const savedUser = await this.userRepository.save(newUser);
    const { passwordHash: _, ...result } = savedUser;
    return result;
  }

  async updateRole(id: number, role: string): Promise<Omit<User, 'passwordHash'>> {
    if (role !== 'member' && role !== 'admin') {
      throw new ConflictException('Invalid role specified');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.role = role;
    const updatedUser = await this.userRepository.save(user);
    const { passwordHash, ...result } = updatedUser;
    return result;
  }
}
