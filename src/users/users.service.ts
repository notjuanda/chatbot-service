import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'main-database')
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(userId: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      });
      
      if (!user) {
        return null;
      }

      // Verificar que el usuario tenga al menos un rol de cliente
      const hasClientRole = user.roles?.some(role => 
        role.nombre === 'cliente' || role.nombre === 'CLIENTE'
      );

      return hasClientRole ? user : null;
    } catch (error) {
      console.error('Error validando usuario:', error);
      return null;
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'nombreUsuario', 'correo', 'nombreCompleto', 'telefono'],
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }
} 