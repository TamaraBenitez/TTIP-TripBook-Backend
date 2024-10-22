import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { VerifyUserDto } from './dto/verify-user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch('/verify/:id')
  update(@Param('id') id: string, @Body() verifyUserDto: VerifyUserDto) {
    return this.userService.update(id, verifyUserDto);
  }
}
