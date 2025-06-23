import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/product.entity';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Product], 'PRODUCTS_DB')],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 