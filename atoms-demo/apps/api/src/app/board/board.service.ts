import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from '@atoms-demo/data-access-db'; // 라이브러리 import

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 생성
  create(createBoardDto: CreateBoardDto) {
    return this.prisma.board.create({
      data: createBoardDto,
    });
  }

  // 2. 전체 조회
  findAll() {
    return this.prisma.board.findMany();
  }

  // 3. 단일 조회
  findOne(id: string) {
    return this.prisma.board.findUnique({
      where: { id },
    });
  }

  // 4. 수정
  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
    });
  }

  // 5. 삭제
  remove(id: string) {
    return this.prisma.board.delete({
      where: { id },
    });
  }
}
