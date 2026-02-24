"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanProvider, useKanbanStore } from '../store/kanbanStore';

function Board() {
  const [isMounted, setIsMounted] = useState(false);
  // 스토어에서 데이터와 로딩 상태, 페치 함수를 가져옴
  const { data, isLoading, fetchBoardData, moveCard } = useKanbanStore((state) => state);

  useEffect(() => {
    setIsMounted(true);
    fetchBoardData(); // 백엔드 API 호출
  }, [fetchBoardData]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    moveCard(source, destination, draggableId);
  };

  // 마운트 전이거나 데이터를 불러오는 중일 때 로딩 화면 표출
  if (!isMounted || isLoading || !data) {
    return <div className="text-center text-gray-500 mt-20">보드 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

          return (
            <div key={column.id} className="bg-gray-200 p-4 rounded-xl w-80 flex-shrink-0 flex flex-col">
              <h2 className="font-bold text-gray-700 mb-4">{column.title}</h2>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-grow min-h-[200px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-300' : 'bg-transparent'
                    }`}
                  >
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-gray-50'
                            }`}
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

export default function KanbanPage() {
  return (
    <KanbanProvider>
      <div className="min-h-screen bg-gray-100 p-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Atoms Board (MVP) - API 연동 완료</h1>
        <Board />
      </div>
    </KanbanProvider>
  );
}
