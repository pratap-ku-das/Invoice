import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { Category, CategorySchema, Unit, UnitSchema } from './category-unit.schema';
import { CategoriesService, ProductsService, UnitsService } from './catalog.service';
import { CategoriesController, ProductsController, UnitsController } from './catalog.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    InventoryModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
  ],
  controllers: [ProductsController, CategoriesController, UnitsController],
  providers: [ProductsService, CategoriesService, UnitsService],
  exports: [ProductsService, CategoriesService, UnitsService, MongooseModule],
})
export class CatalogModule {}
