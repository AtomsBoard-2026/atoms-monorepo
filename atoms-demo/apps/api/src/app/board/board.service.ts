import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@atoms-demo/data-access-db';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  // 1. 생성: 보드 + 컬럼 + 카드를 한 번에 생성 (Nested Write)
  async create(createBoardDto: any) {
    return this.prisma.board.create({
      data: {
        title: createBoardDto.title,
        columns: {
          create: createBoardDto.columns?.map((col: any) => ({
            title: col.title,
            order: col.order,
            cards: {
              create: col.cards?.map((card: any) => ({
                title: card.title,
                order: card.order,
              })),
            },
          })),
        },
      },
      include: {
        columns: {
          include: { cards: true },
        },
      },
    });
  }

  // 2. 전체 조회: 보드 목록만 간단히 조회
  async findAll() {
    return this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. 단일 조회: 관계형 데이터를 프론트엔드용 JSON으로 조립 (Transform)
  async findOne(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            cards: { orderBy: { order: 'asc' } }, // 카드 순서 정렬
          },
          orderBy: { order: 'asc' }, // 컬럼 순서 정렬
        },
      },
    });

    if (!board) throw new NotFoundException('보드를 찾을 수 없습니다.');

    // DB의 '행(Row)' 데이터들을 프론트엔드의 '객체(JSON)' 구조로 변환
    const columns: Record<string, any> = {};
    const tasks: Record<string, any> = {};
    const columnOrder = board.columns.map((col) => {
      columns[col.id] = {
        id: col.id,
        title: col.title,
        taskIds: col.cards.map((card) => card.id),
      };

      col.cards.forEach((card) => {
        tasks[card.id] = {
          id: card.id,
          content: card.title,
        };
      });

      return col.id;
    });

    return {
      id: board.id,
      title: board.title,
      columns,
      tasks,
      columnOrder,
    };
  }

  // 4. 수정: 드래그 앤 드롭 결과를 DB에 일괄 반영 (Transaction)
  async update(id: string, updateData: any) {
    const { columns, title } = updateData;

    return this.prisma.$transaction(async (tx) => {
      // 보드 제목 수정
      if (title) {
        await tx.board.update({
          where: { id },
          data: { title },
        });
      }

      // 카드 위치 및 순서 변경 반영
      if (columns) {
        for (const colId in columns) {
          const column = columns[colId];
          await Promise.all(
            column.taskIds.map((taskId: string, index: number) =>
              tx.card.update({
                where: { id: taskId },
                data: {
                  columnId: colId, // 이동한 컬럼 ID
                  order: index,    // 새로운 순서 번호
                },
              })
            )
          );
        }
      }
    });
  }

  // 5. 삭제: 보드와 연관된 모든 데이터 삭제 (Cascade)
  async remove(id: string) {
    return this.prisma.board.delete({
      where: { id },
    });
  }
}
