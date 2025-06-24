import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductCategory } from '../database/product.entity';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule, 
    TypeOrmModule.forFeature([Product, ProductCategory], 'main-database')
  ],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 