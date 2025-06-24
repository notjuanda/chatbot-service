import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from './role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role], 'main-database'),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 