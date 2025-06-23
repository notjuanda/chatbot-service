import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Entidades simplificadas para el chatbot
@Entity({ name: 'brands' })
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;
}

@Entity({ name: 'ingredients' })
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;
}

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @ManyToOne(() => Brand, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  marca?: Brand;

  @Column('decimal', { precision: 10, scale: 2 })
  precioBob: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  precioUsd?: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: true })
  certificadoSinGluten: boolean;

  @Column({ nullable: true })
  urlCertificado?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Ingredient, { cascade: true })
  @JoinTable({ name: 'product_ingredients' })
  ingredientes: Ingredient[];
} 