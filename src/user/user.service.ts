import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }
  async createUser(createUserDto: CreateUserDto) {
    return await this.userRepository.save(createUserDto)
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email })
  }


  async findOneById(id: string): Promise<User> {

    return await this.userRepository.findOneBy({ id })
  }

  async findByVerifyToken(token: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { emailVerificationToken: token }
    });
  }

  async updateWithUpdateUserDto(id: string, updatedUser: UpdateUserDto): Promise<UpdateUserResponseDto> {

    if (updatedUser.email) {
      const emailExists = await this.userRepository.findOne({ where: { email: updatedUser.email } });
      if (emailExists && emailExists.id !== id) {
        throw new BadRequestException('El correo electrónico ya está en uso.');
      }
    }

    if (updatedUser.currentPassword || updatedUser.password) {
      if (!updatedUser.currentPassword || !updatedUser.password) {
        throw new BadRequestException('Debe proporcionar la contraseña actual y la nueva contraseña.');
      }

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      const isPasswordValid = await bcrypt.compare(updatedUser.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('La contraseña actual no es correcta.');
      }

      updatedUser.password = await bcrypt.hash(updatedUser.password, 12);
    }

    const { currentPassword, ...rest } = updatedUser

    await this.userRepository.update(id, rest);
    const user = await this.findOneById(id);
    return plainToInstance(UpdateUserResponseDto, user, { excludeExtraneousValues: true });
  }

  async updateWithVerifyUserDto(id: string, updatedUser: VerifyUserDto): Promise<UpdateUserResponseDto> {

    await this.userRepository.update(id, updatedUser);
    const user = await this.findOneById(id);
    return plainToInstance(UpdateUserResponseDto, user, { excludeExtraneousValues: true });
  }

  async update(id: string, updatedUser: UpdateUserDto | VerifyUserDto): Promise<UpdateUserResponseDto> {
    if ('nroDni' in updatedUser && 'nroTramiteDni' in updatedUser && 'gender' in updatedUser) {
      return this.updateWithVerifyUserDto(id, updatedUser as VerifyUserDto);
    } else {
      return this.updateWithUpdateUserDto(id, updatedUser as UpdateUserDto);
    }
  }


}
