import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // DB 대용 메모리 데이터
  private boardData = {
    columns: {
      'todo': { id: 'todo', title: '할 일 (To Do)', taskIds: ['task-1', 'task-2'] },
      'in-progress': { id: 'in-progress', title: '진행 중 (In Progress)', taskIds: [] },
      'done': { id: 'done', title: '완료 (Done)', taskIds: [] },
    },
    tasks: {
      'task-1': { id: 'task-1', content: 'Tailwind & UI-Kit 연동하기' },
      'task-2': { id: 'task-2', content: 'NestJS API 연동 성공!' },
    },
    columnOrder: ['todo', 'in-progress', 'done'],
  };

  getBoardData() {
    return this.boardData;
  }

  // [추가됨] 보드 상태 업데이트 메서드
  updateBoardData(newData: any) {
    this.boardData = newData;
    return { success: true, message: '보드 상태가 동기화되었습니다.' };
  }
}
