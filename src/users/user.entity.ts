import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 80 })
  nombreUsuario: string;

  @Column({ unique: true, length: 150 })
  correo: string;

  @Column({ length: 150, nullable: true })
  nombreCompleto?: string;

  @Column({ length: 50, nullable: true })
  telefono?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.usuarios, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
} 