import { History, Undo2, Redo2, Trash2, Clock } from 'lucide-react';
import { useHistoryStore } from '../../../stores/history-store';
import { useProjectStore } from '../../../stores/project-store';
import { formatDistanceToNow } from '../../../utils/time';

export function HistoryPanel() {
  const { entries, currentIndex, clear, canUndo, canRedo } = useHistoryStore();
  const { loadProject } = useProjectStore();
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  const handleUndo = () => {
    const state = undo();
    if (state) {
      loadProject(state);
    }
  };

  const handleRedo = () => {
    const state = redo();
    if (state) {
      loadProject(state);
    }
  };

  const handleJumpToState = (index: number) => {
    if (index === currentIndex) return;

    const entry = entries[index];
    if (entry) {
      const state = JSON.parse(entry.state);
      loadProject(state);
      useHistoryStore.setState({ currentIndex: index });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <History size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">History</h3>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
            {entries.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
          </button>
          <button
            onClick={clear}
            disabled={entries.length === 0}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Clear history"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Clock size={32} className="text-muted-foreground/50 mb-3" />
            <p className="text-xs text-muted-foreground">No history yet</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Your actions will appear here
            </p>
          </div>
        ) : (
          <div className="py-1">
            {[...entries].reverse().map((entry, reverseIndex) => {
              const index = entries.length - 1 - reverseIndex;
              const isCurrent = index === currentIndex;
              const isFuture = index > currentIndex;

              return (
                <button
                  key={entry.id}
                  onClick={() => handleJumpToState(index)}
                  className={`w-full flex items-start gap-2 px-3 py-2 text-left transition-colors ${
                    isCurrent
                      ? 'bg-primary/10 border-l-2 border-primary'
                      : isFuture
                      ? 'opacity-50 hover:opacity-75 hover:bg-accent/50'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    isCurrent ? 'bg-primary' : isFuture ? 'bg-muted-foreground/30' : 'bg-muted-foreground/50'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs truncate ${
                      isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}>
                      {entry.description}
                    </p>
                    <p className="text-[9px] text-muted-foreground/70">
                      {formatDistanceToNow(entry.timestamp)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
