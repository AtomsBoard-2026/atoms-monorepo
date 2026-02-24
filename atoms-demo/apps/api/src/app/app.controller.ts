import { Body, Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('board')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getBoard() {
    return this.appService.getBoardData();
  }

  // [추가됨] 상태 업데이트 API (PUT /api/board)
  @Put()
  updateBoard(@Body() newData: any) {
    return this.appService.updateBoardData(newData);
  }
}
