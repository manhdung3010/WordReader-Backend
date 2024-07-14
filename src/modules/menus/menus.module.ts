import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenuPublicController, MenusController } from './menus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  controllers: [MenusController, MenuPublicController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
