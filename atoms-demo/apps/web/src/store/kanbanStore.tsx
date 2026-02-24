"use client";

import { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

// 데이터 타입 정의
type KanbanData = {
  columns: Record<string, { id: string; title: string; taskIds: string[] }>;
  tasks: Record<string, { id: string; content: string }>;
  columnOrder: string[];
};

interface KanbanState {
  data: KanbanData | null;
  isLoading: boolean;
  fetchBoardData: () => Promise<void>;
  moveCard: (source: any, destination: any, draggableId: string) => Promise<void>;
}

const createKanbanStore = () => {
  return createStore<KanbanState>()((set, get) => ({
    data: null,
    isLoading: true,

    // 1. 초기 데이터 조회 (GET)
    fetchBoardData: async () => {
      try {
        const response = await fetch('http://localhost:3333/api/board');
        if (!response.ok) throw new Error('서버 통신 실패');
        const data = await response.json();
        set({ data, isLoading: false });
      } catch (error) {
        console.error('API 연동 실패:', error);
        set({ data: null, isLoading: false });
      }
    },

    // 2. 카드 이동 및 동기화 (Optimistic Update + PUT)
    moveCard: async (source, destination, draggableId) => {
      const currentData = get().data;
      if (!currentData) return;

      // (1) 낙관적 업데이트: 화면부터 즉시 변경하여 렉을 없앰
      const newData = JSON.parse(JSON.stringify(currentData)); // Deep Copy

      const startColumn = newData.columns[source.droppableId];
      const finishColumn = newData.columns[destination.droppableId];

      if (startColumn === finishColumn) {
        // 같은 컬럼 내 이동
        startColumn.taskIds.splice(source.index, 1);
        startColumn.taskIds.splice(destination.index, 0, draggableId);
      } else {
        // 다른 컬럼으로 이동
        startColumn.taskIds.splice(source.index, 1);
        finishColumn.taskIds.splice(destination.index, 0, draggableId);
      }

      // 화면 갱신
      set({ data: newData });

      // (2) 백그라운드 동기화: 변경된 데이터를 서버로 전송
      try {
        await fetch('http://localhost:3333/api/board', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        });
      } catch (error) {
        console.error('동기화 실패:', error);
        // 에러 발생 시 원래 데이터로 롤백하는 로직을 여기에 추가할 수 있음
        alert('서버 저장에 실패했습니다.');
      }
    }
  }));
};

export type KanbanStoreApi = ReturnType<typeof createKanbanStore>;
export const KanbanStoreContext = createContext<KanbanStoreApi | undefined>(undefined);

export const KanbanProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<KanbanStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createKanbanStore();
  }
  return (
    <KanbanStoreContext.Provider value={storeRef.current}>
      {children}
    </KanbanStoreContext.Provider>
  );
};

export const useKanbanStore = <T,>(selector: (store: KanbanState) => T): T => {
  const context = useContext(KanbanStoreContext);
  if (!context) throw new Error('Provider 에러');
  return useStore(context, selector);
};
