import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController, DiscountsPublicController } from './discounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  controllers: [DiscountsController, DiscountsPublicController],
  providers: [DiscountsService],
  exports: [DiscountsService],

})
export class DiscountsModule {}
