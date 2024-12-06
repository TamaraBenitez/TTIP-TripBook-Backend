import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';


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

  async update(id: string, updatedUser: UpdateUserDto | VerifyUserDto): Promise<UpdateUserResponseDto> {
    await this.userRepository.update(id, updatedUser);
    const user = await this.findOneById(id);
    return plainToInstance(UpdateUserResponseDto, user, { excludeExtraneousValues: true });
  }


}
