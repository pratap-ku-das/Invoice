import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovement, StockMovementSchema } from './stock-movement.schema';
import { Product, ProductSchema } from '../catalog/product.schema';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
