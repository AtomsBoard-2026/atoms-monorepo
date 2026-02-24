import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 외부에서 PrismaService를 쓸 수 있게 내보냄
})
export class DataAccessDbModule {}
