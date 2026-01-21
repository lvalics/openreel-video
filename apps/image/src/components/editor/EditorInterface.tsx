import { Toolbar } from './toolbar/Toolbar';
import { LeftPanel } from './panels/LeftPanel';
import { Canvas } from './canvas/Canvas';
import { Inspector } from './inspector/Inspector';
import { LayerPanel } from './layers/LayerPanel';
import { useUIStore } from '../../stores/ui-store';
import { useProjectStore } from '../../stores/project-store';

export function EditorInterface() {
  const { isPanelCollapsed, isInspectorCollapsed } = useUIStore();
  const { project } = useProjectStore();

  if (!project) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No project loaded</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {!isPanelCollapsed && (
          <div className="w-72 border-r border-border flex flex-col bg-card">
            <LeftPanel />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
        </div>

        {!isInspectorCollapsed && (
          <div className="w-72 border-l border-border flex flex-col bg-card">
            <div className="flex-1 overflow-y-auto">
              <Inspector />
            </div>
            <div className="h-64 border-t border-border">
              <LayerPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
