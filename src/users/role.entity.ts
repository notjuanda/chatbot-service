import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  nombre: string;

  @Column({ length: 200, nullable: true })
  descripcion?: string;

  @ManyToMany(() => User, (user) => user.roles)
  usuarios: User[];
} 