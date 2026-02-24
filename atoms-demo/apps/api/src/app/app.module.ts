import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Nx가 설정한 별칭(Alias)을 사용하여 import
import { DataAccessDbModule } from '@atoms-demo/data-access-db';
import { BoardModule } from './board/board.module';

@Module({
  imports: [DataAccessDbModule, BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
