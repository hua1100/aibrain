import type { BingoBoard } from '@/types';

interface MandalartViewProps {
    currentBoard: BingoBoard;
    onNavigate: (boardId: string) => void;
}

export function MandalartView({ currentBoard, onNavigate }: MandalartViewProps) {
    // 確保是 Mandalart 類型的板
    if (currentBoard.type !== 'mandalart') return null;

    // 如果有 parentId，表示是子板
    if (currentBoard.parentId && currentBoard.rootId) {
        return (
            <div className="flex flex-col items-center mb-6">
                <div className="mb-2 text-sm text-gray-500">
                    正在檢視子目標
                </div>
                <button
                    onClick={() => onNavigate(currentBoard.parentId!)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    回到核心目標
                </button>
            </div>
        );
    }

    // 如果是核心板 (沒有 parentId 但有 rootId，或者它是 root)
    // 注意：createMandalartSet 中 rootBoard 也有 rootId (它自己)
    return (
        <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-indigo-900">曼陀羅核心目標</h2>
            <p className="text-sm text-gray-500 mt-1">點擊周圍格子進入子目標規劃</p>
        </div>
    );
}
